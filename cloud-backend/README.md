# 用户管理 API

基于 FastAPI 和 SQLite 的用户管理系统，提供完整的用户 CRUD 功能。

## 功能特点

- ✅ 完整的用户 CRUD 操作（创建、读取、更新、删除）
- ✅ 基于 SQLite 的数据存储
- ✅ 密码安全哈希存储
- ✅ 数据验证和错误处理
- ✅ RESTful API 设计
- ✅ 自动生成的 API 文档
- ✅ 分页查询支持
- ✅ 响应式项目结构

## 技术栈

- **FastAPI** - 现代、快速的 Web 框架
- **SQLAlchemy** - Python SQL 工具包和 ORM
- **SQLite** - 轻量级数据库
- **Pydantic** - 数据验证库
- **Passlib** - 密码哈希库
- **Uvicorn** - ASGI 服务器

## 项目结构

```
cloud-backend/
├── app/                    # 应用核心代码
│   ├── api/               # API 路由
│   │   ├── deps.py        # 依赖项
│   │   └── v1/            # API v1 版本
│   │       ├── api.py     # 路由汇总
│   │       └── endpoints/ # 端点定义
│   │           └── users.py
│   ├── core/              # 核心功能
│   │   ├── config.py      # 配置管理
│   │   └── security.py    # 安全相关
│   ├── crud/              # CRUD 操作
│   │   └── crud_user.py   # 用户 CRUD
│   ├── models/            # 数据库模型
│   │   └── user.py        # 用户模型
│   ├── schemas/           # Pydantic 模式
│   │   └── user.py        # 用户模式
│   ├── utils/             # 工具函数
│   │   └── helpers.py     # 辅助函数
│   ├── database.py        # 数据库连接
│   ├── main.py            # FastAPI 应用
│   └── config.py          # 配置导入
├── tests/                 # 测试代码
│   ├── conftest.py        # 测试配置
│   └── test_users.py      # 用户 API 测试
├── requirements.txt       # Python 依赖
├── .env.example          # 环境变量示例
├── run.py                # 启动脚本
└── README.md             # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
cd cloud-backend
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，修改配置参数
```

### 3. 启动服务

```bash
# 方法 1: 使用启动脚本
python run.py

# 方法 2: 使用 uvicorn
uvicorn app.main:app --reload

# 方法 3: 直接运行主文件
python app/main.py
```

### 4. 访问文档

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/health

## API 端点

### 用户管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/v1/users/` | 创建新用户 |
| GET | `/api/v1/users/` | 获取用户列表（分页） |
| GET | `/api/v1/users/{id}` | 获取特定用户 |
| PUT | `/api/v1/users/{id}` | 更新用户信息 |
| DELETE | `/api/v1/users/{id}` | 删除用户 |

### 请求示例

#### 创建用户

```bash
curl -X POST "http://localhost:8000/api/v1/users/" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "username": "testuser",
       "password": "securepassword123",
       "full_name": "Test User"
     }'
```

#### 获取用户列表

```bash
curl "http://localhost:8000/api/v1/users/?page=1&size=10"
```

#### 更新用户

```bash
curl -X PUT "http://localhost:8000/api/v1/users/1" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Updated Name",
       "is_active": true
     }'
```

## 数据模型

### 用户模型

```python
{
  "id": 1,
  "email": "user@example.com",
  "username": "testuser",
  "full_name": "Test User",
  "is_active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest tests/ -v
```

## 配置说明

主要配置项（在 `.env` 文件中设置）：

- `PROJECT_NAME`: 项目名称
- `SERVER_HOST`: 服务器主机地址
- `SERVER_PORT`: 服务器端口
- `SQLITE_URL`: SQLite 数据库路径
- `SECRET_KEY`: JWT 密钥（生产环境必须更改）
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 访问令牌过期时间

## 安全特性

- 密码使用 bcrypt 进行安全哈希
- JWT 令牌认证（预留接口）
- 输入数据验证和清理
- SQL 注入防护（SQLAlchemy ORM）
- CORS 配置支持

## 部署建议

### 开发环境
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 生产环境
```bash
# 使用 Gunicorn + Uvicorn workers
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 常见问题

### Q: 如何更改数据库路径？
A: 修改 `.env` 文件中的 `SQLITE_URL` 配置项。

### Q: 如何添加新的 API 端点？
A: 在 `app/api/v1/endpoints/` 目录下创建新的端点文件，然后在 `app/api/v1/api.py` 中注册路由。

### Q: 如何自定义响应格式？
A: 修改 `app/schemas/` 目录下的 Pydantic 模式定义。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

该项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。