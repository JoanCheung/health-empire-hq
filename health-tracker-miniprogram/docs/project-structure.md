# 项目目录结构说明

## 📁 根目录结构

```
zhijilu1/
├── README.md                   # 项目说明
├── 系统更新日志.md              # 主要更新日志 
├── project.config.json         # 项目配置
├── project.private.config.json # 私有配置
├── AI智能化提升方案.md          # AI优化方案
├── cloudfunctions/             # 云函数目录
├── miniprogram/               # 小程序源码
├── docs/                      # 📚 文档目录
├── scripts/                   # 🔧 脚本目录
├── debug/                     # 🐛 调试文件目录
└── backup/                    # 💾 备份文件目录
```

## 📚 文档目录 (docs/)

- `使用说明.md` - 使用指南
- `启动问题排查清单.md` - 启动问题解决方案
- `数据库字段详细说明.md` - 数据库结构说明
- `系统问题记录与解决方案.md` - 技术问题记录
- `ai-optimization-solution.md` - AI优化技术方案
- `final-timeout-solution.md` - 超时问题解决方案
- `project-structure.md` - 项目结构说明 (本文档)

## 🔧 脚本目录 (scripts/)

- `deploy-*.sh` - 各种部署脚本
- `upload*.sh` - 上传脚本
- `cleanup-project.sh` - 项目清理脚本

## ☁️ 云函数目录 (cloudfunctions/)

### 核心业务功能
- `analyze/` - 健康分析核心功能
- `generate-questions/` - AI问题生成
- `getHistoryContext/` - 历史上下文获取
- `getRecords/` - 健康记录获取

### 用户管理
- `login/` - 用户登录
- `getUserProfile/` - 获取用户资料
- `saveUserInfo/` - 保存用户信息
- `saveUserProfile/` - 保存用户资料

### 管理员功能
- `checkAdminPermission/` - 权限检查
- `manageAdmins/` - 管理员管理
- `analyzeTongueAccuracy/` - 舌象准确性分析

## 📱 小程序目录 (miniprogram/)

### 核心页面
- `pages/index/` - 首页
- `pages/quiz/` - 健康问卷
- `pages/result/` - 结果展示
- `pages/profile/` - 健康档案

### 用户功能
- `pages/user-profile/` - 个人资料管理
- `pages/ai-questions/` - AI交互问答

### 管理功能
- `pages/admin-panel/` - 管理员控制面板
- `pages/api-stats/` - API使用统计
- `pages/tongue-accuracy/` - 舌象准确性分析
- `pages/debug-db/` - 数据库调试

### 测试页面
- `pages/test-cloud/` - 云开发测试
- `pages/network-test/` - 网络测试

## 🐛 调试目录 (debug/)

- 调试相关的JavaScript文件
- 数据库调试脚本
- 临时测试文件

## 💾 备份目录 (backup/)

- 所有历史版本和备份文件
- 废弃的代码文件
- 调试版本文件

## 🗄️ 数据库设计

### 核心集合
- `health_records` - 健康记录
- `users` - 用户基本信息
- `user_profiles` - 用户详细资料

### 管理集合  
- `system_admins` - 系统管理员
- `tongue_accuracy_analysis` - 舌象准确性分析
- `batch_accuracy_reports` - 批量准确性报告

### 统计集合
- `accuracy_reports` - 准确性报告
- `tongue_user_feedback` - 用户反馈

## 🚀 部署流程

1. 使用 `scripts/deploy-user-system.sh` 部署用户系统
2. 使用 `scripts/deploy-functions.sh` 部署核心功能
3. 使用微信开发者工具上传小程序代码

## 📋 开发规范

1. 备份文件统一放入 `backup/` 目录
2. 文档统一放入 `docs/` 目录  
3. 脚本统一放入 `scripts/` 目录
4. 调试文件统一放入 `debug/` 目录
5. 云函数按功能模块组织
6. 小程序页面按业务逻辑分组
