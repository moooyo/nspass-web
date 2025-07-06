import { http, HttpResponse } from 'msw';
import { 
  mockIptablesConfigs, 
  mockIptablesRebuildTasks,
  getIptablesConfigsByServerId,
  generateIptablesRebuildTask,
  getIptablesStats
} from '../data/iptables';

// 用于追踪任务状态的全局变量
const runningTasks = new Map<string, NodeJS.Timeout>();

export const iptablesHandlers = [
  // 获取服务器 iptables 配置
  http.get('/api/v1/servers/:serverId/iptables', ({ params }) => {
    const { serverId } = params;
    const configs = getIptablesConfigsByServerId(serverId as string);
    
    return HttpResponse.json({
      success: true,
      data: configs,
      message: `获取服务器 ${serverId} 的 iptables 配置成功，共 ${configs.length} 条规则`,
      total: configs.length
    });
  }),

  // 重建服务器 iptables 配置
  http.post('/api/v1/servers/:serverId/iptables/rebuild', async ({ params, request }) => {
    const { serverId } = params;
    const body = await request.json() as { force?: boolean };
    
    console.log(`[IPTABLES MOCK] 启动服务器 ${serverId} 的 iptables 重建任务`, body);
    
    const task = generateIptablesRebuildTask(serverId as string);
    
    console.log(`[IPTABLES MOCK] 创建重建任务: ${task.taskId}`);
    
    // 模拟异步更新任务状态，更真实的时间模拟
    const taskUpdateTimeout1 = setTimeout(() => {
      task.status = 'IPTABLES_REBUILD_STATUS_RUNNING';
      task.processedRules = Math.floor(task.totalRules * 0.3);
      console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 进入运行状态，处理进度: ${task.processedRules}/${task.totalRules}`);
    }, 1000);
    
    const taskUpdateTimeout2 = setTimeout(() => {
      task.processedRules = Math.floor(task.totalRules * 0.7);
      console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 处理进度更新: ${task.processedRules}/${task.totalRules}`);
    }, 2000);
    
    const taskUpdateTimeout3 = setTimeout(() => {
      // 90% 概率成功，10% 概率失败
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        task.status = 'IPTABLES_REBUILD_STATUS_SUCCESS';
        task.processedRules = task.totalRules;
        task.failedRules = 0;
        task.completedAt = Math.floor(Date.now() / 1000).toString();
        console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 成功完成`);
      } else {
        task.status = 'IPTABLES_REBUILD_STATUS_FAILED';
        task.processedRules = task.totalRules - 1;
        task.failedRules = 1;
        task.errorMessage = '模拟错误：规则执行失败，可能存在端口冲突';
        task.completedAt = Math.floor(Date.now() / 1000).toString();
        console.log(`[IPTABLES MOCK] 任务 ${task.taskId} 执行失败:`, task.errorMessage);
      }
      
      // 清理定时器
      runningTasks.delete(task.taskId);
    }, 4000);
    
    // 保存定时器引用
    runningTasks.set(task.taskId, taskUpdateTimeout3);
    
    // 更新 mockIptablesRebuildTasks 数组
    mockIptablesRebuildTasks.push(task);
    
    return HttpResponse.json({
      success: true,
      data: task,
      message: `服务器 ${serverId} 的 iptables 重建任务启动成功`,
      taskId: task.taskId
    });
  }),

  // 获取转发路径规则相关的 iptables 配置
  http.get('/api/v1/forward-path-rules/:ruleId/iptables', ({ params }) => {
    const { ruleId } = params;
    
    // 模拟返回与规则相关的 iptables 配置
    const configs = mockIptablesConfigs.filter(config => 
      config.ruleComment.includes('转发') || 
      config.tableName === 'nat' ||
      config.configName.includes('forward') ||
      config.ruleAction === 'DNAT' ||
      config.ruleAction === 'MASQUERADE'
    );
    
    return HttpResponse.json({
      success: true,
      data: configs,
      message: `获取转发路径规则 ${ruleId} 的 iptables 配置成功`,
      total: configs.length
    });
  }),

  // 重建转发路径规则 iptables 配置
  http.post('/api/v1/forward-path-rules/:ruleId/iptables/rebuild', async ({ params, request }) => {
    const { ruleId } = params;
    const body = await request.json() as { force?: boolean };
    
    // 模拟为转发规则重建创建任务，假设关联的是服务器01
    const task = generateIptablesRebuildTask('1');
    task.taskId = `forward-rule-${ruleId}-${Date.now()}`;
    task.totalRules = 3; // 转发规则通常涉及较少的 iptables 规则
    
    // 模拟异步更新任务状态（转发规则重建更快）
    const taskUpdateTimeout1 = setTimeout(() => {
      task.status = 'IPTABLES_REBUILD_STATUS_RUNNING';
      task.processedRules = 1;
    }, 500);
    
    const taskUpdateTimeout2 = setTimeout(() => {
      task.status = 'IPTABLES_REBUILD_STATUS_SUCCESS';
      task.processedRules = task.totalRules;
      task.completedAt = Math.floor(Date.now() / 1000).toString();
      
      runningTasks.delete(task.taskId);
    }, 2000);
    
    runningTasks.set(task.taskId, taskUpdateTimeout2);
    mockIptablesRebuildTasks.push(task);
    
    return HttpResponse.json({
      success: true,
      data: task,
      message: `转发路径规则 ${ruleId} 的 iptables 重建任务启动成功`
    });
  }),

  // 获取重建任务状态
  http.get('/api/v1/iptables/tasks/:taskId', ({ params }) => {
    const { taskId } = params;
    
    // 查找匹配的任务
    const task = mockIptablesRebuildTasks.find(t => t.taskId === taskId);
    
    if (!task) {
      return HttpResponse.json({
        success: false,
        message: `任务 ${taskId} 不存在`,
        code: 'TASK_NOT_FOUND'
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      success: true,
      data: task,
      message: `获取任务 ${taskId} 状态成功`
    });
  }),

  // 获取所有重建任务列表
  http.get('/api/v1/iptables/tasks', ({ request }) => {
    const url = new URL(request.url);
    const serverId = url.searchParams.get('serverId');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    let tasks = [...mockIptablesRebuildTasks];
    
    // 按服务器ID过滤
    if (serverId) {
      tasks = tasks.filter(task => task.serverId === serverId);
    }
    
    // 按状态过滤
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }
    
    // 按时间倒序排列
    tasks.sort((a, b) => parseInt(b.startedAt) - parseInt(a.startedAt));
    
    // 分页
    const totalCount = tasks.length;
    const paginatedTasks = tasks.slice(offset, offset + limit);
    
    return HttpResponse.json({
      success: true,
      data: paginatedTasks,
      message: '获取重建任务列表成功',
      total: totalCount,
      pagination: {
        current: Math.floor(offset / limit) + 1,
        pageSize: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  }),

  // 取消重建任务
  http.post('/api/v1/iptables/tasks/:taskId/cancel', ({ params }) => {
    const { taskId } = params;
    const taskIdStr = taskId as string;
    
    console.log(`[IPTABLES MOCK] 取消任务: ${taskIdStr}`);
    
    const task = mockIptablesRebuildTasks.find(t => t.taskId === taskIdStr);
    
    if (!task) {
      return HttpResponse.json({
        success: false,
        message: `任务 ${taskIdStr} 不存在`
      }, { status: 404 });
    }
    
    if (task.status === 'IPTABLES_REBUILD_STATUS_SUCCESS' || 
        task.status === 'IPTABLES_REBUILD_STATUS_FAILED') {
      return HttpResponse.json({
        success: false,
        message: '任务已完成，无法取消'
      }, { status: 400 });
    }
    
    // 取消定时器
    const timer = runningTasks.get(taskIdStr);
    if (timer) {
      clearTimeout(timer);
      runningTasks.delete(taskIdStr);
    }
    
    // 更新任务状态
    task.status = 'IPTABLES_REBUILD_STATUS_FAILED';
    task.errorMessage = '任务被用户取消';
    task.completedAt = Math.floor(Date.now() / 1000).toString();
    
    console.log(`[IPTABLES MOCK] 任务 ${taskIdStr} 已取消`);
    
    return HttpResponse.json({
      success: true,
      data: task,
      message: `任务 ${taskIdStr} 已取消`
    });
  }),

  // 获取 iptables 统计信息
  http.get('/api/v1/iptables/stats', () => {
    const stats = getIptablesStats();
    
    return HttpResponse.json({
      success: true,
      data: stats,
      message: '获取 iptables 统计信息成功'
    });
  }),
];

export default iptablesHandlers;
