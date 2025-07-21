import React, { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 解决Leaflet默认图标问题
// 通常Leaflet默认图标无法正确加载，需要手动指定
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// 自定义标记图标
export const createCustomIcon = (color: string, size: number) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
};

// 地图自动适应边界组件
interface ServerItem {
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
}

export const FitBounds: FC<{ servers: ServerItem[] }> = ({ servers }) => {
    const map = useMap();
    
    React.useEffect(() => {
        if (servers.length === 0) return;
        
        const bounds = L.latLngBounds(
            servers.map(server => [server.location.latitude, server.location.longitude])
        );
        
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, servers]);
    
    return null;
};

// 类型定义
const LeafletComponents = {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
    L,
    FitBounds,
    createCustomIcon
};

export type { ServerItem };

// 导出所有需要的组件
export {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
    L
};

export default LeafletComponents; 