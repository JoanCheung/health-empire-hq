# Health Empire HQ - 智慧健康诊断系统

基于AI技术的中医舌诊健康评估系统，包含微信小程序、Web应用和后端API服务。

## 🏗️ 项目架构

```
health-empire-hq/
├── cloud-backend/              # FastAPI 后端服务
├── health-tracker-miniprogram/ # 微信小程序
├── health-tracker-webapp/      # Next.js Web应用
└── admin-panel/               # 管理面板 (预留)
```

## 🚀 快速开始

### 1. 后端服务 (FastAPI + SQLite)

```bash
cd cloud-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**API 文档**: http://localhost:8000/docs

### 2. 微信小程序

1. 使用微信开发者工具打开 `health-tracker-miniprogram` 目录
2. 在开发设置中关闭域名校验
3. 编译运行

### 3. Web 应用 (Next.js)

```bash
cd health-tracker-webapp
npm install
npm run dev
```

**访问地址**: http://localhost:3000

## ✨ 主要功能

### 🔐 用户系统
- 微信授权登录
- 用户资料管理  
- 安全的JWT认证

### 📊 健康诊断
- AI舌诊分析
- 健康问卷评估
- 个性化建议

### 💻 多端支持
- 微信小程序端
- Web浏览器端
- 管理后台

## 🛠️ 技术栈

### 后端
- **FastAPI**: 现代Python Web框架
- **SQLAlchemy**: ORM数据库操作
- **SQLite**: 轻量级数据库
- **Pydantic**: 数据验证
- **uvicorn**: ASGI服务器

### 小程序
- **微信小程序原生开发**
- **wx.request**: 网络请求
- **微信授权**: 用户登录

### Web应用  
- **Next.js**: React全栈框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架

## 📁 目录结构

```
health-empire-hq/
├── 📁 cloud-backend/           # 后端服务
│   ├── app/                    # FastAPI 应用
│   ├── requirements.txt        # Python 依赖
│   └── run.py                  # 启动脚本
├── 📁 health-tracker-miniprogram/ # 微信小程序
│   ├── miniprogram/           # 小程序源码
│   │   ├── pages/             # 页面
│   │   ├── utils/             # 工具类
│   │   └── config.js          # 配置文件
│   └── project.config.json    # 项目配置
├── 📁 health-tracker-webapp/  # Web 应用
│   ├── src/                   # 源码
│   ├── package.json          # Node 依赖
│   └── next.config.ts        # Next.js 配置
└── 📄 README.md              # 项目说明
```

## 🔧 开发工作流

### 并行开发环境

1. **VS Code**: 代码编辑
2. **微信开发者工具**: 小程序预览/调试
3. **终端**: Claude Code AI助手 + 后端服务
4. **浏览器**: Web应用调试

### 实时同步

- VS Code 保存 → 微信工具自动重新编译
- 后端代码修改 → uvicorn 热重载
- 前端代码修改 → Next.js 热更新

## 📡 API 接口

### 用户管理
- `POST /api/v1/users/` - 创建用户
- `GET /api/v1/users/{id}` - 获取用户信息
- `PUT /api/v1/users/{id}` - 更新用户信息
- `DELETE /api/v1/users/{id}` - 删除用户

更多接口详见 [API文档](http://localhost:8000/docs)

## 🔒 安全特性

- **微信授权登录**: 无需密码，基于微信生态
- **数据验证**: Pydantic严格数据校验
- **SQL注入防护**: SQLAlchemy ORM
- **环境隔离**: 开发/生产环境分离
- **CORS配置**: 跨域请求安全控制

## 📈 系统特点

### 🎯 现代化架构
- RESTful API设计
- 微服务架构思想
- 前后端分离
- 数据库ORM

### 🚀 高性能
- FastAPI异步处理
- SQLite高效存储  
- 前端热更新
- API自动文档

### 🛡️ 高可靠
- 完整错误处理
- 网络重试机制
- 数据库事务
- 日志记录

## 🏃‍♂️ 最近更新

- ✅ **架构迁移**: 云函数 → REST API
- ✅ **安全修复**: 移除硬编码密码
- ✅ **现代化**: 微信授权登录
- ✅ **工具优化**: 新增网络/授权工具类
- ✅ **开发体验**: 多工具协同开发

## 📝 开发日志

详见各子项目的文档：
- [后端开发文档](cloud-backend/README.md)
- [小程序集成说明](health-tracker-miniprogram/API_INTEGRATION_README.md) 
- [修复报告](health-tracker-miniprogram/BUG_FIXES_README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**🚀 Generated with Claude Code**