// 网络请求工具类
const CONSTANTS = require('./constants.js');

class NetworkUtil {
  static instance = null;
  
  constructor() {
    this.requestQueue = new Map(); // 请求队列，用于防重复请求
  }

  static getInstance() {
    if (!NetworkUtil.instance) {
      NetworkUtil.instance = new NetworkUtil();
    }
    return NetworkUtil.instance;
  }

  /**
   * 检查网络状态
   */
  async checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve({
            isConnected: res.networkType !== 'none',
            networkType: res.networkType
          });
        },
        fail: () => {
          resolve({
            isConnected: false,
            networkType: 'unknown'
          });
        }
      });
    });
  }

  /**
   * 生成请求唯一标识
   */
  generateRequestKey(url, method, data) {
    return `${method}_${url}_${JSON.stringify(data || {})}`;
  }

  /**
   * 带重试机制的API请求
   */
  async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
    const {
      timeout = CONSTANTS.REQUEST_CONFIG.DEFAULT_TIMEOUT,
      maxRetries = CONSTANTS.REQUEST_CONFIG.MAX_RETRY_COUNT,
      retryDelay = CONSTANTS.REQUEST_CONFIG.RETRY_DELAY,
      preventDuplicate = true
    } = options;

    // 防重复请求
    if (preventDuplicate) {
      const requestKey = this.generateRequestKey(endpoint, method, data);
      if (this.requestQueue.has(requestKey)) {
        return this.requestQueue.get(requestKey);
      }
    }

    const requestPromise = this._executeRequest(endpoint, method, data, {
      timeout,
      maxRetries,
      retryDelay
    });

    // 添加到请求队列
    if (preventDuplicate) {
      const requestKey = this.generateRequestKey(endpoint, method, data);
      this.requestQueue.set(requestKey, requestPromise);
      
      // 请求完成后清除
      requestPromise.finally(() => {
        this.requestQueue.delete(requestKey);
      });
    }

    return requestPromise;
  }

  /**
   * 执行具体的网络请求
   */
  async _executeRequest(endpoint, method, data, { timeout, maxRetries, retryDelay }) {
    // 检查网络状态
    const networkStatus = await this.checkNetworkStatus();
    if (!networkStatus.isConnected) {
      return {
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR,
        errorType: 'NETWORK_DISCONNECTED'
      };
    }

    // 获取API配置
    const config = require('../config.js');
    const apiConfig = config.getApiConfig();
    if (!apiConfig) {
      return {
        success: false,
        error: CONSTANTS.ERROR_MESSAGES.API_CONFIG_ERROR,
        errorType: 'CONFIG_ERROR'
      };
    }

    const url = `${apiConfig.baseUrl}${endpoint}`;
    let lastError = null;

    // 重试机制
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this._singleRequest(url, method, data, timeout);
        
        if (result.success || attempt === maxRetries) {
          return result;
        }
        
        lastError = result.error;
        
        // 延迟后重试
        if (attempt < maxRetries) {
          await this._delay(retryDelay * attempt);
          console.log(`请求重试第 ${attempt} 次:`, url);
        }
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await this._delay(retryDelay * attempt);
        }
      }
    }

    return {
      success: false,
      error: lastError || CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR,
      errorType: 'MAX_RETRIES_EXCEEDED'
    };
  }

  /**
   * 单次请求
   */
  _singleRequest(url, method, data, timeout) {
    return new Promise((resolve) => {
      wx.request({
        url: url,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: timeout,
        success: (res) => {
          console.log('API请求成功:', { url, method, status: res.statusCode });
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              success: true,
              data: res.data,
              statusCode: res.statusCode
            });
          } else {
            resolve({
              success: false,
              error: this._parseHttpError(res),
              errorType: 'HTTP_ERROR',
              statusCode: res.statusCode
            });
          }
        },
        fail: (error) => {
          console.error('API请求失败:', { url, method, error });
          resolve({
            success: false,
            error: this._parseRequestError(error),
            errorType: this._getErrorType(error),
            rawError: error
          });
        }
      });
    });
  }

  /**
   * 解析HTTP错误
   */
  _parseHttpError(res) {
    let detail = '请求失败';
    
    if (res.data) {
      if (typeof res.data.detail === 'string') {
        detail = res.data.detail;
      } else if (Array.isArray(res.data.detail)) {
        // FastAPI 验证错误通常是数组格式
        detail = res.data.detail.map(err => `${err.loc?.join('.')} ${err.msg}`).join(', ');
      } else if (res.data.message) {
        detail = res.data.message;
      } else if (typeof res.data === 'string') {
        detail = res.data;
      }
    }
    
    return `HTTP ${res.statusCode}: ${detail}`;
  }

  /**
   * 解析请求错误
   */
  _parseRequestError(error) {
    const errMsg = error.errMsg || '';
    
    if (errMsg.includes('timeout')) {
      return CONSTANTS.ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (errMsg.includes('fail url not in domain list')) {
      return CONSTANTS.ERROR_MESSAGES.DOMAIN_ERROR;
    } else if (errMsg.includes('fail')) {
      return CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      return CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR;
    }
  }

  /**
   * 获取错误类型
   */
  _getErrorType(error) {
    const errMsg = error.errMsg || '';
    
    if (errMsg.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    } else if (errMsg.includes('fail url not in domain list')) {
      return 'DOMAIN_ERROR';
    } else if (errMsg.includes('fail')) {
      return 'NETWORK_ERROR';
    } else {
      return 'UNKNOWN_ERROR';
    }
  }

  /**
   * 延迟函数
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理请求队列（页面销毁时调用）
   */
  clearQueue() {
    this.requestQueue.clear();
  }
}

module.exports = NetworkUtil;