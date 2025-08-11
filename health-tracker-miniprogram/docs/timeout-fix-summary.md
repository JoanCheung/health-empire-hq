# 云函数超时问题修复 - 完整总结

## ⚠️ 关键修复
将所有`wx.cloud.callFunction`的`timeout`参数从顶级移到`config`对象内部。

## 📝 修复详情

### 1. 前端页面修复

#### 1.1 quiz/index.js ✅ 
```javascript
// ❌ 错误格式 (之前)
wx.cloud.callFunction({
  name: 'generate-questions',
  config: { env: 'cloud1-6gg9zh5k6f75e020' },
  timeout: 30000  // 这样不生效
})

// ✅ 正确格式 (修复后)
wx.cloud.callFunction({
  name: 'generate-questions',
  config: { 
    env: 'cloud1-6gg9zh5k6f75e020',
    timeout: 30000  // 移到config内部
  }
})
```

**修复的云函数调用：**
- `generate-questions`: 30秒超时
- `analyze`: 30秒超时 + 3次重试机制

#### 1.2 health-assessment/index.js ✅
- `generate-questions`: 30秒超时
- `analyze`: 30秒超时

#### 1.3 ai-questions/index.js ✅  
- `analyze`: 30秒超时

#### 1.4 index/index.js ✅
- `login`: 10秒超时

#### 1.5 profile/index.js ✅
- `getRecords`: 15秒超时

#### 1.6 test-cloud/index.js ✅
- `analyze`: 30秒超时
- `getRecords`: 30秒超时

### 2. 云函数内部超时保护

#### 2.1 generate-questions云函数 ✅
```javascript
// AI请求15秒超时保护
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('AI请求超时')), 15000);
});

const result = await Promise.race([aiPromise, timeoutPromise]);
```

#### 2.2 analyze云函数 ✅
```javascript
// AI分析15秒超时保护
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('AI分析请求超时')), 15000);
});

const result = await Promise.race([aiPromise, timeoutPromise]);
```

### 3. 错误恢复机制

#### 3.1 前端重试机制 ✅
```javascript
// quiz页面：分析失败时自动重试3次
const maxRetries = 3;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const result = await this.callAnalyzeFunction(analysisData);
    return result; // 成功则返回
  } catch (error) {
    if (attempt === maxRetries) throw error;
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒重试
  }
}
```

#### 3.2 云函数备用方案 ✅
- **generate-questions**: AI失败时返回默认问题
- **analyze**: AI失败时返回模拟分析结果

## 🔧 云函数配置文件
所有AI相关云函数都配置了20秒超时：

```json
// cloudfunctions/*/config.json
{
  "permissions": {
    "openapi": []
  },
  "env": {
    "GOOGLE_API_KEY": "..."
  },
  "timeout": 20  // 20秒超时
}
```

## ✅ 验证清单

### 部署前检查：
- [ ] 在微信开发者工具中重新编译项目
- [ ] 上传云函数到云端（右键 -> 上传并部署：云端安装依赖）
  - [ ] generate-questions
  - [ ] analyze
  - [ ] login
  - [ ] getRecords

### 测试流程：
- [ ] 主页登录功能
- [ ] 开始诊断 -> 填写基本信息
- [ ] 回答舌诊问题
- [ ] 观察AI问题生成（应该不再超时）
- [ ] 观察最终分析（应该不再超时）
- [ ] 检查用户档案页面

### 预期结果：
- ✅ 不再出现"3秒超时"错误
- ✅ AI功能正常工作或优雅降级
- ✅ 重试机制在失败时自动生效
- ✅ 用户体验流畅

## 🚨 注意事项

1. **必须重新部署云函数**：前端配置修改后，云函数也需要重新部署才能生效
2. **清理缓存**：在微信开发者工具中清理缓存并重新编译
3. **环境一致性**：确保所有调用都使用相同的环境ID `cloud1-6gg9zh5k6f75e020`

## 🔄 如果问题仍然存在

1. 检查微信开发者工具基础库版本 >= 2.2.3
2. 检查云开发环境ID是否正确
3. 在云开发控制台检查云函数资源配置
4. 考虑暂时禁用AI功能进行测试