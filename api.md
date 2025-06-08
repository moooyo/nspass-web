# NSPASS API 文档

本文档描述了NSPASS系统的API接口，包括请求URI、参数和返回值。

## 目录

- [通用规范](#通用规范)
- [认证接口](#认证接口)
- [用户接口](#用户接口)
- [用户信息接口](#用户信息接口)
- [服务器接口](#服务器接口)
- [用户组接口](#用户组接口)
- [用户配置接口](#用户配置接口)
- [网站配置接口](#网站配置接口)
- [仪表盘接口](#仪表盘接口)

## 通用规范

### 基础URL

```
https://api.example.com
```

### 响应格式

所有API响应都遵循以下基本格式：

```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

对于分页接口，响应中会包含分页信息：

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

当API请求出错时，会返回非200状态码和错误信息：

```json
{
  "success": false,
  "message": "错误信息描述"
}
```

## 认证接口

### 登录

- **URI**: `/auth/login`
- **方法**: POST
- **描述**: 用户登录接口

**请求参数**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

**返回值**:

```json
{
  "success": true,
  "data": {
    "token": "mock-jwt-token-xxx",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "role": "admin"
    }
  }
}
```

## 用户接口

### 获取用户列表

- **URI**: `/users`
- **方法**: GET
- **描述**: 获取系统用户列表

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| pageSize | number | 否 | 每页条数，默认为10 |
| status | string | 否 | 用户状态筛选 |

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "管理员",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "createTime": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 创建用户

- **URI**: `/users`
- **方法**: POST
- **描述**: 创建新用户

**请求参数**:

```json
{
  "name": "新用户",
  "email": "user@example.com",
  "role": "user",
  "status": "active"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户创建成功",
  "data": {
    "id": 10,
    "name": "新用户",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createTime": "2023-05-20T08:30:00Z"
  }
}
```

### 获取单个用户

- **URI**: `/users/:id`
- **方法**: GET
- **描述**: 获取指定ID的用户信息

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**返回值**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "管理员",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "createTime": "2023-01-01T00:00:00Z"
  }
}
```

### 更新用户

- **URI**: `/users/:id`
- **方法**: PUT
- **描述**: 更新指定ID的用户信息

**请求参数**:

```json
{
  "name": "更新后的名称",
  "email": "updated@example.com",
  "role": "admin",
  "status": "active"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户更新成功",
  "data": {
    "id": 1,
    "name": "更新后的名称",
    "email": "updated@example.com",
    "role": "admin",
    "status": "active",
    "createTime": "2023-01-01T00:00:00Z"
  }
}
```

### 删除用户

- **URI**: `/users/:id`
- **方法**: DELETE
- **描述**: 删除指定ID的用户

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 用户ID |

**返回值**:

```json
{
  "success": true,
  "message": "用户删除成功"
}
```

## 用户信息接口

### 获取当前用户信息

- **URI**: `/user/info`
- **方法**: GET
- **描述**: 获取当前登录用户的信息

**返回值**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "管理员",
    "role": "admin",
    "user_group": "VIP",
    "traffic": "100GB",
    "traffic_reset_date": "2023-06-01",
    "forward_rule_config_limit": "10",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "create_time": "2023-01-01T00:00:00Z",
    "last_login_time": "2023-05-20T08:30:00Z"
  }
}
```

### 更新当前用户信息

- **URI**: `/user/info`
- **方法**: PUT
- **描述**: 更新当前登录用户的信息

**请求参数**:

```json
{
  "name": "新名称",
  "email": "newemail@example.com",
  "phone": "13900139000",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**返回值**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "新名称",
    "email": "newemail@example.com",
    "phone": "13900139000",
    "avatar": "https://example.com/new-avatar.jpg",
    "role": "admin",
    "status": "active",
    "createTime": "2023-01-01T00:00:00Z"
  }
}
```

### 修改密码

- **URI**: `/user/changePassword`
- **方法**: POST
- **描述**: 修改当前用户密码

**请求参数**:

```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码",
  "confirmPassword": "确认新密码"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "密码修改成功"
}
```

### 获取流量统计

- **URI**: `/user/trafficStats`
- **方法**: GET
- **描述**: 获取当前用户的流量使用统计

**返回值**:

```json
{
  "success": true,
  "data": {
    "totalUsed": 5000,
    "totalLimit": 10000,
    "dailyUsage": [
      {
        "date": "2023-05-01",
        "upload": 500,
        "download": 700
      },
      {
        "date": "2023-05-02",
        "upload": 600,
        "download": 800
      }
    ],
    "monthlyUsage": [
      {
        "month": "2023-04",
        "upload": 3000,
        "download": 4000
      },
      {
        "month": "2023-05",
        "upload": 2000,
        "download": 3000
      }
    ]
  }
}
```

### 上传头像

- **URI**: `/user/avatar`
- **方法**: POST
- **描述**: 上传用户头像

**请求参数**: 表单数据，包含图片文件

**返回值**:

```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://example.com/avatars/user_1.jpg"
  }
}
```

## 服务器接口

### 获取服务器列表

- **URI**: `/servers`
- **方法**: GET
- **描述**: 获取服务器列表

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| pageSize | number | 否 | 每页条数，默认为10 |
| name | string | 否 | 服务器名称模糊搜索 |
| status | string | 否 | 服务器状态筛选 |
| region | string | 否 | 服务器区域筛选 |

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "美国服务器",
      "ipv4": "192.168.1.1",
      "ipv6": "2001:db8::1",
      "region": "america",
      "group": "default",
      "status": "online",
      "registerTime": "2023-01-01T00:00:00Z",
      "uploadTraffic": 1000,
      "downloadTraffic": 2000
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 创建服务器

- **URI**: `/servers`
- **方法**: POST
- **描述**: 创建新服务器

**请求参数**:

```json
{
  "name": "新服务器",
  "ipv4": "192.168.1.2",
  "ipv6": "2001:db8::2",
  "region": "asia",
  "group": "default",
  "status": "online"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "服务器创建成功",
  "data": {
    "id": 2,
    "name": "新服务器",
    "ipv4": "192.168.1.2",
    "ipv6": "2001:db8::2",
    "region": "asia",
    "group": "default",
    "status": "online",
    "registerTime": "2023-05-20T08:30:00Z",
    "uploadTraffic": 0,
    "downloadTraffic": 0
  }
}
```

### 获取单个服务器

- **URI**: `/servers/:id`
- **方法**: GET
- **描述**: 获取指定ID的服务器信息

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 服务器ID |

**返回值**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "美国服务器",
    "ipv4": "192.168.1.1",
    "ipv6": "2001:db8::1",
    "region": "america",
    "group": "default",
    "status": "online",
    "registerTime": "2023-01-01T00:00:00Z",
    "uploadTraffic": 1000,
    "downloadTraffic": 2000
  }
}
```

### 更新服务器

- **URI**: `/servers/:id`
- **方法**: PUT
- **描述**: 更新指定ID的服务器信息

**请求参数**:

```json
{
  "name": "更新后的服务器名称",
  "ipv4": "192.168.1.3",
  "ipv6": "2001:db8::3",
  "region": "europe",
  "group": "premium",
  "status": "online"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "服务器更新成功",
  "data": {
    "id": 1,
    "name": "更新后的服务器名称",
    "ipv4": "192.168.1.3",
    "ipv6": "2001:db8::3",
    "region": "europe",
    "group": "premium",
    "status": "online",
    "registerTime": "2023-01-01T00:00:00Z",
    "uploadTraffic": 1000,
    "downloadTraffic": 2000
  }
}
```

### 删除服务器

- **URI**: `/servers/:id`
- **方法**: DELETE
- **描述**: 删除指定ID的服务器

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 服务器ID |

**返回值**:

```json
{
  "success": true,
  "message": "服务器删除成功"
}
```

### 重启服务器

- **URI**: `/servers/:id/restart`
- **方法**: POST
- **描述**: 重启指定ID的服务器

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 服务器ID |

**返回值**:

```json
{
  "success": true,
  "message": "服务器重启成功"
}
```

### 获取服务器区域列表

- **URI**: `/servers/regions`
- **方法**: GET
- **描述**: 获取支持的服务器区域列表

**返回值**:

```json
{
  "success": true,
  "data": [
    { "label": "亚洲", "value": "asia" },
    { "label": "欧洲", "value": "europe" },
    { "label": "美洲", "value": "america" },
    { "label": "大洋洲", "value": "oceania" }
  ]
}
```

## 用户组接口

### 获取用户组列表

- **URI**: `/userGroups`
- **方法**: GET
- **描述**: 获取用户组列表

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| pageSize | number | 否 | 每页条数，默认为10 |

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "groupId": "vip",
      "groupName": "VIP用户组",
      "userCount": 50
    },
    {
      "id": 2,
      "groupId": "basic",
      "groupName": "基础用户组",
      "userCount": 100
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

### 创建用户组

- **URI**: `/userGroups`
- **方法**: POST
- **描述**: 创建新用户组

**请求参数**:

```json
{
  "groupId": "premium",
  "groupName": "高级用户组"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户组创建成功",
  "data": {
    "id": 3,
    "groupId": "premium",
    "groupName": "高级用户组",
    "userCount": 0
  }
}
```

### 获取单个用户组

- **URI**: `/userGroups/:id`
- **方法**: GET
- **描述**: 获取指定ID的用户组信息

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 用户组ID |

**返回值**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "groupId": "vip",
    "groupName": "VIP用户组",
    "userCount": 50
  }
}
```

### 更新用户组

- **URI**: `/userGroups/:id`
- **方法**: PUT
- **描述**: 更新指定ID的用户组信息

**请求参数**:

```json
{
  "groupName": "更新后的VIP用户组"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户组更新成功",
  "data": {
    "id": 1,
    "groupId": "vip",
    "groupName": "更新后的VIP用户组",
    "userCount": 50
  }
}
```

### 删除用户组

- **URI**: `/userGroups/:id`
- **方法**: DELETE
- **描述**: 删除指定ID的用户组

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 用户组ID |

**返回值**:

```json
{
  "success": true,
  "message": "用户组删除成功"
}
```

### 批量更新用户组

- **URI**: `/userGroups/batch`
- **方法**: PUT
- **描述**: 批量更新用户组

**请求参数**:

```json
{
  "ids": [1, 2, 3],
  "updateData": {
    "groupName": "批量更新后的名称"
  }
}
```

**返回值**:

```json
{
  "success": true,
  "message": "批量更新成功"
}
```

## 用户配置接口

### 获取用户配置列表

- **URI**: `/users/settings`
- **方法**: GET
- **描述**: 获取用户配置列表

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，默认为1 |
| pageSize | number | 否 | 每页条数，默认为10 |
| username | string | 否 | 用户名筛选 |
| userGroup | string | 否 | 用户组筛选 |

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "userId": "1",
      "username": "user1",
      "userGroup": "vip",
      "expireTime": "2023-12-31T23:59:59Z",
      "trafficLimit": 100,
      "trafficResetType": "monthly",
      "ruleLimit": 10,
      "banned": false
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 更新用户配置

- **URI**: `/users/settings/:id`
- **方法**: PUT
- **描述**: 更新指定用户ID的配置

**请求参数**:

```json
{
  "userGroup": "premium",
  "expireTime": "2024-12-31T23:59:59Z",
  "trafficLimit": 200,
  "trafficResetType": "monthly",
  "ruleLimit": 20,
  "banned": false
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户配置更新成功",
  "data": {
    "userId": "1",
    "username": "user1",
    "userGroup": "premium",
    "expireTime": "2024-12-31T23:59:59Z",
    "trafficLimit": 200,
    "trafficResetType": "monthly",
    "ruleLimit": 20,
    "banned": false
  }
}
```

### 封禁/解封用户

- **URI**: `/users/settings/:id/ban`
- **方法**: PUT
- **描述**: 封禁或解封用户

**请求参数**:

```json
{
  "banned": true
}
```

**返回值**:

```json
{
  "success": true,
  "message": "用户已封禁"
}
```

### 批量操作用户配置

- **URI**: `/users/settings/batch`
- **方法**: PUT
- **描述**: 批量更新用户配置

**请求参数**:

```json
{
  "ids": [1, 2, 3],
  "updateData": {
    "userGroup": "basic",
    "trafficLimit": 50,
    "ruleLimit": 5
  }
}
```

**返回值**:

```json
{
  "success": true,
  "message": "批量更新成功"
}
```

## 网站配置接口

### 获取网站配置

- **URI**: `/settings`
- **方法**: GET
- **描述**: 获取网站配置

**返回值**:

```json
{
  "success": true,
  "data": {
    "siteName": "NSPASS",
    "allowRegister": true,
    "inviteStrategy": "code",
    "inviteCode": "NSPASS2023",
    "allowLookingGlass": true,
    "showAnnouncement": true,
    "announcementContent": "系统将于2023年6月1日进行维护，请提前做好准备。"
  }
}
```

### 更新网站配置

- **URI**: `/settings`
- **方法**: PUT
- **描述**: 更新网站配置

**请求参数**:

```json
{
  "siteName": "NSPASS Pro",
  "allowRegister": false,
  "inviteStrategy": "code",
  "inviteCode": "NSPASSPRO2023",
  "allowLookingGlass": true,
  "showAnnouncement": true,
  "announcementContent": "欢迎使用NSPASS Pro！"
}
```

**返回值**:

```json
{
  "success": true,
  "message": "网站配置更新成功",
  "data": {
    "siteName": "NSPASS Pro",
    "allowRegister": false,
    "inviteStrategy": "code",
    "inviteCode": "NSPASSPRO2023",
    "allowLookingGlass": true,
    "showAnnouncement": true,
    "announcementContent": "欢迎使用NSPASS Pro！"
  }
}
```

### 生成邀请码

- **URI**: `/settings/inviteCode`
- **方法**: POST
- **描述**: 生成新的邀请码

**返回值**:

```json
{
  "success": true,
  "data": {
    "code": "NSPASS-XXXXXXXX"
  }
}
```

## 仪表盘接口

### 获取系统概览

- **URI**: `/dashboard/overview`
- **方法**: GET
- **描述**: 获取系统概览数据

**返回值**:

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "totalServers": 10,
    "onlineServers": 8,
    "totalTraffic": 10000,
    "monthlyTraffic": 3000
  }
}
```

### 获取用户增长趋势

- **URI**: `/dashboard/userGrowth`
- **方法**: GET
- **描述**: 获取用户增长趋势数据

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "date": "2023-01",
      "count": 10
    },
    {
      "date": "2023-02",
      "count": 15
    },
    {
      "date": "2023-03",
      "count": 20
    }
  ]
}
```

### 获取流量使用趋势

- **URI**: `/dashboard/trafficUsage`
- **方法**: GET
- **描述**: 获取系统流量使用趋势

**返回值**:

```json
{
  "success": true,
  "data": [
    {
      "date": "2023-05-01",
      "upload": 500,
      "download": 700
    },
    {
      "date": "2023-05-02",
      "upload": 600,
      "download": 800
    },
    {
      "date": "2023-05-03",
      "upload": 550,
      "download": 750
    }
  ]
}
```

### 获取服务器状态分布

- **URI**: `/dashboard/serverStatus`
- **方法**: GET
- **描述**: 获取服务器状态分布

**返回值**:

```json
{
  "success": true,
  "data": {
    "online": 8,
    "offline": 2,
    "maintenance": 0
  }
}
``` 