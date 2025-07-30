import React, { useState } from 'react';
import { Tabs } from 'antd';
import DnsConfigTab from './DnsConfigTab';
import DnsProviderConfig from './DnsProviderConfig';

const DnsConfig: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('dns-config');

    const tabItems = [
        {
            key: 'dns-config',
            label: 'DNS配置',
            children: <DnsConfigTab />,
        },
        {
            key: 'dns-provider',
            label: 'DNS Provider配置',
            children: <DnsProviderConfig />,
        },
    ];

    return (
        <div>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
                style={{ padding: '0 24px' }}
            />
        </div>
    );
};

export default DnsConfig;