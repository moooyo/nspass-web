// 📁 嵌套目录结构的proto类型使用示例

// ✅ 从不同目录导入类型
import { User, UserRole } from '../app/types/generated/model/user';
import { GetUserRequest, GetUserResponse, ListUsersRequest } from '../app/types/generated/service/user_service';
import { BaseResponse, BasePagination } from '../app/types/generated/common/base';

console.log('🎉 ts-proto 完美支持嵌套目录结构！\n');

// ✅ 使用model中的类型
console.log('1. 使用 model/user.ts 中的类型：');
const user: User = {
  id: 'user-001',
  username: 'john_doe',
  email: 'john@example.com',
  role: UserRole.USER_ROLE_ADMIN,  // 字符串枚举
  createdAt: Date.now()
};

console.log('用户对象：', user);

// ✅ 使用service中的类型（自动引用model）
console.log('\n2. 使用 service/user_service.ts 中的类型：');
const getUserRequest: GetUserRequest = {
  userId: 'user-001'
};

const getUserResponse: GetUserResponse = {
  user: user,
  success: true
};

console.log('获取用户请求：', getUserRequest);
console.log('获取用户响应：', getUserResponse);

// ✅ 使用通用base类型
console.log('\n3. 使用 common/base.ts 中的通用类型：');
const baseResponse: BaseResponse = {
  success: true,
  message: '操作成功',
  errorCode: ''
};

const pagination: BasePagination = {
  page: 1,
  pageSize: 10,
  total: 100
};

console.log('基础响应：', baseResponse);
console.log('分页信息：', pagination);

// ✅ 组合使用不同目录的类型
console.log('\n4. 组合使用多个目录的类型：');
const listRequest: ListUsersRequest = {
  page: pagination.page,
  pageSize: pagination.pageSize,
  roleFilter: UserRole.USER_ROLE_ADMIN
};

console.log('列表请求：', listRequest);

console.log('\n🎯 目录结构映射总结：');
console.log('proto/model/user.proto → app/types/generated/model/user.ts');
console.log('proto/service/user_service.proto → app/types/generated/service/user_service.ts');
console.log('proto/common/base.proto → app/types/generated/common/base.ts');

console.log('\n✅ ts-proto自动处理：');
console.log('- 保持完整的目录结构');
console.log('- 正确生成相对路径import');
console.log('- 跨目录类型引用无缝工作');
console.log('- camelCase + 字符串枚举 + 纯接口'); 