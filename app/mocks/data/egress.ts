import { EgressItem } from '@/types/generated/model/egressItem';
import { EgressMode, ForwardType } from '@/types/generated/model/egress';

// 模拟出口数据
export const mockEgressItems: EgressItem[] = [
  {
    id: 1,
    egressId: 'egress-001',
    egressName: '美国西部出口',
    serverId: 'server-1',
    egressMode: EgressMode.EGRESS_MODE_DIRECT,
    egressConfig: '{"region": "us-west"}',
    targetAddress: '8.8.8.8:443',
    forwardType: undefined,
    destAddress: undefined,
    destPort: undefined,
    password: undefined,
    supportUdp: undefined,
    port: undefined,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
    updatedAt: Math.floor(Date.now() / 1000) - 86400,
  },
  {
    id: 2,
    egressId: 'egress-002',
    egressName: '欧洲出口',
    serverId: 'server-2',
    egressMode: EgressMode.EGRESS_MODE_IPTABLES,
    egressConfig: '{"region": "eu-central"}',
    targetAddress: undefined,
    forwardType: ForwardType.FORWARD_TYPE_TCP,
    destAddress: '1.1.1.1',
    destPort: '80',
    password: undefined,
    supportUdp: undefined,
    port: undefined,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
    updatedAt: Math.floor(Date.now() / 1000) - 86400 * 2,
  },
  {
    id: 3,
    egressId: 'egress-003',
    egressName: '亚太出口',
    serverId: 'server-3',
    egressMode: EgressMode.EGRESS_MODE_SS2022,
    egressConfig: '{"region": "ap-southeast"}',
    targetAddress: undefined,
    forwardType: undefined,
    destAddress: undefined,
    destPort: undefined,
    password: 'example-password-123',
    supportUdp: true,
    port: 8388,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    updatedAt: Math.floor(Date.now() / 1000) - 3600,
  },
];

// 根据ID获取出口信息
export const getEgressById = (id: number): EgressItem | undefined => {
  return mockEgressItems.find(item => item.id === id);
};

// 获取出口列表
export const getEgressList = (): EgressItem[] => {
  return mockEgressItems;
};
