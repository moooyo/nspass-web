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

/**
 * 解析服务器可用端口范围字符串
 * @param availablePorts 端口范围字符串，格式：10000-20000;30001;30002
 * @returns 端口范围数组，每个元素包含 min 和 max
 */
export function parseAvailablePorts(availablePorts?: string): Array<{ min: number; max: number }> {
  if (!availablePorts || availablePorts.trim() === '') {
    // 如果没有指定端口范围，返回默认范围
    return [{ min: 1, max: 65535 }];
  }

  const ranges: Array<{ min: number; max: number }> = [];
  const parts = availablePorts.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      // 端口范围，如 10000-20000
      const [minStr, maxStr] = trimmed.split('-');
      const min = parseInt(minStr.trim(), 10);
      const max = parseInt(maxStr.trim(), 10);

      if (isValidPort(min) && isValidPort(max) && min <= max) {
        ranges.push({ min, max });
      }
    } else {
      // 单个端口，如 30001
      const port = parseInt(trimmed, 10);
      if (isValidPort(port)) {
        ranges.push({ min: port, max: port });
      }
    }
  }

  return ranges.length > 0 ? ranges : [{ min: 1, max: 65535 }];
}

/**
 * 检查端口是否在可用范围内
 * @param port 要检查的端口
 * @param availablePorts 可用端口范围字符串
 * @returns 是否在可用范围内
 */
export function isPortInAvailableRange(port: number, availablePorts?: string): boolean {
  if (!isValidPort(port)) return false;

  const ranges = parseAvailablePorts(availablePorts);
  return ranges.some(range => port >= range.min && port <= range.max);
}

/**
 * 根据服务器可用端口范围生成随机端口
 * @param availablePorts 服务器可用端口范围字符串
 * @param preferredMin 首选最小端口（默认20000）
 * @param preferredMax 首选最大端口（默认50000）
 * @returns 随机端口号
 */
export function generateRandomPortFromRange(
  availablePorts?: string,
  preferredMin: number = 20000,
  preferredMax: number = 50000
): number {
  const ranges = parseAvailablePorts(availablePorts);

  // 尝试在首选范围内找到可用的端口范围
  const preferredRanges = ranges.filter(range =>
    !(range.max < preferredMin || range.min > preferredMax)
  );

  if (preferredRanges.length > 0) {
    // 在首选范围内生成端口
    const targetRange = preferredRanges[Math.floor(Math.random() * preferredRanges.length)];
    const min = Math.max(targetRange.min, preferredMin);
    const max = Math.min(targetRange.max, preferredMax);
    return generateRandomPort(min, max);
  }

  // 如果首选范围不可用，从所有可用范围中选择
  if (ranges.length > 0) {
    const targetRange = ranges[Math.floor(Math.random() * ranges.length)];
    return generateRandomPort(targetRange.min, targetRange.max);
  }

  // 兜底：使用默认范围
  return generateRandomPort(preferredMin, preferredMax);
}