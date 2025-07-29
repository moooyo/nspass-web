/**
 * 出口配置解析工具函数
 * 用于解析EgressItem中的egressConfig JSON字符串
 */

import { EgressMode } from '@/types/generated/model/egress';

/**
 * 解析egressConfig JSON字符串获取配置信息
 * @param egressConfig - JSON字符串格式的配置
 * @param egressMode - 出口模式（可选，用于验证）
 * @returns 解析后的配置对象
 */
export const parseEgressConfig = (egressConfig: string, egressMode?: EgressMode): any => {
    if (!egressConfig) return {};
    
    try {
        return JSON.parse(egressConfig);
    } catch (error) {
        console.warn('Failed to parse egressConfig:', egressConfig, error);
        return {};
    }
};

/**
 * 从EgressItem中提取目标地址
 * @param egressConfig - egressConfig JSON字符串
 * @param egressMode - 出口模式
 * @returns 目标地址字符串
 */
export const extractTargetAddress = (egressConfig: string, egressMode?: EgressMode): string => {
    const config = parseEgressConfig(egressConfig, egressMode);
    
    // 根据不同模式提取目标地址
    switch (egressMode) {
        case EgressMode.EGRESS_MODE_DIRECT:
            return config.target_address || config.targetAddress || '';
        case EgressMode.EGRESS_MODE_IPTABLES:
            return config.dest_ip || config.destAddress || '';
        default:
            return config.target_address || config.dest_ip || config.targetAddress || config.destAddress || '';
    }
};

/**
 * 从EgressItem中提取UDP支持状态
 * @param egressConfig - egressConfig JSON字符串
 * @param egressMode - 出口模式
 * @returns UDP支持状态
 */
export const extractUdpSupport = (egressConfig: string, egressMode?: EgressMode): boolean => {
    const config = parseEgressConfig(egressConfig, egressMode);
    return config.udp_support || config.supportUdp || false;
};

/**
 * 从EgressItem中提取转发类型
 * @param egressConfig - egressConfig JSON字符串
 * @param egressMode - 出口模式
 * @returns 转发类型字符串
 */
export const extractForwardType = (egressConfig: string, egressMode?: EgressMode): string => {
    const config = parseEgressConfig(egressConfig, egressMode);
    return config.forward_type || config.forwardType || '';
};

/**
 * 从EgressItem中提取目标端口
 * @param egressConfig - egressConfig JSON字符串
 * @param egressMode - 出口模式
 * @returns 目标端口字符串
 */
export const extractDestPort = (egressConfig: string, egressMode?: EgressMode): string => {
    const config = parseEgressConfig(egressConfig, egressMode);
    return config.dest_port || config.destPort || '';
};

/**
 * 构建egressConfig JSON字符串
 * @param values - 表单值对象
 * @param egressMode - 出口模式
 * @returns JSON字符串
 */
export const buildEgressConfig = (values: any, egressMode: EgressMode): string => {
    let config: any = {};

    switch (egressMode) {
        case EgressMode.EGRESS_MODE_DIRECT:
            config = {
                target_address: values.targetAddress
            };
            break;
        case EgressMode.EGRESS_MODE_IPTABLES:
            config = {
                forward_type: values.forwardType,
                dest_ip: values.destAddress,
                dest_port: values.destPort
            };
            break;
        case EgressMode.EGRESS_MODE_SS2022:
            config = {
                udp_support: values.supportUdp || false,
                method: values.cipher || '2022-blake3-aes-128-gcm'
            };
            break;
        case EgressMode.EGRESS_MODE_TROJAN:
            config = {
                udp_support: values.supportUdp || false,
                sni: values.sni || '',
                skip_cert_verify: values.skipCertVerify || false
            };
            break;
        case EgressMode.EGRESS_MODE_SNELL:
            config = {
                udp_support: values.supportUdp || false,
                version: values.version || 'v4'
            };
            break;
        default:
            return '';
    }

    return Object.keys(config).length > 0 ? JSON.stringify(config) : '';
};

/**
 * 验证egressConfig JSON字符串的有效性
 * @param egressConfig - JSON字符串格式的配置
 * @param egressMode - 出口模式
 * @returns 验证结果和错误信息
 */
export const validateEgressConfig = (egressConfig: string, egressMode: EgressMode): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!egressConfig) {
        errors.push('配置不能为空');
        return { valid: false, errors };
    }

    let config: any;
    try {
        config = JSON.parse(egressConfig);
    } catch (error) {
        errors.push('配置格式不正确，必须是有效的JSON');
        return { valid: false, errors };
    }

    // 根据模式验证必需字段
    switch (egressMode) {
        case EgressMode.EGRESS_MODE_DIRECT:
            if (!config.target_address && !config.targetAddress) {
                errors.push('直出模式需要目标地址');
            }
            break;
        case EgressMode.EGRESS_MODE_IPTABLES:
            if (!config.forward_type && !config.forwardType) {
                errors.push('iptables模式需要转发类型');
            }
            if (!config.dest_ip && !config.destAddress) {
                errors.push('iptables模式需要目标IP');
            }
            if (!config.dest_port && !config.destPort) {
                errors.push('iptables模式需要目标端口');
            }
            break;
        case EgressMode.EGRESS_MODE_SS2022:
        case EgressMode.EGRESS_MODE_TROJAN:
        case EgressMode.EGRESS_MODE_SNELL:
            // 这些模式的配置是可选的，主要依赖通用字段
            break;
        default:
            errors.push('未知的出口模式');
    }

    return { valid: errors.length === 0, errors };
};
