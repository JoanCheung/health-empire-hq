// config.js - 小程序配置文件
const config = {
  // API配置
  api: {
    // 开发环境
    development: {
      baseUrl: 'http://127.0.0.1:8000/api/v1',
      timeout: 10000
    },
    // 生产环境
    production: {
      baseUrl: 'https://your-domain.com/api/v1', // 请替换为实际的生产环境域名
      timeout: 15000
    }
  },

  // 获取当前环境配置
  getApiConfig() {
    try {
      // 更准确的环境判断
      const accountInfo = wx.getAccountInfoSync();
      const envVersion = accountInfo.miniProgram.envVersion;
      
      // 开发环境包括：develop（开发版）和 trial（体验版）
      const isDevelopment = envVersion === 'develop' || envVersion === 'trial';
      
      console.log('当前环境:', envVersion, '是否开发环境:', isDevelopment);
      
      return isDevelopment ? this.api.development : this.api.production;
    } catch (error) {
      console.warn('获取环境信息失败，默认使用生产环境配置:', error);
      return this.api.production;
    }
  },

  // 验证配置是否有效
  validateConfig() {
    const config = this.getApiConfig();
    if (!config.baseUrl) {
      console.error('API配置无效: baseUrl为空');
      return false;
    }
    
    // 生产环境必须使用HTTPS
    const accountInfo = wx.getAccountInfoSync();
    const envVersion = accountInfo.miniProgram.envVersion;
    if (envVersion === 'release' && !config.baseUrl.startsWith('https://')) {
      console.error('生产环境必须使用HTTPS域名');
      return false;
    }
    
    return true;
  },

  // 网络请求域名配置说明
  domainConfig: {
    // 在小程序后台需要配置的域名
    requestDomain: [
      'https://your-domain.com', // 替换为实际域名
      // 开发环境可能需要的域名（仅开发时）
      // 'http://127.0.0.1:8000' // 本地开发时使用
    ],
    
    // 配置说明
    instructions: `
小程序域名配置说明：

1. 登录微信公众平台小程序后台
2. 进入"开发" -> "开发设置" -> "服务器域名"
3. 在"request合法域名"中添加后端API域名
4. 开发环境可以在开发者工具中关闭域名检查：
   - 开发者工具 -> 设置 -> 项目设置 -> 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书

注意事项：
- 生产环境必须使用 HTTPS 域名
- 域名必须备案
- 每月只能修改5次
- 开发环境可以使用 HTTP，但生产环境不行
`
  }
};

module.exports = config;