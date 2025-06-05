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
  const [form] = ProForm.useForm();

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

  // 初始化加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
    </div>
  );
};

export default Website; 