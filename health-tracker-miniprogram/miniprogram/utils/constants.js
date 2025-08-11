// 常量配置文件
const CONSTANTS = {
  // API 端点
  API_ENDPOINTS: {
    USERS: '/users/',
    USER_BY_ID: (id) => `/users/${id}`,
    USER_BY_USERNAME: (username) => `/users/username/${username}`,
    USER_BY_EMAIL: (email) => `/users/email/${email}`
  },

  // 错误信息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络或服务器状态',
    TIMEOUT_ERROR: '请求超时，请检查网络连接',
    AUTH_ERROR: '需要授权才能使用此功能',
    DOMAIN_ERROR: '域名未配置，请在小程序后台配置请求域名',
    API_CONFIG_ERROR: 'API配置未初始化',
    USER_NOT_FOUND: '用户信息未找到',
    LOGIN_FAILED: '登录失败，请重试',
    DATA_LOAD_FAILED: '数据加载失败',
    USER_AUTH_DENIED: '用户取消授权',
    SYSTEM_ERROR: '系统异常，请稍后重试'
  },

  // 成功信息
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: '登录成功',
    LOGOUT_SUCCESS: '已退出登录',
    DATA_REFRESH_SUCCESS: '数据刷新成功',
    PROFILE_UPDATE_SUCCESS: '资料更新成功'
  },

  // 存储键名
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    USER_PROFILE: 'userProfile',
    API_CONFIG: 'apiConfig'
  },

  // 网络请求配置
  REQUEST_CONFIG: {
    DEFAULT_TIMEOUT: 10000,
    MAX_RETRY_COUNT: 3,
    RETRY_DELAY: 1000
  },

  // 用户相关常量
  USER_CONFIG: {
    DEFAULT_EMAIL_SUFFIX: '@miniprogram.example',
    USERNAME_PREFIX: 'user_'
  }
};

module.exports = CONSTANTS;