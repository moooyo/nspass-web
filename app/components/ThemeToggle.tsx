'use client';

import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import { 
  SunOutlined, 
  MoonOutlined, 
  DesktopOutlined,
  CheckOutlined 
} from '@ant-design/icons';
import { useTheme } from './hooks/useTheme';
import type { MenuProps } from 'antd';
import type { Theme } from '@/config/theme.config';

interface ThemeToggleProps {
  size?: 'small' | 'middle' | 'large';
  showLabel?: boolean;
  placement?: 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight';
}

const THEME_OPTIONS: Array<{
  key: Theme;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    key: 'light',
    label: '浅色模式',
    icon: <SunOutlined />,
    description: '始终使用浅色主题',
  },
  {
    key: 'dark',
    label: '深色模式',
    icon: <MoonOutlined />,
    description: '始终使用深色主题',
  },
  {
    key: 'system',
    label: '跟随系统',
    icon: <DesktopOutlined />,
    description: '自动跟随系统主题设置',
  },
];

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'middle',
  showLabel = false,
  placement = 'bottomRight',
}) => {
  const { theme, resolvedTheme, setTheme, systemInfo } = useTheme();

  // 获取当前主题的图标
  const getCurrentIcon = () => {
    switch (resolvedTheme) {
      case 'dark':
        return <MoonOutlined />;
      case 'light':
        return <SunOutlined />;
      default:
        return <SunOutlined />;
    }
  };

  // 构建菜单项
  const menuItems: MenuProps['items'] = THEME_OPTIONS.map((option) => ({
    key: option.key,
    label: (
      <div className="theme-option">
        <div className="theme-option-header">
          <span className="theme-option-icon">{option.icon}</span>
          <span className="theme-option-label">{option.label}</span>
          {theme === option.key && (
            <CheckOutlined className="theme-option-check" />
          )}
        </div>
        <div className="theme-option-description">
          {option.description}
        </div>
      </div>
    ),
    onClick: () => setTheme(option.key),
  }));

  // 如果在system模式下，显示实际解析的主题信息
  const getTooltipTitle = () => {
    if (theme === 'system') {
      return `跟随系统主题 (当前: ${resolvedTheme === 'dark' ? '深色' : '浅色'})`;
    }
    return THEME_OPTIONS.find(opt => opt.key === theme)?.description || '';
  };

  return (
    <>
      <style jsx global>{`
        .ant-dropdown {
          z-index: 2000 !important;
        }
        
        .ant-dropdown-menu {
          z-index: 2001 !important;
          box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
          border-radius: 8px !important;
          border: 1px solid var(--border-color) !important;
          background: var(--bg-primary) !important;
        }
        
        .ant-dropdown-menu-item {
          padding: 8px 12px !important;
        }
        
        .ant-dropdown-menu-item:hover {
          background: var(--bg-secondary) !important;
        }
      `}</style>
      
      <style jsx>{`
        .theme-option {
          padding: 4px 0;
          min-width: 180px;
        }
        
        .theme-option-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        
        .theme-option-icon {
          color: var(--primary-blue);
          width: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .theme-option-label {
          font-weight: 500;
          flex: 1;
        }
        
        .theme-option-check {
          color: var(--primary-blue);
          font-size: 12px;
        }
        
        .theme-option-description {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-left: 24px;
        }
        
        .theme-toggle-button {
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px !important;
        }
        
        .theme-toggle-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(24, 144, 255, 0.2);
        }
      `}</style>
      
      <Dropdown
        menu={{ items: menuItems }}
        placement={placement}
        trigger={['click']}
        arrow={{ pointAtCenter: true }}
        overlayStyle={{ zIndex: 2000 }}
        destroyPopupOnHide={true}
      >
        <Tooltip title={getTooltipTitle()} placement="left">
          <Button
            className="theme-toggle-button"
            type="text"
            size={size}
            icon={getCurrentIcon()}
          >
            {showLabel && (
              <span>
                {theme === 'system' 
                  ? `跟随系统 (${resolvedTheme === 'dark' ? '深色' : '浅色'})`
                  : THEME_OPTIONS.find(opt => opt.key === theme)?.label
                }
              </span>
            )}
          </Button>
        </Tooltip>
      </Dropdown>
    </>
  );
};

export default ThemeToggle; 