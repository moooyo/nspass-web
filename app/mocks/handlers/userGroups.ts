import { http, HttpResponse } from 'msw';
import type { UserGroupData, BatchUpdateUserGroupData } from '@mock/types';
import { mockUserGroups } from '@mock/data/userGroups';

// 用户组管理相关的 API handlers

export const userGroupHandlers = [
  // 获取用户组列表
  http.get('https://api.example.com/config/user-groups', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const groupId = url.searchParams.get('groupId');
    const groupName = url.searchParams.get('groupName');
    
    // 筛选数据
    let filteredGroups = mockUserGroups;
    
    if (groupId) {
      filteredGroups = filteredGroups.filter(group => 
        group.groupId.toLowerCase().includes(groupId.toLowerCase())
      );
    }
    
    if (groupName) {
      filteredGroups = filteredGroups.filter(group => 
        group.groupName.toLowerCase().includes(groupName.toLowerCase())
      );
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
    
    return HttpResponse.json({
      success: true,
      data: paginatedGroups,
      pagination: {
        current: page,
        pageSize: pageSize,
        total: filteredGroups.length,
        totalPages: Math.ceil(filteredGroups.length / pageSize)
      }
    });
  }),

  // 创建用户组
  http.post('https://api.example.com/user-groups', async ({ request }) => {
    const groupData = await request.json() as UserGroupData;
    
    const newGroup = {
      id: mockUserGroups.length + 1,
      ...groupData
    };
    
    mockUserGroups.push(newGroup);
    
    return HttpResponse.json({
      success: true,
      message: "用户组创建成功",
      data: newGroup
    });
  }),

  // 更新用户组
  http.put('https://api.example.com/user-groups/:id', async ({ params, request }) => {
    const groupId = parseInt(params.id as string);
    const groupData = await request.json() as UserGroupData;
    const groupIndex = mockUserGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户组不存在" },
        { status: 404 }
      );
    }
    
    mockUserGroups[groupIndex] = { ...mockUserGroups[groupIndex], ...groupData };
    
    return HttpResponse.json({
      success: true,
      message: "用户组更新成功",
      data: mockUserGroups[groupIndex]
    });
  }),

  // 删除用户组
  http.delete('https://api.example.com/config/user-groups/:id', ({ params }) => {
    const groupId = parseInt(params.id as string);
    const groupIndex = mockUserGroups.findIndex(g => g.id == groupId);
    
    if (groupIndex === -1) {
      return HttpResponse.json(
        { success: false, message: "用户组不存在" },
        { status: 404 }
      );
    }
    
    mockUserGroups.splice(groupIndex, 1);
    
    return HttpResponse.json({
      success: true,
      message: "用户组删除成功"
    });
  }),

  // 批量更新用户组
  http.put('https://api.example.com/user-groups/batch', async ({ request }) => {
    const updateData = await request.json() as BatchUpdateUserGroupData;
    
    const updatedGroups = mockUserGroups.map(group => {
      if (updateData.ids.includes(group.id as number)) {
        return { ...group, ...updateData.updateData };
      }
      return group;
    });
    
    mockUserGroups.splice(0, mockUserGroups.length, ...updatedGroups);
    
    return HttpResponse.json({
      success: true,
      message: "用户组批量更新成功",
      data: updatedGroups
    });
  }),
]; 