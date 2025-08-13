// 临时类型定义文件，替代protobuf生成的类型

export interface ServerItem {
  id: string;
  name: string;
  ipv4?: string;
  ipv6?: string;
  country?: string;
  group?: string;
  status: ServerStatus;
  uploadTraffic?: number;
  downloadTraffic?: number;
  availablePorts?: string;
  ingressIpv4?: IngressIpv4Entry[];
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum ServerStatus {
  SERVER_STATUS_UNSPECIFIED = 0,
  SERVER_STATUS_ONLINE = 1,
  SERVER_STATUS_OFFLINE = 2,
  SERVER_STATUS_PENDING_INSTALL = 3,
  SERVER_STATUS_UNKNOWN = 4,
}

export interface IngressIpv4Entry {
  ip: string;
  port: number;
}

export interface CreateServerRequest {
  name: string;
  ipv4?: string;
  ipv6?: string;
  country?: string;
  group?: string;
  status?: ServerStatus;
  availablePorts?: string;
  ingressIpv4?: IngressIpv4Entry[];
}

export interface UpdateServerRequest {
  name?: string;
  ipv4?: string;
  ipv6?: string;
  country?: string;
  group?: string;
  status?: ServerStatus;
  uploadTraffic?: number;
  downloadTraffic?: number;
  availablePorts?: string;
  ingressIpv4?: IngressIpv4Entry[];
}

export interface RegenerateServerTokenRequest {
  serverId: string;
}

export interface RegenerateAllServerTokensRequest {
  // Empty request
}

export interface RegenerateServerTokenResponse {
  server: ServerItem;
}

export interface RegenerateAllServerTokensResponse {
  servers: ServerItem[];
}