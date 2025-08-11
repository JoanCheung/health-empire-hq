# 小程序 API 集成说明

本文档说明如何使用修改后的小程序，该小程序已从云函数调用改为直接调用后端 REST API。

## 修改内容概览

### 1. 主要文件修改

- **`/pages/index/index.js`**: 主页面逻辑，已完全重写
- **`/pages/index/index.json`**: 页面配置，启用下拉刷新
- **`/config.js`**: 新增配置文件

### 2. 主要功能改变

| 原功能 | 修改后 |
|--------|--------|
| `wx.cloud.callFunction('login')` | `wx.request` 调用 `/api/v1/users/{id}` |
| `wx.cloud.callFunction('getUserProfile')` | `wx.request` 调用 `/api/v1/users/{id}` |
| `wx.cloud.callFunction('saveUserInfo')` | `wx.request` 调用 `POST /api/v1/users/` |

## 配置说明

### 开发环境配置

1. **后端服务**: 确保后端服务运行在 `http://127.0.0.1:8000`
2. **开发者工具设置**:
   - 打开微信开发者工具
   - 进入"详情" → "本地设置"
   - 勾选"不校验合法域名、web-view(业务域名)、TLS 版本以及 HTTPS 证书"

### 生产环境配置

1. **域名配置**:
   - 登录微信公众平台小程序后台
   - 进入"开发" → "开发设置" → "服务器域名"
   - 在"request合法域名"中添加你的API域名（必须是HTTPS）

2. **修改生产环境API地址**:
   ```javascript
   // 在 config.js 中修改
   production: {
     baseUrl: 'https://your-api-domain.com/api/v1',
     timeout: 15000
   }
   ```

## API 接口说明

### 获取用户列表
```
GET /api/v1/users/
返回格式：
{
  "items": [...],
  "total": 3,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

### 获取单个用户
```
GET /api/v1/users/{user_id}
返回格式：
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "is_active": true,
    "created_at": "2025-08-08T10:44:48",
    "updated_at": "2025-08-08T10:44:48"
  },
  "message": "获取用户成功"
}
```

### 创建用户
```
POST /api/v1/users/
请求体：
{
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "password": "password123",
  "is_active": true
}
```

## 新增功能

### 1. 数据刷新
- 下拉刷新：用户可以下拉页面刷新数据
- 自动刷新：页面显示时自动检查用户状态

### 2. 错误处理
- 网络超时处理
- 域名配置错误提示
- HTTP 状态码错误处理
- 友好的错误信息显示

### 3. 本地存储
- 用户信息本地缓存
- 登录状态保持
- 退出登录功能

## 数据流程

### 用户登录流程
1. 用户点击登录按钮
2. 获取微信用户授权信息
3. 生成用户数据（用户名、邮箱、密码）
4. 调用 `POST /api/v1/users/` 创建用户
5. 如果用户已存在，调用 `GET /api/v1/users/username/{username}` 获取用户
6. 将用户信息保存到本地存储
7. 更新页面状态

### 页面加载流程
1. 初始化API配置
2. 调用 `GET /api/v1/users/` 获取用户列表
3. 从本地存储读取用户信息
4. 如果有用户信息，调用 `GET /api/v1/users/{id}` 验证用户

## 故障排除

### 1. 网络请求失败
**现象**: 提示"域名未配置"或"网络连接失败"  
**解决方案**:
- 开发环境：检查"不校验合法域名"是否勾选
- 生产环境：确保域名已在小程序后台配置

### 2. 后端服务连接失败
**现象**: 请求超时或连接拒绝  
**解决方案**:
- 确保后端服务正在运行
- 检查防火墙设置
- 确认API地址配置正确

### 3. 数据格式错误
**现象**: 页面显示异常或数据不完整  
**解决方案**:
- 检查后端API返回格式是否正确
- 查看控制台错误信息
- 确认API接口版本匹配

## 开发调试

### 启动后端服务
```bash
cd /path/to/cloud-backend
python run.py
```

### 查看API文档
访问: http://localhost:8000/docs

### 调试技巧
1. 打开微信开发者工具控制台
2. 查看网络请求日志
3. 检查 Storage 中的用户信息
4. 使用断点调试功能

## 注意事项

1. **安全性**: 临时密码方案仅用于演示，生产环境需要实现更安全的认证机制
2. **数据同步**: 目前没有实现数据同步机制，多设备登录可能存在数据不一致
3. **离线处理**: 网络断开时的处理有限，可以考虑添加离线缓存机制
4. **性能优化**: 大量用户数据时需要考虑分页和虚拟滚动
5. **错误恢复**: 建议添加重试机制和更详细的错误分类处理

## 后续优化建议

1. 实现 JWT 认证机制
2. 添加数据缓存和同步策略
3. 实现更完善的错误恢复机制
4. 添加网络状态监测
5. 优化大数据量的处理性能