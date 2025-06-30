import { http, HttpResponse } from 'msw';
import type { UserGroupData, BatchUpdateUserGroupData } from '@mock/types';
import { mockUserGroups } from '@mock/data/userGroups';

// 用户组相关的 API handlers

export const userGroupHandlers = [
  // 获取用户组列表
  http.get('/config/user-groups', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedGroups = mockUserGroups.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      data: paginatedGroups,
      pagination: {
        current: page,
        pageSize,
        total: mockUserGroups.length,
        totalPages: Math.ceil(mockUserGroups.length / pageSize)
      }
    });
  }),
  
  // 获取所有用户组（用于下拉选择）
  http.get('/config/user-groups/all', () => {
    const groupOptions = mockUserGroups.map(group => ({
      label: group.groupName,
      value: group.groupId
    }));
    
    return HttpResponse.json({
      success: true,
      data: groupOptions
    });
  }),
  
  // 创建用户组
  http.post('/config/user-groups', async ({ request }) => {
    const groupData = await request.json() as UserGroupData;
    
    // 检查重复
    if (mockUserGroups.some(g => g.groupId === groupData.groupId)) {
      return HttpResponse.json({
        success: false,
        message: "用户组ID已存在"
      }, { status: 400 });
    }
    
    const newGroup = {
      id: mockUserGroups.length + 1,
      ...groupData,
      userCount: 0
    };
    
    mockUserGroups.push(newGroup);
    
    return HttpResponse.json({
      success: true,
      message: "用户组创建成功",
      data: newGroup
    });
  }),
  
  // 更新用户组
  http.put('/config/user-groups/:id', async ({ params, request }) => {
    const groupId = parseInt(params.id as string);
    const groupData = await request.json() as UserGroupData;
    const groupIndex = mockUserGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: "用户组不存在"
      }, { status: 404 });
    }
    
    // 不允许修改 groupId
    const { groupId: _, ...updatableData } = groupData;
    
    mockUserGroups[groupIndex] = { ...mockUserGroups[groupIndex], ...updatableData };
    
    return HttpResponse.json({
      success: true,
      message: "用户组更新成功",
      data: mockUserGroups[groupIndex]
    });
  }),
  
  // 删除用户组
  http.delete('/config/user-groups/:id', ({ params }) => {
    const groupId = parseInt(params.id as string);
    const groupIndex = mockUserGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: "用户组不存在"
      }, { status: 404 });
    }
    
    mockUserGroups.splice(groupIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "用户组删除成功"
    });
  }),
  
  // 批量更新用户组
  http.put('/config/user-groups/batch', async ({ request }) => {
    const { ids, updateData } = await request.json() as BatchUpdateUserGroupData;
    
    let updatedCount = 0;
    
    for (const id of ids) {
      const groupIndex = mockUserGroups.findIndex(g => g.id === id);
      if (groupIndex !== -1) {
        mockUserGroups[groupIndex] = { ...mockUserGroups[groupIndex], ...updateData };
        updatedCount++;
      }
    }
    
    return HttpResponse.json({
      success: true,
      message: `成功更新了 ${updatedCount} 个用户组`,
      data: { updatedCount }
    });
  }),
]; 