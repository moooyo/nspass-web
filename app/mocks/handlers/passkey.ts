import { http, HttpResponse } from 'msw';
import {
  mockPasskeyCredentials,
  generateMockRegistrationOptions,
  generateMockAuthenticationOptions,
  generateMockLoginData,
  generateMockPasskeyCredential,
  passkeyErrorMessages,
} from '@mock/data/passkeys';
import type {
  PasskeyRegistrationRequest,
  PasskeyAuthenticationRequest,
  GetPasskeyListRequest,
  DeletePasskeyRequest,
  RenamePasskeyRequest,
} from '@/types/generated/api/users/user_passkey';

/**
 * Passkey 相关的 MSW handlers
 */
export const passkeyHandlers = [
  // 获取Passkey注册选项
  http.post('/api/v1/auth/passkey/registration/options', async () => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    const registrationOptions = generateMockRegistrationOptions();

    return HttpResponse.json({
      base: {
        success: true,
        message: '成功获取注册选项',
      },
      data: registrationOptions,
    });
  }),

  // 验证并完成Passkey注册
  http.post('/api/v1/auth/passkey/registration/verify', async ({ request }) => {
    try {
      const body = await request.json() as PasskeyRegistrationRequest;
      
      // 验证必要字段
      if (!body.credentialId || !body.publicKey || !body.attestationObject || !body.clientDataJSON) {
        return HttpResponse.json({
          base: {
            success: false,
            message: '缺少必要的认证数据',
            errorCode: 'INVALID_REQUEST',
          },
        }, { status: 400 });
      }

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 生成新的凭据
      const newCredential = generateMockPasskeyCredential(
        body.credentialId,
        body.credentialName || 'Unknown Device',
        body.deviceType || 'unknown'
      );

      return HttpResponse.json({
        base: {
          success: true,
          message: 'Passkey注册成功',
        },
        data: newCredential,
      });

    } catch (error) {
      return HttpResponse.json({
        base: {
          success: false,
          message: passkeyErrorMessages.registrationFailed,
          errorCode: 'REGISTRATION_ERROR',
        },
      }, { status: 500 });
    }
  }),

  // 获取Passkey认证选项
  http.post('/api/v1/auth/passkey/authentication/options', async () => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    const authenticationOptions = generateMockAuthenticationOptions();

    return HttpResponse.json({
      base: {
        success: true,
        message: '成功获取认证选项',
      },
      data: authenticationOptions,
    });
  }),

  // 验证并完成Passkey认证
  http.post('/api/v1/auth/passkey/authentication/verify', async ({ request }) => {
    try {
      const body = await request.json() as PasskeyAuthenticationRequest;
      
      // 验证必要字段
      if (!body.credentialId || !body.authenticatorData || !body.signature || !body.clientDataJSON) {
        return HttpResponse.json({
          base: {
            success: false,
            message: '缺少必要的认证数据',
            errorCode: 'INVALID_REQUEST',
          },
        }, { status: 400 });
      }

      // 检查凭据是否存在且有效
      const credential = mockPasskeyCredentials.find(cred => 
        cred.id === body.credentialId && cred.isActive
      );

      if (!credential) {
        return HttpResponse.json({
          base: {
            success: false,
            message: passkeyErrorMessages.credentialNotFound,
            errorCode: 'CREDENTIAL_NOT_FOUND',
          },
        }, { status: 404 });
      }

      // 模拟延迟（认证验证）
      await new Promise(resolve => setTimeout(resolve, 800));

      // 模拟小概率认证失败（5%失败率）
      if (Math.random() < 0.05) {
        return HttpResponse.json({
          base: {
            success: false,
            message: passkeyErrorMessages.authenticationFailed,
            errorCode: 'AUTHENTICATION_FAILED',
          },
        }, { status: 401 });
      }

      // 生成登录数据
      const loginData = generateMockLoginData(body.credentialId);

      // 更新凭据的最后使用时间（在实际应用中会保存到数据库）
      const credentialIndex = mockPasskeyCredentials.findIndex(cred => cred.id === body.credentialId);
      if (credentialIndex !== -1) {
        mockPasskeyCredentials[credentialIndex] = {
          ...mockPasskeyCredentials[credentialIndex],
          lastUsedAt: new Date().toISOString(),
        };
      }

      return HttpResponse.json({
        base: {
          success: true,
          message: 'Passkey认证成功',
        },
        data: loginData,
      });

    } catch (error) {
      return HttpResponse.json({
        base: {
          success: false,
          message: passkeyErrorMessages.authenticationFailed,
          errorCode: 'AUTHENTICATION_ERROR',
        },
      }, { status: 500 });
    }
  }),

  // 获取用户的Passkey列表
  http.get('/api/v1/user/passkeys', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 模拟当前用户的凭据（实际应用中会根据JWT token获取用户ID）
    const userCredentials = mockPasskeyCredentials.filter(cred => 
      cred.userId === 'user_1' // 模拟当前用户
    );

    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCredentials = userCredentials.slice(startIndex, endIndex);

    return HttpResponse.json({
      base: {
        success: true,
        message: '成功获取Passkey列表',
      },
      data: {
        credentials: paginatedCredentials,
        pagination: {
          total: userCredentials.length,
          page,
          pageSize,
          totalPages: Math.ceil(userCredentials.length / pageSize),
        },
      },
    });
  }),

  // 删除Passkey凭据
  http.delete('/api/v1/user/passkeys/:credentialId', async ({ params }) => {
    const { credentialId } = params;

    if (!credentialId || typeof credentialId !== 'string') {
      return HttpResponse.json({
        base: {
          success: false,
          message: '无效的凭据ID',
          errorCode: 'INVALID_CREDENTIAL_ID',
        },
      }, { status: 400 });
    }

    // 查找凭据
    const credentialIndex = mockPasskeyCredentials.findIndex(cred => 
      cred.id === credentialId && cred.userId === 'user_1'
    );

    if (credentialIndex === -1) {
      return HttpResponse.json({
        base: {
          success: false,
          message: passkeyErrorMessages.credentialNotFound,
          errorCode: 'CREDENTIAL_NOT_FOUND',
        },
      }, { status: 404 });
    }

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 400));

    // 删除凭据（在实际应用中会从数据库删除）
    mockPasskeyCredentials.splice(credentialIndex, 1);

    return HttpResponse.json({
      base: {
        success: true,
        message: 'Passkey凭据删除成功',
      },
    });
  }),

  // 重命名Passkey凭据
  http.put('/api/v1/user/passkeys/:credentialId/name', async ({ params, request }) => {
    const { credentialId } = params;

    if (!credentialId || typeof credentialId !== 'string') {
      return HttpResponse.json({
        base: {
          success: false,
          message: '无效的凭据ID',
          errorCode: 'INVALID_CREDENTIAL_ID',
        },
      }, { status: 400 });
    }

    try {
      const body = await request.json() as { newName: string };
      
      if (!body.newName || body.newName.trim().length === 0) {
        return HttpResponse.json({
          base: {
            success: false,
            message: '凭据名称不能为空',
            errorCode: 'INVALID_NAME',
          },
        }, { status: 400 });
      }

      // 查找凭据
      const credentialIndex = mockPasskeyCredentials.findIndex(cred => 
        cred.id === credentialId && cred.userId === 'user_1'
      );

      if (credentialIndex === -1) {
        return HttpResponse.json({
          base: {
            success: false,
            message: passkeyErrorMessages.credentialNotFound,
            errorCode: 'CREDENTIAL_NOT_FOUND',
          },
        }, { status: 404 });
      }

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      // 更新凭据名称
      mockPasskeyCredentials[credentialIndex] = {
        ...mockPasskeyCredentials[credentialIndex],
        name: body.newName.trim(),
      };

      return HttpResponse.json({
        base: {
          success: true,
          message: 'Passkey凭据重命名成功',
        },
        data: mockPasskeyCredentials[credentialIndex],
      });

    } catch (error) {
      return HttpResponse.json({
        base: {
          success: false,
          message: '重命名失败',
          errorCode: 'RENAME_ERROR',
        },
      }, { status: 500 });
    }
  }),
]; 