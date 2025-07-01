import { http, HttpResponse } from 'msw';
import type { WebsiteConfigUpdateData, InviteCodeData } from '@mock/types';
import { mockWebsiteConfig } from '@mock/data/websiteConfig';

// 网站配置相关的 API handlers

export const websiteConfigHandlers = [
  // 获取网站配置
  http.get('/v1/settings', () => {
    return HttpResponse.json({
      success: true,
      data: mockWebsiteConfig
    });
  }),

  // 更新网站配置
  http.put('/v1/settings', async ({ request }) => {
    const updateData = await request.json() as WebsiteConfigUpdateData;
    
    Object.assign(mockWebsiteConfig, updateData);
    mockWebsiteConfig.updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      message: "网站配置更新成功",
      data: mockWebsiteConfig
    });
  }),

  // 重置网站配置
  http.post('/v1/settings/reset', () => {
    Object.assign(mockWebsiteConfig, {
      siteName: 'NSPass',
      allowRegister: true,
      inviteStrategy: 'code',
      inviteCode: 'nspass2024',
      allowLookingGlass: true,
      showAnnouncement: true,
      announcementContent: '欢迎使用NSPass系统，这是一个示例公告。',
      updatedAt: new Date().toISOString()
    });
    
    return HttpResponse.json({
      success: true,
      message: "网站配置已重置为默认值",
      data: mockWebsiteConfig
    });
  }),

  // 验证邀请码
  http.post('/v1/settings/validateInvite', async ({ request }) => {
    const { code } = await request.json() as InviteCodeData;
    const valid = code === mockWebsiteConfig.inviteCode;
    
    return HttpResponse.json({
      success: true,
      data: { valid }
    });
  }),

  // 生成新邀请码
  http.post('/v1/settings/inviteCode', () => {
    const newInviteCode = `nspass${Date.now().toString().substr(-6)}`;
    mockWebsiteConfig.inviteCode = newInviteCode;
    mockWebsiteConfig.updatedAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      message: "新邀请码生成成功",
      data: { inviteCode: newInviteCode }
    });
  }),
]; 