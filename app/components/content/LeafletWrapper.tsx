import React, { useEffect, useMemo } from 'react';
import { Tag } from 'antd';
import LeafletComponents from './LeafletComponents';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复 Leaflet 图标类型
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

// 服务器数据类型定义
export type ServerItem = {
  id: string;
  name: string;
  type: 'NORMAL' | 'EXIT';
  ip: string;
  location: {
    country: string;
    latitude: number;
    longitude: number;
    x: number;
    y: number;
  };
};

type WorldMapProps = {
  selectedPath: ServerItem[];
  sampleServers: ServerItem[];
  exitServer: ServerItem | null;
  handleServerSelect: (server: ServerItem) => void;
  serverTypeEnum: {
    NORMAL: { text: string; color: string };
    EXIT: { text: string; color: string };
  };
};

const LeafletWrapper: React.FC<WorldMapProps> = ({
  selectedPath,
  sampleServers,
  exitServer,
  handleServerSelect,
  serverTypeEnum,
}) => {
  // 修复 Leaflet 默认图标问题
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      // 删除已有图标定义以防止重复
      delete ((L.Icon.Default.prototype as IconDefault)._getIconUrl);

      // 重新配置默认图标
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

  // 使用 useMemo 缓存服务器过滤逻辑，避免每次渲染重新计算
  const serversToShow = useMemo(() => {
    return sampleServers.filter(server => 
      server.type === 'NORMAL' || (exitServer && server.id === exitServer.id)
    );
  }, [sampleServers, exitServer]);

  // 使用 useMemo 缓存路径点计算
  const pathPoints = useMemo(() => {
    const points = [...selectedPath];
    if (exitServer) {
      points.push(exitServer);
    }
    return points;
  }, [selectedPath, exitServer]);

  // 使用 useMemo 缓存边界服务器
  const boundServers = useMemo(() => {
    return pathPoints.length > 0 ? pathPoints : serversToShow;
  }, [pathPoints, serversToShow]);

  const MapComponent = LeafletComponents.MapContainer;
  const TileLayerComponent = LeafletComponents.TileLayer;
  const FitBoundsComponent = LeafletComponents.FitBounds;
  const PolylineComponent = LeafletComponents.Polyline;
  const MarkerComponent = LeafletComponents.Marker;
  const PopupComponent = LeafletComponents.Popup;
  const createCustomIconFn = LeafletComponents.createCustomIcon;

  if (!MapComponent || !TileLayerComponent) {
    console.error('Leaflet组件未正确加载:', LeafletComponents);
    return <div style={{ height: '100%', minHeight: 500, background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      Leaflet地图组件加载失败
    </div>;
  }

  return (
    <div style={{ height: '100%', minHeight: 500 }}>
      <MapComponent
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayerComponent
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBoundsComponent servers={boundServers} />
        
        {/* 绘制路径线（连接所有中继服务器并连接到出口规则） */}
        {pathPoints.length > 1 && (
          <PolylineComponent
            positions={pathPoints.map(server => [server.location.latitude, server.location.longitude])}
            color="blue"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
        
        {/* 渲染服务器标记 */}
        {serversToShow.map((server) => {
          const isRelaySelected = selectedPath.some(s => s.id === server.id);
          const isExitSelected = exitServer && server.id === exitServer.id;
          const isSelected = isRelaySelected || isExitSelected;
          const isFirstRelay = selectedPath.length > 0 && selectedPath[0].id === server.id;
          
          // 获取标记点颜色
          const getMarkerColor = () => {
            // 已选择的中继服务器
            if (isRelaySelected) {
              // 第一个中继服务器为绿色
              if (isFirstRelay) {
                return '#52c41a'; // 绿色
              }
              return '#1677ff'; // 蓝色
            }
            // 已选择的出口规则为橘红色
            if (isExitSelected) {
              return '#f5222d'; // 橘红色
            }
            // 未选择的服务器
            if (server.type === 'EXIT') {
              return '#fa8c16'; // 橙色
            }
            return '#69c0ff'; // 浅蓝色
          };
          
          const icon = createCustomIconFn(
            getMarkerColor(),
            isSelected ? 16 : 12
          );
          
          return (
            <MarkerComponent
              key={server.id}
              position={[server.location.latitude, server.location.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => handleServerSelect(server),
              }}
            >
              <PopupComponent>
                <div>
                  <strong>{server.name}</strong><br />
                  <Tag color={serverTypeEnum[server.type].color}>
                    {serverTypeEnum[server.type].text}
                  </Tag><br />
                  IP: {server.ip}<br />
                  位置: {server.location.country}
                </div>
              </PopupComponent>
            </MarkerComponent>
          );
        })}
      </MapComponent>
    </div>
  );
};

export default React.memo(LeafletWrapper); 