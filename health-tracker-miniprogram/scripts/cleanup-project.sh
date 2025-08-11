#!/bin/bash

echo "🧹 开始项目目录清理和整理..."
echo "项目路径: /Users/joan/WeChatProjects/zhijilu1"

PROJECT_PATH="/Users/joan/WeChatProjects/zhijilu1"
cd "$PROJECT_PATH"

echo ""
echo "📂 1. 创建 docs 目录并整理文档..."
mkdir -p docs/

# 移动所有中文文档到docs目录
echo "   移动中文文档..."
mv "使用说明.md" docs/ 2>/dev/null
mv "启动问题排查清单.md" docs/ 2>/dev/null
mv "数据库字段详细说明.md" docs/ 2>/dev/null
mv "更新记录.md" docs/ 2>/dev/null
mv "查看数据库指南.md" docs/ 2>/dev/null
mv "查看数据库的三种方法.md" docs/ 2>/dev/null
mv "系统问题记录与解决方案.md" docs/ 2>/dev/null
mv "网络问题临时解决方案.md" docs/ 2>/dev/null

# 移动英文技术文档
echo "   移动技术文档..."
mv ai-optimization-solution.md docs/ 2>/dev/null
mv final-timeout-solution.md docs/ 2>/dev/null
mv offline-backup-solution.md docs/ 2>/dev/null
mv tencent-cloud-timeout-guide.md docs/ 2>/dev/null
mv test-fix.md docs/ 2>/dev/null
mv timeout-fix-summary.md docs/ 2>/dev/null

echo ""
echo "📂 2. 创建 scripts 目录并整理脚本..."
mkdir -p scripts/

# 移动部署脚本
echo "   移动部署脚本..."
mv deploy-*.sh scripts/ 2>/dev/null
mv upload*.sh scripts/ 2>/dev/null

echo ""
echo "📂 3. 创建 debug 目录并整理调试文件..."
mkdir -p debug/

# 移动调试文件
echo "   移动调试文件..."
mv debug-*.js debug/ 2>/dev/null

echo ""
echo "📂 4. 创建 backup 目录并整理备份文件..."
mkdir -p backup/

echo ""
echo "📂 5. 整理云函数目录..."
cd cloudfunctions/

# 移动备份文件
echo "   整理云函数备份文件..."
find . -name "*_original.js" -exec mv {} ../backup/ \; 2>/dev/null
find . -name "*_enhanced_debug.js" -exec mv {} ../backup/ \; 2>/dev/null
find . -name "*_backup.js" -exec mv {} ../backup/ \; 2>/dev/null
find . -name "*_corrupted.js" -exec mv {} ../backup/ \; 2>/dev/null
find . -name "*_temp.js" -exec mv {} ../backup/ \; 2>/dev/null

# 移动测试文件
mv test-functions.js ../debug/ 2>/dev/null

# 移动不需要的测试云函数
echo "   清理测试云函数..."
rm -rf simple-test/ 2>/dev/null
rm -rf quickstartFunctions/ 2>/dev/null
rm -rf network-test/ 2>/dev/null

cd ..

echo ""
echo "📂 6. 整理小程序页面目录..."
cd miniprogram/pages/

# 移动重复的profile文件
echo "   整理profile相关文件..."
mv profile.js ../backup/ 2>/dev/null
mv profile.json ../backup/ 2>/dev/null  
mv profile.wxml ../backup/ 2>/dev/null
mv profile.wxss ../backup/ 2>/dev/null

# 移动profile目录下的备份文件
mv profile/index_debug.js ../../backup/ 2>/dev/null
mv profile/index_original.js ../../backup/ 2>/dev/null

# 移动result页面的备份文件
mv result/index_backup.js ../../backup/ 2>/dev/null
mv result/index_corrupted.js ../../backup/ 2>/dev/null
mv result/index_temp.js ../../backup/ 2>/dev/null

cd ../..

echo ""
echo "📂 7. 创建项目结构说明文档..."
cat > docs/project-structure.md << 'EOF'
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
EOF

echo ""
echo "📂 8. 创建清理后的目录映射..."
cat > docs/directory-mapping.md << 'EOF'
# 目录整理映射表

## 📁 移动记录

### 文档文件移动到 docs/
- 使用说明.md → docs/使用说明.md
- 启动问题排查清单.md → docs/启动问题排查清单.md
- 数据库字段详细说明.md → docs/数据库字段详细说明.md
- 更新记录.md → docs/更新记录.md
- 查看数据库指南.md → docs/查看数据库指南.md
- 查看数据库的三种方法.md → docs/查看数据库的三种方法.md
- 系统问题记录与解决方案.md → docs/系统问题记录与解决方案.md
- 网络问题临时解决方案.md → docs/网络问题临时解决方案.md
- ai-optimization-solution.md → docs/ai-optimization-solution.md
- final-timeout-solution.md → docs/final-timeout-solution.md
- offline-backup-solution.md → docs/offline-backup-solution.md
- tencent-cloud-timeout-guide.md → docs/tencent-cloud-timeout-guide.md
- test-fix.md → docs/test-fix.md
- timeout-fix-summary.md → docs/timeout-fix-summary.md

### 脚本文件移动到 scripts/
- deploy-*.sh → scripts/
- upload*.sh → scripts/

### 调试文件移动到 debug/
- debug-*.js → debug/

### 备份文件移动到 backup/
- *_original.js → backup/
- *_debug.js → backup/
- *_backup.js → backup/
- *_corrupted.js → backup/
- *_temp.js → backup/
- profile.* → backup/ (重复文件)

### 删除的测试云函数
- cloudfunctions/simple-test/ (已删除)
- cloudfunctions/quickstartFunctions/ (已删除) 
- cloudfunctions/network-test/ (已删除)

## 🎯 整理后的好处

1. **文档集中化** - 所有文档统一在docs/目录
2. **脚本管理** - 部署和工具脚本统一管理
3. **备份隔离** - 历史文件不影响开发
4. **结构清晰** - 项目结构更加清晰易懂
5. **维护性提升** - 更容易找到和维护文件

## ⚠️ 注意事项

1. 移动的备份文件可以在需要时从backup/目录恢复
2. 删除的测试云函数如有需要可以重新创建
3. 项目的核心功能和文件没有受到影响
4. 所有重要的配置文件都保持在原位置
EOF

echo ""
echo "✅ 项目目录清理和整理完成！"
echo ""
echo "📊 整理结果："
echo "📚 文档目录: $(find docs/ -name "*.md" | wc -l) 个文档文件"
echo "🔧 脚本目录: $(find scripts/ -name "*.sh" | wc -l) 个脚本文件"  
echo "🐛 调试目录: $(find debug/ -name "*.js" | wc -l) 个调试文件"
echo "💾 备份目录: $(find backup/ -type f | wc -l) 个备份文件"
echo ""
echo "📖 请查看以下新文档了解项目结构："
echo "   - docs/project-structure.md"
echo "   - docs/directory-mapping.md"
echo ""
echo "🎉 项目结构现在更加清晰和易于维护！"