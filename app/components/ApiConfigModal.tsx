'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, message, Typography, Alert, Space } from 'antd';
import { SettingOutlined, ApiOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useApiBaseUrl } from '@/utils/runtime-env';

const { Text, Title } = Typography;

interface ApiConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ visible, onClose }) => {
  const [currentApiUrl, updateApiUrl, clearApiUrl] = useApiBaseUrl();
  const [tempUrl, setTempUrl] = useState(currentApiUrl);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    if (!tempUrl.trim()) {
      message.error('API URL 不能为空');
      return;
    }

    try {
      new URL(tempUrl);
      updateApiUrl(tempUrl);
      message.success('API URL 已更新');
      onClose();
    } catch {
      message.error('请输入有效的 URL 格式');
    }
  };

  const handleReset = () => {
    clearApiUrl();
    setTempUrl(currentApiUrl);
    message.success('已重置为默认配置');
  };

  const handleTest = async () => {
    if (!tempUrl.trim()) {
      message.error('请先输入 API URL');
      return;
    }

    try {
      setTesting(true);
      const testUrl = tempUrl.endsWith('/') ? tempUrl.slice(0, -1) : tempUrl;
      const response = await fetch(`${testUrl}/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10秒超时
      });

      if (response.ok) {
        message.success('API 连接测试成功');
      } else {
        message.warning(`API 连接测试返回状态码: ${response.status}`);
      }
    } catch (error) {
      console.error('API 测试失败:', error);
      message.error('API 连接测试失败，请检查 URL 是否正确');
    } finally {
      setTesting(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isCustomUrl = currentApiUrl !== 'http://localhost:8080' && currentApiUrl !== 'https://api.nspass.com';

  return (
    <Modal
      title={
        <Space>
          <ApiOutlined />
          <span>API 配置</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置默认
        </Button>,
        <Button key="test" onClick={handleTest} loading={testing}>
          测试连接
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="API 基础地址配置"
          description={
            <div>
              <p>当前 API 地址: <Text code>{currentApiUrl}</Text></p>
              <p>
                {isCustomUrl ? (
                  <Text type="warning">
                    <ExclamationCircleOutlined /> 正在使用自定义配置
                  </Text>
                ) : (
                  <Text type="success">
                    <CheckCircleOutlined /> 使用默认配置
                  </Text>
                )}
              </p>
            </div>
          }
          type={currentApiUrl.includes('localhost') && process.env.NODE_ENV === 'production' ? 'warning' : 'info'}
          showIcon
        />

        <div>
          <Title level={5}>API 基础地址</Title>
          <Input
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="https://api.example.com"
            status={tempUrl && !isValidUrl(tempUrl) ? 'error' : undefined}
            prefix={<ApiOutlined />}
          />
          {tempUrl && !isValidUrl(tempUrl) && (
            <Text type="danger" style={{ fontSize: '12px' }}>
              请输入有效的 URL 格式
            </Text>
          )}
        </div>

        <Alert
          message="配置说明"
          description={
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>请输入完整的 API 基础地址，包含协议（http:// 或 https://）</li>
              <li>生产环境建议使用 HTTPS 协议</li>
              <li>配置会保存在浏览器本地存储中</li>
              <li>重置将恢复到环境变量或默认配置</li>
            </ul>
          }
          type="info"
          showIcon={false}
        />
      </Space>
    </Modal>
  );
};

// API 配置按钮组件
export const ApiConfigButton: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={() => setModalVisible(true)}
        size="small"
        type="text"
        title="API 配置"
      >
        API 配置
      </Button>
      <ApiConfigModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
