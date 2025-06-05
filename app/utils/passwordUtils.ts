import { hash } from 'bcryptjs';

/**
 * 模拟密码哈希函数
 * 在实际应用中，应该使用 bcrypt 或其他安全的哈希算法
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
} 