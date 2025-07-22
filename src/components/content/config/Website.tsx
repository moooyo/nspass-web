import React, { useState, useEffect, useCallback } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Card, Button, Space } from 'antd';
import { ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import { 
    websiteConfigService, 
    UpdateWebsiteConfigData 
} from '@/services/websiteConfig';
import { message } from '@/utils/message';

const Website: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [agentReportBaseUrl, setAgentReportBaseUrl] = useState<string>('');
  const [form] = ProForm.useForm();
  const [agentForm] = ProForm.useForm(); // 为Agent表单单独创建Form实例

  // 加载网站配置
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await websiteConfigService.getWebsiteConfig();
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
      } else {
        message.error('加载网站配置失败');
      }
    } catch (error) {
      console.error('加载网站配置失败:', error);
      message.error('加载网站配置失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 加载Agent上报Base URL
  const loadAgentReportBaseUrl = useCallback(async () => {
    try {
      const response = await websiteConfigService.getAgentReportBaseUrl();
      console.log('Agent上报Base URL响应:', response);
      
      if (response.success && response.data?.data?.baseUrl) {
        const baseUrl = response.data.data.baseUrl;
        setAgentReportBaseUrl(baseUrl);
        agentForm.setFieldsValue({ agentReportBaseUrl: baseUrl });
        console.log('设置Agent上报Base URL:', baseUrl);
      } else {
        console.log('Agent上报Base URL响应失败或为空:', response);
      }
    } catch (error) {
      console.error('加载Agent上报Base URL失败:', error);
    }
  }, [agentForm]);

  // 监听agentReportBaseUrl变化并更新表单
  useEffect(() => {
    if (agentReportBaseUrl && agentForm) {
      console.log('更新Agent表单字段值:', agentReportBaseUrl); // 添加日志
      agentForm.setFieldsValue({ agentReportBaseUrl });
    }
  }, [agentReportBaseUrl, agentForm]);

  // 初始化加载配置
  useEffect(() => {
    loadConfig();
    loadAgentReportBaseUrl();
  }, [loadConfig, loadAgentReportBaseUrl]);

  const handleSubmit = async (values: UpdateWebsiteConfigData) => {
    try {
      setLoading(true);
      const response = await websiteConfigService.updateWebsiteConfig(values);
      if (response.success) {
        message.success('配置已保存');
      } else {
        message.error(response.message || '保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置为默认设置
  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await websiteConfigService.resetWebsiteConfig();
      if (response.success && response.data) {
        form.setFieldsValue(response.data);
        message.success('已重置为默认设置');
      } else {
        message.error(response.message || '重置配置失败');
      }
    } catch (error) {
      console.error('重置配置失败:', error);
      message.error('重置配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成邀请码
  const generateInviteCode = async () => {
    try {
      setLoading(true);
      const response = await websiteConfigService.generateInviteCode();
      if (response.success && response.data?.inviteCode) {
        form.setFieldValue('inviteCode', response.data.inviteCode);
        message.success('已生成新的邀请码');
      } else {
        message.error(response.message || '生成邀请码失败');
      }
    } catch (error) {
      console.error('生成邀请码失败:', error);
      message.error('生成邀请码失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新Agent上报Base URL
  const handleAgentReportBaseUrlSubmit = async (baseUrl: string) => {
    try {
      setLoading(true);
      console.log('正在保存Agent上报Base URL:', baseUrl); // 添加日志
      const response = await websiteConfigService.updateAgentReportBaseUrl(baseUrl);
      if (response.success) {
        setAgentReportBaseUrl(baseUrl);
        agentForm.setFieldsValue({ agentReportBaseUrl: baseUrl }); // 确保表单显示最新值
        message.success('Agent上报Base URL已保存');
        console.log('Agent上报Base URL保存成功'); // 添加日志
      } else {
        message.error(response.message || '保存Agent上报Base URL失败');
        console.log('Agent上报Base URL保存失败:', response); // 添加日志
      }
    } catch (error) {
      console.error('保存Agent上报Base URL失败:', error);
      message.error('保存Agent上报Base URL失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card 
        title="网站配置" 
        variant="outlined"
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadConfig}
              loading={loading}
            >
              刷新
            </Button>
            <Button 
              icon={<UndoOutlined />} 
              onClick={handleReset}
              loading={loading}
            >
              重置为默认
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <ProForm
          form={form}
          onFinish={handleSubmit}
          loading={loading}
          submitter={{
            searchConfig: {
              submitText: '保存配置',
              resetText: '取消',
            },
            resetButtonProps: {
              style: {
                marginLeft: 8,
              },
            },
          }}
        >
          <ProFormText
            name="siteName"
            label="站点名称"
            placeholder="请输入站点名称"
            rules={[{ required: true, message: '请输入站点名称' }]}
          />
          
          <ProFormSwitch
            name="allowRegister"
            label="允许注册"
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />

          <ProFormRadio.Group
            name="inviteStrategy"
            label="邀请注册策略"
            options={[
              {
                label: '邮件邀请',
                value: 'email',
              },
              {
                label: '邀请码',
                value: 'code',
              },
            ]}
          />

          <ProFormDependency name={['inviteStrategy']}>
            {({ inviteStrategy }) => {
              if (inviteStrategy === 'code') {
                return (
                  <ProFormText
                    name="inviteCode"
                    label="注册邀请码"
                    placeholder="请输入注册邀请码"
                    rules={[{ required: true, message: '请输入注册邀请码' }]}
                    addonAfter={
                      <Button 
                        type="link" 
                        onClick={generateInviteCode}
                        size="small"
                      >
                        生成新码
                      </Button>
                    }
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>

          <ProFormSwitch
            name="allowLookingGlass"
            label="允许 Looking Glass"
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />

          <ProFormSwitch
            name="showAnnouncement"
            label="显示公告"
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />

          <ProFormDependency name={['showAnnouncement']}>
            {({ showAnnouncement }) => {
              if (showAnnouncement) {
                return (
                  <ProFormTextArea
                    name="announcementContent"
                    label="公告内容"
                    placeholder="请输入公告内容"
                    fieldProps={{
                      autoSize: { minRows: 3, maxRows: 6 },
                    }}
                    rules={[{ required: true, message: '请输入公告内容' }]}
                  />
                );
              }
              return null;
            }}
          </ProFormDependency>
        </ProForm>
      </Card>

      <Card 
        title="Agent配置" 
        variant="outlined"
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadAgentReportBaseUrl}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <ProForm
          form={agentForm} // 使用专用的Form实例
          initialValues={{ agentReportBaseUrl }}
          key={`agent-form-${agentReportBaseUrl}`} // 使用更明确的key
          onFinish={async (values) => {
            await handleAgentReportBaseUrlSubmit(values.agentReportBaseUrl);
          }}
          loading={loading}
          submitter={{
            searchConfig: {
              submitText: '保存配置',
              resetText: '取消',
            },
            resetButtonProps: {
              style: {
                marginLeft: 8,
              },
            },
          }}
        >
          <ProFormText
            name="agentReportBaseUrl"
            label="Agent上报Base URL"
            placeholder="请输入Agent上报的Base URL地址"
            tooltip="用于配置Agent客户端向服务器上报数据时使用的基础URL地址"
            rules={[
              { required: true, message: '请输入Agent上报Base URL' },
              { type: 'url', message: '请输入有效的URL地址' }
            ]}
          />
        </ProForm>
      </Card>
    </div>
  );
};

export default Website; 