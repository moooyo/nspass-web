import React, { useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSwitch,
  ProFormRadio,
  ProFormDependency,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Card, message } from 'antd';

const Website: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: any) => {
    console.log(values);
    messageApi.success('配置已保存');
  };

  return (
    <div>
      {contextHolder}
      <Card title="网站配置" bordered={false}>
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            searchConfig: {
              submitText: '保存',
              resetText: '重置',
            },
            resetButtonProps: {
              style: {
                marginLeft: 8,
              },
            },
          }}
          initialValues={{
            siteName: 'NSPass',
            allowRegister: true,
            inviteStrategy: 'code',
            inviteCode: 'nspass2024',
            allowLookingGlass: true,
            showAnnouncement: true,
            announcementContent: '欢迎使用NSPass系统，这是一个示例公告。',
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