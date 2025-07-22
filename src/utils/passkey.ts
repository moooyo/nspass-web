// WebAuthn API 类型声明
declare global {
  interface PublicKeyCredential extends Credential {
    readonly response: AuthenticatorResponse;
  }
  
  interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
    readonly authenticatorData: ArrayBuffer;
    readonly signature: ArrayBuffer;
    readonly userHandle: ArrayBuffer | null;
  }
  
  interface AuthenticatorAttestationResponse extends AuthenticatorResponse {
    readonly attestationObject: ArrayBuffer;
    getPublicKey(): ArrayBuffer | null;
    getPublicKeyAlgorithm(): number;
  }
  
  interface AuthenticatorResponse {
    readonly clientDataJSON: ArrayBuffer;
  }
}

/**
 * Passkey 工具类
 * 提供 WebAuthn API 的封装和工具方法
 */
export class PasskeyUtils {
  /**
   * 检查浏览器是否支持 WebAuthn
   */
  static isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && 
           !!window.PublicKeyCredential &&
           typeof navigator.credentials?.create === 'function' &&
           typeof navigator.credentials?.get === 'function';
  }

  /**
   * 检查是否支持条件式 UI
   */
  static async isConditionalMediationSupported(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) return false;
    
    try {
      return await PublicKeyCredential.isConditionalMediationAvailable();
    } catch {
      return false;
    }
  }

  /**
   * 检查是否支持用户验证平台认证器
   */
  static async isUserVerifyingPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isWebAuthnSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * 将 ArrayBuffer 转换为 base64 字符串
   */
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  /**
   * 将 base64 字符串转换为 ArrayBuffer
   */
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * 生成随机挑战值
   */
  static generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  /**
   * 获取设备类型
   */
  static getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 获取设备信息描述
   */
  static getDeviceDescription(): string {
    if (typeof window === 'undefined') return 'Unknown Device';
    
    const userAgent = window.navigator.userAgent;
    
    if (/iPhone/.test(userAgent)) {
      return 'iPhone';
    } else if (/iPad/.test(userAgent)) {
      return 'iPad';
    } else if (/Android/.test(userAgent)) {
      return 'Android Device';
    } else if (/Macintosh/.test(userAgent)) {
      return 'Mac';
    } else if (/Windows/.test(userAgent)) {
      return 'Windows PC';
    } else if (/Linux/.test(userAgent)) {
      return 'Linux PC';
    } else {
      return 'Desktop Computer';
    }
  }

  /**
   * 处理 WebAuthn 错误
   */
  static handleWebAuthnError(error: any): { 
    message: string; 
    type: 'user_cancelled' | 'not_supported' | 'security' | 'network' | 'unknown' 
  } {
    const err = error as Error;
    
    switch (err.name) {
      case 'NotAllowedError':
        return {
          message: 'Passkey认证被拒绝或超时',
          type: 'user_cancelled'
        };
      case 'SecurityError':
        return {
          message: 'Passkey认证安全错误，请确保使用HTTPS连接',
          type: 'security'
        };
      case 'NotSupportedError':
        return {
          message: '此设备不支持Passkey认证',
          type: 'not_supported'
        };
      case 'NetworkError':
        return {
          message: '网络连接错误，请检查网络连接',
          type: 'network'
        };
      case 'AbortError':
        return {
          message: 'Passkey认证已取消',
          type: 'user_cancelled'
        };
      case 'ConstraintError':
        return {
          message: 'Passkey认证约束错误',
          type: 'not_supported'
        };
      case 'InvalidStateError':
        return {
          message: 'Passkey认证状态无效',
          type: 'unknown'
        };
      case 'TimeoutError':
        return {
          message: 'Passkey认证超时',
          type: 'user_cancelled'
        };
      default:
        return {
          message: `Passkey认证失败: ${err.message || '未知错误'}`,
          type: 'unknown'
        };
    }
  }

  /**
   * 验证挑战值格式
   */
  static isValidChallenge(challenge: string): boolean {
    try {
      // 检查是否为有效的 base64 字符串
      const decoded = atob(challenge);
      return decoded.length >= 16; // 至少16字节
    } catch {
      return false;
    }
  }

  /**
   * 验证凭据ID格式
   */
  static isValidCredentialId(credentialId: string): boolean {
    try {
      // 检查是否为有效的 base64 字符串
      const decoded = atob(credentialId);
      return decoded.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 格式化认证器传输方式
   */
  static formatTransports(transports?: AuthenticatorTransport[]): AuthenticatorTransport[] {
    const defaultTransports: AuthenticatorTransport[] = ['internal', 'usb', 'nfc', 'ble'];
    return transports && transports.length > 0 ? transports : defaultTransports;
  }

  /**
   * 创建 Passkey 注册选项
   */
  static createRegistrationOptions(options: {
    challenge: string;
    userId: string;
    userName: string;
    userDisplayName: string;
    rpId?: string;
    rpName?: string;
    excludeCredentials?: string[];
    userVerification?: UserVerificationRequirement;
    timeout?: number;
  }): PublicKeyCredentialCreationOptions {
    const rpId = options.rpId || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    
    return {
      challenge: this.base64ToArrayBuffer(options.challenge),
      rp: {
        id: rpId,
        name: options.rpName || 'NSPass'
      },
      user: {
        id: new TextEncoder().encode(options.userId),
        name: options.userName,
        displayName: options.userDisplayName
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: options.userVerification || 'preferred',
        requireResidentKey: false
      },
      excludeCredentials: options.excludeCredentials?.map(id => ({
        id: this.base64ToArrayBuffer(id),
        type: 'public-key' as const,
        transports: this.formatTransports()
      })) || [],
      timeout: options.timeout || 60000
    };
  }

  /**
   * 创建 Passkey 认证选项
   */
  static createAuthenticationOptions(options: {
    challenge: string;
    rpId?: string;
    allowCredentials?: string[];
    userVerification?: UserVerificationRequirement;
    timeout?: number;
  }): PublicKeyCredentialRequestOptions {
    const rpId = options.rpId || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    
    return {
      challenge: this.base64ToArrayBuffer(options.challenge),
      rpId,
      allowCredentials: options.allowCredentials?.map(id => ({
        id: this.base64ToArrayBuffer(id),
        type: 'public-key' as const,
        transports: this.formatTransports()
      })) || [],
      userVerification: options.userVerification || 'preferred',
      timeout: options.timeout || 60000
    };
  }
}

/**
 * Passkey 注册结果
 */
export interface PasskeyRegistrationResult {
  credentialId: string;
  publicKey: string;
  attestationObject: string;
  clientDataJSON: string;
}

/**
 * Passkey 认证结果
 */
export interface PasskeyAuthenticationResult {
  credentialId: string;
  authenticatorData: string;
  signature: string;
  clientDataJSON: string;
  userHandle?: string;
}

/**
 * Passkey 管理器
 * 提供高级的 Passkey 操作接口
 */
export class PasskeyManager {
  /**
   * 注册新的 Passkey 凭据
   */
  static async register(options: {
    challenge: string;
    userId: string;
    userName: string;
    userDisplayName: string;
    rpId?: string;
    rpName?: string;
    excludeCredentials?: string[];
    userVerification?: UserVerificationRequirement;
    timeout?: number;
  }): Promise<PasskeyRegistrationResult> {
    if (!PasskeyUtils.isWebAuthnSupported()) {
      throw new Error('此浏览器不支持 WebAuthn');
    }

    const createOptions = PasskeyUtils.createRegistrationOptions(options);
    
    try {
      const credential = await navigator.credentials.create({
        publicKey: createOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('凭据创建失败');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      return {
        credentialId: PasskeyUtils.arrayBufferToBase64(credential.rawId),
        publicKey: PasskeyUtils.arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
        attestationObject: PasskeyUtils.arrayBufferToBase64(response.attestationObject),
        clientDataJSON: PasskeyUtils.arrayBufferToBase64(response.clientDataJSON)
      };
    } catch (error) {
      const { message, type } = PasskeyUtils.handleWebAuthnError(error);
      const err = new Error(message) as Error & { type: string };
      err.type = type;
      throw err;
    }
  }

  /**
   * 使用 Passkey 进行认证
   */
  static async authenticate(options: {
    challenge: string;
    rpId?: string;
    allowCredentials?: string[];
    userVerification?: UserVerificationRequirement;
    timeout?: number;
  }): Promise<PasskeyAuthenticationResult> {
    if (!PasskeyUtils.isWebAuthnSupported()) {
      throw new Error('此浏览器不支持 WebAuthn');
    }

    const getOptions = PasskeyUtils.createAuthenticationOptions(options);
    
    try {
      const credential = await navigator.credentials.get({
        publicKey: getOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('认证失败');
      }

      const response = credential.response as AuthenticatorAssertionResponse;
      
      return {
        credentialId: PasskeyUtils.arrayBufferToBase64(credential.rawId),
        authenticatorData: PasskeyUtils.arrayBufferToBase64(response.authenticatorData),
        signature: PasskeyUtils.arrayBufferToBase64(response.signature),
        clientDataJSON: PasskeyUtils.arrayBufferToBase64(response.clientDataJSON),
        userHandle: response.userHandle ? PasskeyUtils.arrayBufferToBase64(response.userHandle) : undefined
      };
    } catch (error) {
      const { message, type } = PasskeyUtils.handleWebAuthnError(error);
      const err = new Error(message) as Error & { type: string };
      err.type = type;
      throw err;
    }
  }
} 