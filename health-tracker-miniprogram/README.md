# 智慧健康诊断系统

基于AI技术的中医舌诊健康评估微信小程序，集成了现代AI分析技术与传统中医诊断理论，为用户提供智能化的健康评估服务。

## 🎯 项目概述

这是一个功能完整的微信小程序健康诊断系统，具备以下核心能力：

- **🔍 AI智能分析**：基于通义千问多模态模型的舌象识别与健康分析
- **📋 专业问诊**：结合传统中医理论的智能问答系统
- **📊 数据可视化**：多维度健康数据图表展示
- **👥 用户管理**：完整的用户登录和个人资料管理系统
- **🔐 权限控制**：三级管理员权限体系
- **📈 准确性分析**：舌象识别准确性评估系统

## ✨ 主要功能

### 🏥 健康诊断功能
- **智能问卷**：基于中医理论的多维度健康问答
- **舌象分析**：AI驱动的舌质颜色和舌苔厚度识别
- **体质判断**：中医九种体质类型智能识别
- **健康评分**：综合评估用户健康状况
- **个性化建议**：基于分析结果的健康建议

### 📊 数据分析功能
- **健康趋势图**：健康评分随时间变化趋势
- **BMI变化图**：体重指数变化监控
- **症状频率统计**：常见症状出现频率分析
- **体质分布图**：体质类型分布可视化
- **综合健康报告**：多维度健康数据综合展示

### 👤 用户管理功能
- **微信授权登录**：一键微信登录
- **个人资料管理**：详细健康档案管理
- **健康记录查看**：历史诊断记录浏览
- **数据导出**：健康数据导出功能

### 🔧 管理功能
- **权限管理**：超级管理员、管理员、版主三级权限
- **API统计**：AI接口调用统计分析
- **准确性分析**：舌象识别准确性评估
- **批量分析**：大批量数据准确性测试

## 🏗️ 技术架构

### 前端技术
- **框架**：微信小程序原生框架
- **样式**：WXSS + 响应式设计
- **图表**：Canvas绘图 + 自定义图表组件
- **交互**：事件驱动 + 状态管理

### 后端技术
- **云平台**：腾讯云微信云开发
- **数据库**：云数据库 (NoSQL)
- **云函数**：Node.js + wx-server-sdk
- **存储**：云存储 (图片文件)

### AI集成
- **主要模型**：阿里云通义千问 qwen-vl-max (多模态)
- **备用模型**：Google Gemini (Fallback)
- **API竞速**：双API并行调用，取最快响应

## 📁 项目结构

```
zhijilu1/
├── README.md                   # 项目说明文档
├── 系统更新日志.md              # 详细更新日志
├── AI智能化提升方案.md          # AI技术方案
├── project.config.json         # 微信小程序配置
├── .gitignore                  # Git忽略规则
│
├── docs/                       # 📚 文档目录
│   ├── project-structure.md    # 项目结构说明
│   ├── 使用说明.md             # 使用指南
│   ├── 启动问题排查清单.md      # 问题排查
│   └── ...                     # 其他技术文档
│
├── scripts/                    # 🔧 脚本工具
│   ├── deploy-user-system.sh   # 用户系统部署
│   ├── cleanup-project.sh      # 项目清理
│   └── ...                     # 其他部署脚本
│
├── cloudfunctions/             # ☁️ 云函数
│   ├── analyze/                # 健康分析核心
│   ├── getHealthTrends/        # 健康趋势数据
│   ├── analyzeTongueAccuracy/  # 舌象准确性分析
│   ├── checkAdminPermission/   # 权限检查
│   ├── manageAdmins/          # 管理员管理
│   ├── getUserProfile/        # 用户资料获取
│   └── ...                    # 其他云函数
│
└── miniprogram/               # 📱 小程序源码
    ├── app.js                 # 应用入口
    ├── app.json              # 应用配置
    ├── app.wxss              # 全局样式
    │
    └── pages/                # 页面目录
        ├── index/            # 首页
        ├── quiz/             # 健康问卷
        ├── result/           # 结果展示
        ├── profile/          # 健康档案
        ├── user-profile/     # 个人资料
        ├── health-charts/    # 健康图表
        ├── admin-panel/      # 管理面板
        ├── api-stats/        # API统计
        └── tongue-accuracy/  # 准确性分析
```

## 🚀 快速开始

### 环境要求
- 微信开发者工具 (最新版)
- Node.js 16+
- 腾讯云账号 (开通微信云开发)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/zhijilu1.git
   cd zhijilu1
   ```

2. **配置云开发环境**
   - 在微信公众平台创建小程序
   - 开通腾讯云微信云开发服务
   - 修改 `project.config.json` 中的 `appid`
   - 修改 `miniprogram/app.js` 中的云环境ID

3. **部署云函数**
   ```bash
   # 部署基础功能
   ./scripts/deploy-functions.sh
   
   # 部署用户系统
   ./scripts/deploy-user-system.sh
   ```

4. **配置API密钥**
   - 在云函数环境变量中配置：
     - `QWEN_API_KEY`: 阿里云通义千问API密钥
     - `GOOGLE_API_KEY`: Google Gemini API密钥 (可选)

5. **初始化管理员**
   ```javascript
   // 调用 manageAdmins 云函数
   {
     action: 'init'
   }
   ```

### 本地开发

1. 使用微信开发者工具打开项目
2. 在工具中上传并部署云函数
3. 启动本地预览或真机调试

## 📊 数据库设计

### 核心集合
- `health_records` - 健康诊断记录
- `users` - 用户基本信息
- `user_profiles` - 用户详细资料

### 管理集合
- `system_admins` - 系统管理员
- `tongue_accuracy_analysis` - 舌象准确性分析
- `batch_accuracy_reports` - 批量分析报告

## 🔑 核心技术特性

### 🤖 AI智能分析
- **多模态分析**：同时处理文本问答和舌象图片
- **智能提问**：基于用户回答生成个性化澄清问题
- **历史上下文**：利用用户历史数据优化分析准确性
- **双API竞速**：通义千问 + Gemini 并行调用

### 📈 数据可视化
- **动态图表**：折线图、柱状图、饼图、综合图表
- **趋势分析**：自动计算数据变化趋势和百分比
- **交互体验**：图表缩放、数据点详情、时间范围切换

### 🔐 安全机制
- **权限分级**：超级管理员、管理员、版主三级权限控制
- **数据隔离**：用户数据完全隔离，管理员权限精确控制
- **API安全**：云函数鉴权，防止恶意调用

## 🧪 准确性保证

### 分析维度
- **舌质颜色准确性**：AI识别 vs 用户描述对比验证
- **舌苔厚度准确性**：舌苔纹理分析准确性评估
- **诊断一致性**：症状表现与健康评分匹配度分析
- **体质判断准确性**：中医体质诊断准确性验证
- **评分合理性**：健康评分与实际症状的合理性检查

### 质量控制
- **批量测试**：支持100+记录的批量准确性分析
- **用户反馈**：收集用户对诊断结果的反馈
- **持续优化**：基于准确性分析结果优化算法

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 前端框架
- [腾讯云微信云开发](https://cloud.tencent.com/product/tcb) - 后端云服务
- [阿里云通义千问](https://help.aliyun.com/zh/dashscope/) - AI分析能力
- [Google Gemini](https://ai.google.dev/) - 备用AI服务

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/zhijilu1/issues)
- 📖 项目文档: [查看完整文档](./docs/)

---

**⚠️ 免责声明**

本应用仅供健康参考使用，不能替代专业医疗诊断。如有健康问题，请及时就医咨询专业医生。

**🔒 隐私保护**

我们严格保护用户隐私，所有健康数据仅用于个人健康分析，不会用于其他目的。

---

<div align="center">

**如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ for health and wellness

</div>
