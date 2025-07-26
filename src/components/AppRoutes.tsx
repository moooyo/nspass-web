import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { routeConfigs } from '@/config/routes';

interface AppRoutesProps {
  redirectTo?: string;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ redirectTo = '/home' }) => {
  return (
    <RouterRoutes>
      {/* 根路径重定向 */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* 主要路由 */}
      {routeConfigs.map(route => {
        const Component = route.component;
        return (
          <Route 
            key={route.key}
            path={route.path} 
            element={<Component />} 
          />
        );
      })}
      
      {/* 别名路由 */}
      {routeConfigs
        .filter(route => route.aliases && route.aliases.length > 0)
        .flatMap(route => 
          route.aliases!.map(alias => {
            const Component = route.component;
            return (
              <Route 
                key={`${route.key}-${alias}`}
                path={alias} 
                element={<Component />} 
              />
            );
          })
        )
      }
      
      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to={redirectTo} replace />} />
    </RouterRoutes>
  );
};
