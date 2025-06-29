import type {
  PasskeyCredential,
  PasskeyRegistrationOptions,
  PasskeyAuthenticationOptions,
  PasskeyLoginData,
  PasskeyUser,
} from '@/types/generated/api/users/user_passkey';

/**
 * 模拟Passkey凭据数据
 */
export const mockPasskeyCredentials: PasskeyCredential[] = [
  {
    id: 'Y3JlZF8xX2Jhc2U2NF9lbmNvZGVkX2lk', // base64 of "cred_1_base64_encoded_id"
    userId: 'user_1',
    name: 'iPhone 15 Pro Touch ID',
    deviceType: 'mobile',
    createdAt: '2024-01-15T10:30:00Z',
    lastUsedAt: '2024-01-20T14:45:00Z',
    isActive: true,
  },
  {
    id: 'Y3JlZF8yX2Jhc2U2NF9lbmNvZGVkX2lk', // base64 of "cred_2_base64_encoded_id"
    userId: 'user_1',
    name: 'MacBook Pro Touch ID',
    deviceType: 'desktop',
    createdAt: '2024-01-10T09:15:00Z',
    lastUsedAt: '2024-01-19T16:20:00Z',
    isActive: true,
  },
  {
    id: 'Y3JlZF8zX2Jhc2U2NF9lbmNvZGVkX2lk', // base64 of "cred_3_base64_encoded_id"
    userId: 'user_2',
    name: 'YubiKey 5C',
    deviceType: 'security_key',
    createdAt: '2024-01-05T11:00:00Z',
    lastUsedAt: '2024-01-18T13:10:00Z',
    isActive: true,
  },
  {
    id: 'Y3JlZF80X2Jhc2U2NF9lbmNvZGVkX2lk', // base64 of "cred_4_base64_encoded_id"
    userId: 'user_2',
    name: 'Android 手机指纹',
    deviceType: 'mobile',
    createdAt: '2024-01-08T15:30:00Z',
    lastUsedAt: '2024-01-17T10:05:00Z',
    isActive: false,
  },
];

/**
 * 模拟用户数据
 */
export const mockPasskeyUsers: PasskeyUser[] = [
  {
    id: 'dXNlcl8x', // base64编码的 "user_1"
    name: 'passkey-user',
    displayName: 'Passkey用户',
  },
  {
    id: 'dXNlcl8y', // base64编码的 "user_2"
    name: 'admin',
    displayName: '管理员',
  },
  {
    id: 'dXNlcl8z', // base64编码的 "user_3"
    name: 'demo',
    displayName: '演示用户',
  },
];

/**
 * 生成模拟的Passkey注册选项
 */
export function generateMockRegistrationOptions(): PasskeyRegistrationOptions {
  // 生成随机挑战值 - 使用安全的base64编码方式
  const challengeArray = crypto.getRandomValues(new Uint8Array(32));
  let binaryString = '';
  for (let i = 0; i < challengeArray.length; i++) {
    binaryString += String.fromCharCode(challengeArray[i]);
  }
  const challenge = btoa(binaryString);

  const user = mockPasskeyUsers[0]; // 默认使用第一个用户

  return {
    challenge,
    rpId: 'localhost',
    rpName: 'NSPass Development',
    user,
    excludeCredentials: mockPasskeyCredentials
      .filter(cred => cred.userId === 'user_1')
      .map(cred => cred.id || '')
      .filter(id => id !== ''),
    userVerification: 'preferred',
    timeout: 60000,
  };
}

/**
 * 生成模拟的Passkey认证选项
 */
export function generateMockAuthenticationOptions(): PasskeyAuthenticationOptions {
  // 生成随机挑战值 - 使用安全的base64编码方式
  const challengeArray = crypto.getRandomValues(new Uint8Array(32));
  let binaryString = '';
  for (let i = 0; i < challengeArray.length; i++) {
    binaryString += String.fromCharCode(challengeArray[i]);
  }
  const challenge = btoa(binaryString);

  return {
    challenge,
    rpId: 'localhost',
    allowCredentials: mockPasskeyCredentials
      .filter(cred => cred.isActive)
      .map(cred => cred.id || '')
      .filter(id => id !== ''),
    userVerification: 'preferred',
    timeout: 60000,
  };
}

/**
 * 生成模拟的Passkey登录数据
 */
export function generateMockLoginData(credentialId?: string): PasskeyLoginData {
  // 根据凭据ID查找对应的凭据信息
  const credential = credentialId 
    ? mockPasskeyCredentials.find(cred => cred.id === credentialId)
    : mockPasskeyCredentials[0];

  const credentialName = credential?.name || 'Unknown Device';
  
  return {
    id: 1001,
    name: 'passkey-user',
    email: 'passkey@nspass.com',
    role: 'user',
    token: `mock-passkey-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    expiresIn: 3600,
    credentialName,
  };
}

/**
 * 模拟新创建的Passkey凭据
 */
export function generateMockPasskeyCredential(
  credentialId: string,
  credentialName: string,
  deviceType: string
): PasskeyCredential {
  return {
    id: credentialId,
    userId: 'user_1',
    name: credentialName,
    deviceType,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    isActive: true,
  };
}

/**
 * 设备类型映射到显示名称
 */
export const deviceTypeDisplayNames: Record<string, string> = {
  mobile: '移动设备',
  desktop: '桌面设备',
  tablet: '平板设备',
  security_key: '安全密钥',
  unknown: '未知设备',
};

/**
 * 常用错误消息
 */
export const passkeyErrorMessages = {
  notSupported: '您的浏览器不支持Passkey认证',
  userCancelled: 'Passkey认证被用户取消',
  timeout: 'Passkey认证超时，请重试',
  securityError: '安全错误，请确保使用HTTPS连接',
  invalidCredential: '无效的Passkey凭据',
  credentialNotFound: '未找到指定的Passkey凭据',
  registrationFailed: 'Passkey注册失败',
  authenticationFailed: 'Passkey认证失败',
}; 