// 临时Egress类型定义

export enum EgressType {
  EGRESS_TYPE_UNSPECIFIED = 0,
  EGRESS_TYPE_SNELL = 1,
  EGRESS_TYPE_TROJAN = 2,
  EGRESS_TYPE_SHADOWSOCKS = 3,
}

export interface EgressConfig {
  id: string;
  name: string;
  type: EgressType;
  serverId: string;
  port: number;
  config: Record<string, any>;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SnellConfig {
  password: string;
  obfs?: string;
}

export interface TrojanConfig {
  password: string;
  sni?: string;
}

export interface ShadowsocksConfig {
  method: string;
  password: string;
  plugin?: string;
  pluginOpts?: string;
}