import { httpClient } from '@/utils/http-client';
import { PasskeyManager, PasskeyUtils } from '@/utils/passkey';
import type {
  PasskeyRegistrationOptionsResponse,
  PasskeyRegistrationRequest,
  PasskeyRegistrationResponse,
  PasskeyAuthenticationOptionsResponse,
  PasskeyAuthenticationRequest,
  PasskeyAuthenticationResponse,
  GetPasskeyListRequest,
  PasskeyListResponse,
  DeletePasskeyRequest,
  DeletePasskeyResponse,
  RenamePasskeyRequest,
  RenamePasskeyResponse,
} from '@/types/generated/api/users/user_passkey';

/**
 * Passkey服务类
 * 提供与后端Passkey API的交互接口
 */
export class PasskeyService {
  private baseUrl = '/v1/auth/passkey';
  private userUrl = '/v1/user/passkeys';

  /**
   * 获取Passkey注册选项
   */
  async getRegistrationOptions(): Promise<PasskeyRegistrationOptionsResponse> {
    return httpClient.post(`${this.baseUrl}/registration/options`, {});
  }

  /**
   * 验证并完成Passkey注册
   */
  async registerPasskey(request: PasskeyRegistrationRequest): Promise<PasskeyRegistrationResponse> {
    return httpClient.post(`${this.baseUrl}/registration/verify`, request);
  }

  /**
   * 获取Passkey认证选项
   */
  async getAuthenticationOptions(): Promise<PasskeyAuthenticationOptionsResponse> {
    return httpClient.post(`${this.baseUrl}/authentication/options`, {});
  }

  /**
   * 验证并完成Passkey认证
   */
  async authenticatePasskey(request: PasskeyAuthenticationRequest): Promise<PasskeyAuthenticationResponse> {
    return httpClient.post(`${this.baseUrl}/authentication/verify`, request);
  }

  /**
   * 获取用户的Passkey列表
   */
  async getPasskeyList(request: GetPasskeyListRequest): Promise<PasskeyListResponse> {
    const params = new URLSearchParams();
    if (request.pagination?.page) {
      params.append('page', request.pagination.page.toString());
    }
    if (request.pagination?.pageSize) {
      params.append('pageSize', request.pagination.pageSize.toString());
    }

    const url = params.toString() ? `${this.userUrl}?${params}` : this.userUrl;
    return httpClient.get(url);
  }

  /**
   * 删除Passkey凭据
   */
  async deletePasskey(request: DeletePasskeyRequest): Promise<DeletePasskeyResponse> {
    return httpClient.delete(`${this.userUrl}/${request.credentialId}`) as Promise<DeletePasskeyResponse>;
  }

  /**
   * 重命名Passkey凭据
   */
  async renamePasskey(request: RenamePasskeyRequest): Promise<RenamePasskeyResponse> {
    return httpClient.put(`${this.userUrl}/${request.credentialId}/name`, {
      newName: request.newName
    });
  }

  /**
   * 完整的Passkey注册流程
   * 包括获取选项、用户交互、发送注册请求
   */
  async completeRegistration(credentialName?: string): Promise<PasskeyRegistrationResponse> {
    // 1. 检查浏览器支持
    if (!PasskeyUtils.isWebAuthnSupported()) {
      throw new Error('此浏览器不支持Passkey认证');
    }

    try {
      // 2. 获取注册选项
      const optionsResponse = await this.getRegistrationOptions();
      if (!optionsResponse.base?.success || !optionsResponse.data) {
        throw new Error(optionsResponse.base?.message || '获取注册选项失败');
      }

      const options = optionsResponse.data;

      // 验证必需字段
      if (!options.challenge || !options.user?.id || !options.user?.name || !options.user?.displayName) {
        throw new Error('注册选项数据不完整');
      }

      // 3. 使用WebAuthn API创建凭据
      const registrationResult = await PasskeyManager.register({
        challenge: options.challenge,
        userId: options.user.id,
        userName: options.user.name,
        userDisplayName: options.user.displayName,
        rpId: options.rpId,
        rpName: options.rpName,
        excludeCredentials: options.excludeCredentials,
        userVerification: options.userVerification as UserVerificationRequirement,
        timeout: options.timeout
      });

      // 4. 发送注册请求到服务器
      const registrationRequest: PasskeyRegistrationRequest = {
        credentialId: registrationResult.credentialId,
        publicKey: registrationResult.publicKey,
        attestationObject: registrationResult.attestationObject,
        clientDataJSON: registrationResult.clientDataJSON,
        credentialName: credentialName || PasskeyUtils.getDeviceDescription(),
        deviceType: PasskeyUtils.getDeviceType()
      };

      return await this.registerPasskey(registrationRequest);

    } catch (error) {
      // 处理特定的WebAuthn错误
      if (error instanceof Error && 'type' in error) {
        throw error;
      }
      
      // 处理其他错误
      const message = error instanceof Error ? error.message : '注册失败';
      throw new Error(message);
    }
  }

  /**
   * 完整的Passkey认证流程
   * 包括获取选项、用户交互、发送认证请求
   */
  async completeAuthentication(): Promise<PasskeyAuthenticationResponse> {
    // 1. 检查浏览器支持
    if (!PasskeyUtils.isWebAuthnSupported()) {
      throw new Error('此浏览器不支持Passkey认证');
    }

    try {
      // 2. 获取认证选项
      const optionsResponse = await this.getAuthenticationOptions();
      if (!optionsResponse.base?.success || !optionsResponse.data) {
        throw new Error(optionsResponse.base?.message || '获取认证选项失败');
      }

      const options = optionsResponse.data;

      // 验证必需字段
      if (!options.challenge) {
        throw new Error('认证选项数据不完整');
      }

      // 3. 使用WebAuthn API进行认证
      const authenticationResult = await PasskeyManager.authenticate({
        challenge: options.challenge,
        rpId: options.rpId,
        allowCredentials: options.allowCredentials,
        userVerification: options.userVerification as UserVerificationRequirement,
        timeout: options.timeout
      });

      // 4. 发送认证请求到服务器
      const authenticationRequest: PasskeyAuthenticationRequest = {
        credentialId: authenticationResult.credentialId,
        authenticatorData: authenticationResult.authenticatorData,
        signature: authenticationResult.signature,
        clientDataJSON: authenticationResult.clientDataJSON,
        userHandle: authenticationResult.userHandle
      };

      return await this.authenticatePasskey(authenticationRequest);

    } catch (error) {
      // 处理特定的WebAuthn错误
      if (error instanceof Error && 'type' in error) {
        throw error;
      }
      
      // 处理其他错误
      const message = error instanceof Error ? error.message : '认证失败';
      throw new Error(message);
    }
  }

  /**
   * 检查设备Passkey支持情况
   */
  async checkSupport(): Promise<{
    isSupported: boolean;
    hasConditionalUI: boolean;
    hasPlatformAuthenticator: boolean;
    deviceType: string;
    deviceDescription: string;
  }> {
    const isSupported = PasskeyUtils.isWebAuthnSupported();
    
    if (!isSupported) {
      return {
        isSupported: false,
        hasConditionalUI: false,
        hasPlatformAuthenticator: false,
        deviceType: 'unknown',
        deviceDescription: 'Unknown Device'
      };
    }

    const [hasConditionalUI, hasPlatformAuthenticator] = await Promise.all([
      PasskeyUtils.isConditionalMediationSupported(),
      PasskeyUtils.isUserVerifyingPlatformAuthenticatorAvailable()
    ]);

    return {
      isSupported,
      hasConditionalUI,
      hasPlatformAuthenticator,
      deviceType: PasskeyUtils.getDeviceType(),
      deviceDescription: PasskeyUtils.getDeviceDescription()
    };
  }
}

// 创建并导出服务实例
export const passkeyService = new PasskeyService();

// 导出类型
export type {
  PasskeyRegistrationOptionsResponse,
  PasskeyRegistrationRequest,
  PasskeyRegistrationResponse,
  PasskeyAuthenticationOptionsResponse,
  PasskeyAuthenticationRequest,
  PasskeyAuthenticationResponse,
  GetPasskeyListRequest,
  PasskeyListResponse,
  DeletePasskeyRequest,
  DeletePasskeyResponse,
  RenamePasskeyRequest,
  RenamePasskeyResponse,
} from '@/types/generated/api/users/user_passkey'; 