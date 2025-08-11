# 云函数超时问题修复验证

## 修复内容总结

### 1. 云函数超时配置 ✅
- **generate-questions云函数**: 已配置20秒超时，内部AI请求15秒超时
- **analyze云函数**: 已配置20秒超时，内部AI请求15秒超时
- 增加了超时保护和备用方案

### 2. 前端调用超时配置 ✅
- **quiz/index.js**: 所有云函数调用设置30秒超时
- **health-assessment/index.js**: 所有云函数调用设置30秒超时
- **ai-questions/index.js**: analyze云函数调用设置30秒超时

### 3. 重试机制 ✅
- **quiz页面**: 分析失败时自动重试3次，每次间隔2秒
- **云函数**: AI调用失败时自动回退到备用方案

### 4. 错误恢复机制 ✅
- **generate-questions**: AI失败时返回默认问题
- **analyze**: AI失败时返回模拟分析结果
- **前端**: 显示友好的重试提示

## 配置验证

### 云函数配置文件
```json
// cloudfunctions/*/config.json
{
  "timeout": 20  // 20秒超时
}
```

### 前端调用配置
```javascript
wx.cloud.callFunction({
  name: 'function-name',
  timeout: 30000,  // 30秒超时
  config: {
    env: 'cloud1-6gg9zh5k6f75e020'
  }
})
```

## 测试步骤

1. **在微信开发者工具中重新编译项目**
2. **部署云函数到云端**
   ```bash
   # 在微信开发者工具中
   # 右键点击 cloudfunctions/generate-questions -> 上传并部署：云端安装依赖
   # 右键点击 cloudfunctions/analyze -> 上传并部署：云端安装依赖
   ```
3. **测试完整用户流程**
   - 主页 -> 开始诊断
   - 填写基本信息
   - 回答舌诊问题
   - 观察AI问题生成是否超时
   - 观察最终分析是否超时

## 预期结果

- ✅ 不再出现3秒超时错误
- ✅ AI生成问题成功或自动回退到默认问题
- ✅ 健康分析成功或自动重试
- ✅ 用户体验流畅，有清晰的加载提示

## 备用方案

如果仍然出现问题：
1. **增加云函数资源配置** (在云开发控制台)
2. **优化AI prompt长度** (减少token使用)
3. **启用本地调试模式** (跳过AI调用)