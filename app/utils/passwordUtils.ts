import { hash } from 'bcryptjs';

/**
 * 模拟密码哈希函数
 * 在实际应用中，应该使用 bcrypt 或其他安全的哈希算法
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * 生成指定范围内的随机端口号
 * @param min 最小端口号，默认20000
 * @param max 最大端口号，默认50000
 * @returns 随机端口号
 */
export function generateRandomPort(min: number = 20000, max: number = 50000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 验证端口号是否在有效范围内
 * @param port 端口号
 * @returns 是否有效
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}