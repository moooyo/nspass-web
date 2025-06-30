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
  const { theme, resolvedTheme, setTheme } = useTheme();

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
      <div style={{ padding: '4px 0', minWidth: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ color: 'var(--primary-blue)', width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {option.icon}
          </span>
          <span style={{ fontWeight: 500, flex: 1 }}>{option.label}</span>
          {theme === option.key && (
            <CheckOutlined style={{ color: 'var(--primary-blue)', fontSize: '12px' }} />
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '24px' }}>
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
    <Dropdown
      menu={{ items: menuItems }}
      placement={placement}
      trigger={['click']}
      arrow={{ pointAtCenter: true }}
      destroyOnHidden={true}
    >
      <Tooltip title={getTooltipTitle()} placement="left">
        <Button
          type="text"
          size={size}
          icon={getCurrentIcon()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px'
          }}
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
  );
};

export default ThemeToggle; 