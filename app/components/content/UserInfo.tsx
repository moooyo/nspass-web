import React from 'react';
import {
    AlipayCircleOutlined,
    LockOutlined,
    PlusOutlined,
    TaobaoCircleOutlined,
    UserOutlined,
    WeiboCircleOutlined,
  } from '@ant-design/icons';
  import {
    DrawerForm,
    LightFilter,
    LoginForm,
    ModalForm,
    ProForm,
    ProFormDateRangePicker,
    ProFormRadio,
    ProFormSelect,
    ProFormText,
    QueryFilter,
    StepsForm,
  } from '@ant-design/pro-components';
  import { Button, Space, message } from 'antd';
  import { useState } from 'react';

  const iconStyles = {
    marginInlineStart: '16px',
    color: 'rgba(0, 0, 0, 0.2)',
    fontSize: '24px',
    verticalAlign: 'middle',
    cursor: 'pointer',
  };
  
  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

const UserInfo: React.FC = () => {
  return (
    <div
      style={{
        margin: 24,
      }}
    >
      <ProForm
        onFinish={async (values: any) => {
          await waitTime(2000);
          console.log(values);
          message.success('提交成功');
        }}
        initialValues={{
          name: 'user name',
          useMode: 'chapter',
          company: "my company",
          user_group: "user group",
          role: "admin",
          traffic: "1000",
          traffic_reset_date: "2025-01-01",
          forward_rule_config_limit: "1000",
        }}
        submitter={{
          searchConfig: {
            submitText: '保存',
            resetText: '重置',
          },
        }}
      >
        <ProFormText
          width="md"
          name="name"
          label="用户名"
        />
        <ProFormText 
          width="md"
          name="role"
          label="角色"
          disabled
        />
        <ProFormText
          width="md"
          name="user_group"
          label="用户组"
          disabled
        />
        <ProFormText
          width="md"
          name="traffic"
          label="流量"
          disabled
        />
        <ProFormText
          width="md"
          name="traffic_reset_date"
          label="流量重置日期"
          disabled
        />
        <ProFormText 
          width="md"
          name="forward_rule_config_limit"
          label="转发规则配置限制"
          disabled
        />
      </ProForm>
    </div>
  );
};

export default UserInfo; 