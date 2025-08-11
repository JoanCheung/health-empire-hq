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
