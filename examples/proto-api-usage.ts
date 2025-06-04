// 🚀 Proto API 类型使用完整示例 
// 演示如何在多个项目中共享相同的API类型定义

// ✅ Dashboard API 使用示例
import { dashboardService, TimePeriod, LogLevel } from '@/services/dashboard';

// ✅ Servers API 使用示例  
import { serversService, ServerStatus } from '@/services/servers';

// ✅ User Info API 使用示例
import { userInfoService } from '@/services/userInfo';

// ✅ 直接使用proto生成的类型
import { GetTrafficTrendRequest } from '@/app/types/generated/api/dashboard/dashboard';
import { CreateServerRequest } from '@/app/types/generated/api/servers/servers';
import { UpdateUserInfoRequest } from '@/app/types/generated/api/users/user_info';

async function demonstrateProtoApiUsage() {
  console.log('🎉 Proto API 类型统一管理示例\n');

  // ✅ 1. Dashboard API - 类型安全的仪表盘操作
  console.log('1. Dashboard API 示例：');
  
  try {
    // 获取系统概览
    const overview = await dashboardService.getSystemOverview();
    console.log('系统概览响应结构：', {
      success: overview.base?.success,
      userCount: overview.data?.userCount,
      serverCount: overview.data?.serverCount
    });

    // 使用类型安全的请求参数
    const trafficRequest: GetTrafficTrendRequest = {
      days: 7,
      startDate: '2024-01-01',
      endDate: '2024-01-07'
    };
    
    const trafficTrend = await dashboardService.getTrafficTrend(trafficRequest);
    console.log('流量趋势数据项数量：', trafficTrend.data?.length || 0);

    // 使用枚举类型
    const userTraffic = await dashboardService.getUserTrafficStats({
      limit: 10,
      period: TimePeriod.TIME_PERIOD_WEEK  // 字符串枚举
    });
    console.log('用户流量统计：', userTraffic.data?.length || 0, '项');

  } catch (error) {
    console.log('Dashboard API 调用示例（模拟）');
  }

  // ✅ 2. Servers API - 类型安全的服务器管理
  console.log('\n2. Servers API 示例：');
  
  try {
    // 创建服务器请求
    const createServerRequest: CreateServerRequest = {
      name: 'demo-server-001',
      ipv4: '192.168.1.100',
      ipv6: '2001:db8::1',
      region: 'us-west-1',
      group: 'production',
      registerTime: new Date().toISOString(),
      uploadTraffic: 0,
      downloadTraffic: 0,
      status: ServerStatus.SERVER_STATUS_ONLINE  // 字符串枚举
    };

    const newServer = await serversService.createServer(createServerRequest);
    console.log('创建服务器响应：', {
      success: newServer.base?.success,
      serverId: newServer.data?.id,
      serverName: newServer.data?.name
    });

    // 查询服务器列表
    const serversList = await serversService.getServers({
      page: 1,
      pageSize: 10,
      status: ServerStatus.SERVER_STATUS_ONLINE,
      region: 'us-west-1'
    });
    console.log('服务器列表数量：', serversList.data?.length || 0);

  } catch (error) {
    console.log('Servers API 调用示例（模拟）');
  }

  // ✅ 3. User Info API - 类型安全的用户信息管理
  console.log('\n3. User Info API 示例：');
  
  try {
    // 获取当前用户信息
    const currentUser = await userInfoService.getCurrentUserInfo();
    console.log('当前用户信息：', {
      success: currentUser.base?.success,
      userId: currentUser.data?.id,
      userName: currentUser.data?.name,
      userRole: currentUser.data?.role
    });

    // 更新用户信息请求
    const updateRequest: UpdateUserInfoRequest = {
      name: 'Updated User Name',
      email: 'updated@example.com',
      phone: '+1234567890'
    };

    const updatedUser = await userInfoService.updateCurrentUserInfo(updateRequest);
    console.log('更新用户信息结果：', updatedUser.base?.success);

    // 获取用户流量统计
    const trafficStats = await userInfoService.getTrafficStats();
    console.log('用户流量统计：', {
      totalUsed: trafficStats.data?.totalUsed,
      totalLimit: trafficStats.data?.totalLimit,
      dailyUsageCount: trafficStats.data?.dailyUsage?.length || 0
    });

  } catch (error) {
    console.log('User Info API 调用示例（模拟）');
  }

  // ✅ 4. 跨项目共享的优势展示
  console.log('\n🎯 跨项目共享优势：');
  console.log('1. ✅ 类型一致性 - 多个项目使用相同的proto定义');
  console.log('2. ✅ 自动更新 - proto文件更新时，所有项目的类型自动同步');
  console.log('3. ✅ 编译时检查 - TypeScript编译器确保类型安全');
  console.log('4. ✅ IDE支持 - 完美的自动补全和错误检查');
  console.log('5. ✅ 文档生成 - proto文件即是API文档');

  // ✅ 5. 具体的多项目使用场景
  console.log('\n📦 多项目使用场景：');
  console.log('- 前端项目：nspass-web (当前项目)');
  console.log('- 移动端项目：nspass-mobile');
  console.log('- 管理后台：nspass-admin');
  console.log('- 测试工具：nspass-testing');
  console.log('- 微服务：nspass-api-gateway');
  console.log('');
  console.log('所有项目共享同一套proto定义，确保API接口的一致性！');

  // ✅ 6. proto定义的维护建议
  console.log('\n📝 Proto定义维护建议：');
  console.log('1. 将proto文件放在独立的git仓库中');
  console.log('2. 使用语义化版本控制proto定义');
  console.log('3. 在CI/CD中自动生成和发布类型包');
  console.log('4. 建立proto文件的review流程');
  console.log('5. 为每个API添加详细的注释说明');
}

// 演示不同环境下的使用方式
export function demonstrateMultiProjectUsage() {
  console.log('\n🏗️ 多项目集成示例：');
  
  // 前端项目中的使用
  console.log('// 前端项目 (nspass-web)');
  console.log('import { dashboardService } from "@/services/dashboard";');
  console.log('const overview = await dashboardService.getSystemOverview();');
  
  // 移动端项目中的使用  
  console.log('\n// 移动端项目 (nspass-mobile)');
  console.log('import { ServerStatus } from "@nspass/api-types/servers";');
  console.log('const status = ServerStatus.SERVER_STATUS_ONLINE;');
  
  // 后端服务中的使用
  console.log('\n// 后端服务 (nspass-backend)');
  console.log('import { CreateServerRequest } from "@nspass/api-types/servers";');
  console.log('function handleCreateServer(req: CreateServerRequest) { ... }');
}

// 运行示例
if (require.main === module) {
  demonstrateProtoApiUsage()
    .then(() => {
      demonstrateMultiProjectUsage();
      console.log('\n🎊 Proto API 类型示例运行完成！');
    })
    .catch(console.error);
}

export default demonstrateProtoApiUsage; 