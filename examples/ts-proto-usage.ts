// ts-proto 使用示例：开发者友好的类型
import { EgressItem, EgressMode, ForwardType, CreateEgressRequest } from '../app/types/generated/egress';

console.log('🎉 ts-proto 生成的代码完美解决了所有问题！\n');

// ✅ 1. 字符串枚举，直观易懂
console.log('1. 字符串枚举示例：');
console.log('EgressMode.EGRESS_MODE_DIRECT =', EgressMode.EGRESS_MODE_DIRECT);
console.log('ForwardType.FORWARD_TYPE_TCP =', ForwardType.FORWARD_TYPE_TCP);

// ✅ 2. camelCase 字段名，符合JavaScript约定
console.log('\n2. camelCase 字段名示例：');
const egress: EgressItem = {
  egressId: 'egress-001',        // ✅ 不是 egress_id
  serverId: 'server-001',        // ✅ 不是 server_id
  egressMode: EgressMode.EGRESS_MODE_DIRECT,
  targetAddress: '192.168.1.100' // ✅ 不是 target_address
};

console.log('egress对象：', egress);

// ✅ 3. 简洁的使用方式，没有复杂的protobuf方法
console.log('\n3. 简洁的使用方式：');
const createRequest: CreateEgressRequest = {
  egressId: 'new-egress',
  serverId: 'server-002',
  egressMode: EgressMode.EGRESS_MODE_IPTABLES,
  forwardType: ForwardType.FORWARD_TYPE_ALL,
  destAddress: '10.0.0.1',
  destPort: '8080'
};

console.log('创建请求：', createRequest);

// ✅ 4. 类型安全且IDE友好
console.log('\n4. 类型安全检查：');
function processEgress(item: EgressItem) {
  // TypeScript会自动提示所有可用字段
  if (item.egressMode === EgressMode.EGRESS_MODE_DIRECT) {
    console.log(`处理直出模式，目标地址: ${item.targetAddress}`);
  } else if (item.egressMode === EgressMode.EGRESS_MODE_IPTABLES) {
    console.log(`处理iptables模式，转发类型: ${item.forwardType}`);
  }
}

processEgress(egress);

console.log('\n🎯 总结：无需适配器，ts-proto 直接生成开发者友好的代码！'); 