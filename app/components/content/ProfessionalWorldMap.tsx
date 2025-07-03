import React, { useMemo, useState } from 'react';
import { Card, Typography, Row, Col, Tooltip } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import RoutesSummary, { type CountryRouteStats } from './RoutesSummary';
// @ts-ignore - react-simple-maps类型兼容性问题
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Line } from 'react-simple-maps';
import { useTheme } from '../hooks/useTheme';
import type { ServerItem } from '@/types/generated/api/servers/server_management';
import { ServerStatus } from '@/types/generated/api/servers/server_management';

const { Title, Text } = Typography;

// 扩展的服务器类型
export interface ExtendedServerItem extends ServerItem {
  coordinates?: { latitude: number; longitude: number };
  flag?: string;
}

// 地理位置坐标映射（使用标准经纬度坐标）
const COUNTRY_COORDINATES: Record<string, { longitude: number; latitude: number; flag: string }> = {
  'China': { longitude: 104.1954, latitude: 35.8617, flag: '🇨🇳' },
  'United States': { longitude: -95.7129, latitude: 37.0902, flag: '🇺🇸' },
  'Japan': { longitude: 138.2529, latitude: 36.2048, flag: '🇯🇵' },
  'Germany': { longitude: 10.4515, latitude: 51.1657, flag: '🇩🇪' },
  'Singapore': { longitude: 103.8198, latitude: 1.3521, flag: '🇸🇬' },
  'Hong Kong': { longitude: 114.1694, latitude: 22.3193, flag: '🇭🇰' },
  'United Kingdom': { longitude: -3.4360, latitude: 55.3781, flag: '🇬🇧' },
  'France': { longitude: 2.2137, latitude: 46.2276, flag: '🇫🇷' },
  'Canada': { longitude: -106.3468, latitude: 56.1304, flag: '🇨🇦' },
  'Australia': { longitude: 133.7751, latitude: -25.2744, flag: '🇦🇺' }
};

// 国家名称标准化映射（与RoutesSummary保持一致）
const COUNTRY_NAME_MAPPING: Record<string, string> = {
  // 中文到英文映射
  '中国': 'China',
  '美国': 'United States',
  '日本': 'Japan',
  '德国': 'Germany',
  '新加坡': 'Singapore',
  '中国香港': 'Hong Kong',
  '香港': 'Hong Kong',
  '英国': 'United Kingdom',
  '法国': 'France',
  '加拿大': 'Canada',
  '澳大利亚': 'Australia',
  // 常见别名映射
  'USA': 'United States',
  'US': 'United States',
  'UK': 'United Kingdom',
  'JP': 'Japan',
  'DE': 'Germany',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'CN': 'China',
  'AU': 'Australia',
  'CA': 'Canada',
  'FR': 'France'
};

// 标准化国家名称
const standardizeCountryName = (countryName: string): string => {
  return COUNTRY_NAME_MAPPING[countryName] || countryName;
};

// 国家统计类型
interface CountryStats {
  country: string;
  flag: string;
  coordinates: { longitude: number; latitude: number };
  total: number;
  online: number;
  servers: ExtendedServerItem[];
}

interface ProfessionalWorldMapProps {
  servers: ExtendedServerItem[];
  style?: React.CSSProperties;
}

// 计算两点之间的最短路径（考虑地球是球体和地图投影）
const calculateOptimalPath = (
  fromCoords: { longitude: number; latitude: number },
  toCoords: { longitude: number; latitude: number },
  fromCountry: string,
  toCountry: string
): { from: [number, number]; to: [number, number] } => {
  let fromLng = fromCoords.longitude;
  let toLng = toCoords.longitude;
  
  // 计算经度差的绝对值
  let directDiff = Math.abs(toLng - fromLng);
  
  // 计算跨日期变更线的距离
  let wrapDiff = 360 - directDiff;
  
  // 特殊处理：亚洲到美洲的连线应该通过太平洋
  const asianCountries = ['China', 'Japan', 'Hong Kong', 'Singapore'];
  const americanCountries = ['United States', 'Canada'];
  
  const isAsiaToAmerica = asianCountries.includes(fromCountry) && americanCountries.includes(toCountry);
  const isAmericaToAsia = americanCountries.includes(fromCountry) && asianCountries.includes(toCountry);
  
  if (isAsiaToAmerica || isAmericaToAsia) {
    // 亚洲到美洲：强制通过太平洋（向东）
    if (fromLng > 0 && toLng < 0) {
      toLng += 360; // 美洲坐标加360，让连线向东走
    } else if (fromLng < 0 && toLng > 0) {
      fromLng += 360; // 如果起点在美洲，加360
    }
    
    console.log(`🌏 跨太平洋连线 ${fromCountry} -> ${toCountry}:`, {
      原始坐标: [fromCoords.longitude, toCoords.longitude],
      调整后: [fromLng, toLng],
      路径: '太平洋'
    });
  } else {
    // 其他情况：选择最短路径
    if (wrapDiff < directDiff) {
      if (fromLng > toLng) {
        toLng += 360;
      } else {
        fromLng += 360;
      }
      
      console.log(`🌍 环绕连线 ${fromCountry} -> ${toCountry}:`, {
        原始坐标: [fromCoords.longitude, toCoords.longitude],
        直接距离: directDiff.toFixed(1),
        环绕距离: wrapDiff.toFixed(1),
        调整后: [fromLng, toLng],
        路径: '最短路径（环绕）'
      });
    } else {
      console.log(`🌍 直线连线 ${fromCountry} -> ${toCountry}:`, {
        原始坐标: [fromCoords.longitude, toCoords.longitude],
        直接距离: directDiff.toFixed(1),
        环绕距离: wrapDiff.toFixed(1),
        路径: '直线路径'
      });
    }
  }
  
  return {
    from: [fromLng, fromCoords.latitude],
    to: [toLng, toCoords.latitude]
  };
};

const ProfessionalWorldMap: React.FC<ProfessionalWorldMapProps> = ({ servers, style }) => {
  const { theme: currentTheme } = useTheme();
  const [routeStats, setRouteStats] = useState<CountryRouteStats[]>([]);

  // 按国家统计服务器
  const countryStats = useMemo((): CountryStats[] => {
    const stats = new Map<string, CountryStats>();
    
    servers.forEach(server => {
      const originalCountry = server.country || 'Unknown';
      const country = standardizeCountryName(originalCountry);
      const coordinates = COUNTRY_COORDINATES[country];
      
      if (coordinates) {
        if (!stats.has(country)) {
          stats.set(country, {
            country,
            flag: coordinates.flag,
            coordinates,
            total: 0,
            online: 0,
            servers: []
          });
        }
        
        const countryStat = stats.get(country)!;
        countryStat.total += 1;
        countryStat.servers.push(server);
        
        if (server.status === ServerStatus.SERVER_STATUS_ONLINE) {
          countryStat.online += 1;
        }
      } else {
        console.warn(`ProfessionalWorldMap - 未找到国家坐标: "${originalCountry}" -> "${country}"`);
      }
    });
    
    return Array.from(stats.values()).sort((a, b) => b.total - a.total);
  }, [servers]);

  // 获取标记点颜色
  const getMarkerColor = (countryStat: CountryStats): string => {
    if (countryStat.online === 0) return '#ff4d4f'; // 全部离线 - 红色
    if (countryStat.online === countryStat.total) return '#52c41a'; // 全部在线 - 绿色
    return '#fa8c16'; // 部分在线 - 橙色
  };

  // 处理路由统计数据变化
  const handleRouteStatsChange = (stats: CountryRouteStats[]) => {
    console.log('ProfessionalWorldMap - 收到路由统计数据:', stats);
    setRouteStats(stats);
  };

  return (
    <Card
      title={
        <Title level={4} style={{ 
          margin: 0, 
          color: currentTheme === 'light' ? '#333' : '#fff',
          display: 'flex',
          alignItems: 'center'
        }}>
          <GlobalOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          线路分布概览
        </Title>
      }
      className="modern-card"
      style={style}
      styles={{ body: { padding: '20px' } }}
    >
      <Row gutter={[24, 24]}>
        {/* 线路汇总 */}
                 <Col xs={24} lg={10}>
          <RoutesSummary onRouteStatsChange={handleRouteStatsChange} />
        </Col>

        {/* 服务器分布地图 */}
        <Col xs={24} lg={14}>
          <div style={{
            background: currentTheme === 'light' 
              ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' 
              : 'linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)',
            borderRadius: '12px',
            padding: '20px',
            height: '450px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [120, 20] // 以亚洲为中心（经度120度，约为中国中心）
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup>
                <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                  {({ geographies }: any) =>
                    geographies.map((geo: any) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={currentTheme === 'light' 
                          ? 'rgba(0, 0, 0, 0.08)' 
                          : 'rgba(255, 255, 255, 0.12)'
                        }
                        stroke={currentTheme === 'light' 
                          ? 'rgba(0, 0, 0, 0.1)' 
                          : 'rgba(255, 255, 255, 0.15)'
                        }
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { 
                            outline: 'none',
                            fill: currentTheme === 'light' 
                              ? 'rgba(24, 144, 255, 0.1)' 
                              : 'rgba(24, 144, 255, 0.2)'
                          },
                          pressed: { outline: 'none' }
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* 路由连线 - 使用优化的路径计算 */}
                {routeStats.map((route, index) => {
                  const fromCoords = COUNTRY_COORDINATES[route.fromCountry];
                  const toCoords = COUNTRY_COORDINATES[route.toCountry];
                  
                  if (!fromCoords || !toCoords) {
                    console.warn(`ProfessionalWorldMap - 无法找到国家坐标: "${route.fromCountry}" -> "${route.toCountry}"`);
                    console.warn('可用的国家坐标:', Object.keys(COUNTRY_COORDINATES));
                    return null;
                  }
                  
                  // 计算最优路径（避免跨大西洋的错误连线）
                  const optimalPath = calculateOptimalPath(fromCoords, toCoords, route.fromCountry, route.toCountry);
                  
                  const isFullyOnline = route.onlineRoutes === route.totalRoutes;
                  const hasOnlineRoutes = route.onlineRoutes > 0;
                  
                  return (
                    <Line
                      key={`${route.fromCountry}-${route.toCountry}-${index}`}
                      from={optimalPath.from}
                      to={optimalPath.to}
                      stroke={hasOnlineRoutes ? '#52c41a' : '#ff4d4f'}
                      strokeWidth={Math.max(2, Math.min(6, route.totalRoutes * 1.5))}
                      strokeOpacity={0.8}
                      strokeDasharray={isFullyOnline ? undefined : '8,4'}
                      strokeLinecap="round"
                      style={{ pointerEvents: 'none' }}
                    />
                  );
                })}

                {/* 服务器标记点 */}
                {countryStats.map((countryStat, index) => (
                  <Marker
                    key={index}
                    coordinates={[countryStat.coordinates.longitude, countryStat.coordinates.latitude]}
                  >
                    <Tooltip
                      title={
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {countryStat.flag} {countryStat.country}
                          </div>
                          <div>总服务器: {countryStat.total}</div>
                          <div>在线: {countryStat.online}</div>
                          <div>离线: {countryStat.total - countryStat.online}</div>
                        </div>
                      }
                      placement="top"
                    >
                      <g>
                        {/* 主标记点 */}
                        <circle
                          r={Math.max(8, Math.min(24, countryStat.total * 3))}
                          fill={getMarkerColor(countryStat)}
                          stroke="white"
                          strokeWidth="2"
                          style={{ cursor: 'pointer', opacity: 0.9 }}
                        />
                        
                        {/* 服务器数量文字 */}
                        <text
                          textAnchor="middle"
                          y={4}
                          fontSize="12"
                          fill="white"
                          fontWeight="bold"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {countryStat.total}
                        </text>
                      </g>
                    </Tooltip>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>

            {/* 图例 */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: currentTheme === 'light' 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: currentTheme === 'light' 
                ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: currentTheme === 'light' 
                ? '1px solid rgba(0, 0, 0, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              minWidth: '160px',
              fontSize: '12px'
            }}>
              <div style={{ 
                fontSize: 11, 
                fontWeight: 'bold',
                color: currentTheme === 'light' ? '#666' : '#ccc',
                marginBottom: 8
              }}>
                服务器状态
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#52c41a',
                  border: '2px solid white'
                }} />
                <Text style={{ 
                  fontSize: 11,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>
                  全部在线
                </Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#fa8c16',
                  border: '2px solid white'
                }} />
                <Text style={{ 
                  fontSize: 11,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>
                  部分在线
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#ff4d4f',
                  border: '2px solid white'
                }} />
                <Text style={{ 
                  fontSize: 11,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>
                  全部离线
                </Text>
              </div>
              
              {/* 路由连线 */}
              <div style={{ 
                fontSize: 11, 
                fontWeight: 'bold',
                color: currentTheme === 'light' ? '#666' : '#ccc',
                borderBottom: currentTheme === 'light' 
                  ? '1px solid rgba(0, 0, 0, 0.1)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                paddingBottom: 4,
                marginBottom: 4,
                marginTop: 8
              }}>
                路由连线
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 16,
                  height: 3,
                  background: '#52c41a',
                  borderRadius: '2px'
                }} />
                <Text style={{ 
                  fontSize: 11,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>
                  有在线路由
                </Text>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 16,
                  height: 3,
                  background: '#ff4d4f',
                  borderRadius: '2px',
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)'
                }} />
                <Text style={{ 
                  fontSize: 11,
                  color: currentTheme === 'light' ? '#333' : '#fff'
                }}>
                  全部离线
                </Text>
              </div>

              {/* 调试信息 */}
              {routeStats.length > 0 && (
                <>
                  <div style={{ 
                    fontSize: 11, 
                    fontWeight: 'bold',
                    color: currentTheme === 'light' ? '#666' : '#ccc',
                    borderBottom: currentTheme === 'light' 
                      ? '1px solid rgba(0, 0, 0, 0.1)' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    paddingBottom: 4,
                    marginBottom: 4,
                    marginTop: 8
                  }}>
                    当前连线 ({routeStats.length})
                  </div>
                  
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {routeStats.map((route, index) => {
                      const fromCoords = COUNTRY_COORDINATES[route.fromCountry];
                      const toCoords = COUNTRY_COORDINATES[route.toCountry];
                      
                      // 计算路径类型用于显示
                      let pathType = '直线';
                      if (fromCoords && toCoords) {
                        const asianCountries = ['China', 'Japan', 'Hong Kong', 'Singapore'];
                        const americanCountries = ['United States', 'Canada'];
                        const isAsiaToAmerica = asianCountries.includes(route.fromCountry) && americanCountries.includes(route.toCountry);
                        const isAmericaToAsia = americanCountries.includes(route.fromCountry) && asianCountries.includes(route.toCountry);
                        
                        if (isAsiaToAmerica || isAmericaToAsia) {
                          pathType = '🌏太平洋';
                        } else {
                          const directDiff = Math.abs(toCoords.longitude - fromCoords.longitude);
                          const wrapDiff = 360 - directDiff;
                          if (wrapDiff < directDiff) {
                            pathType = '🌍环绕';
                          }
                        }
                      }
                      
                      return (
                        <div key={index} style={{ 
                          fontSize: 10,
                          color: currentTheme === 'light' ? '#666' : '#ccc',
                          marginBottom: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <div style={{
                            width: 6,
                            height: 2,
                            background: route.onlineRoutes > 0 ? '#52c41a' : '#ff4d4f',
                            borderRadius: '1px'
                          }} />
                          <span>{route.fromCountry} → {route.toCountry}</span>
                          <span style={{ color: '#52c41a' }}>({route.onlineRoutes})</span>
                          <span style={{ color: '#1890ff', fontSize: 9 }}>{pathType}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ProfessionalWorldMap; 