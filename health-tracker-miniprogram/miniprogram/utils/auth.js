// 用户授权管理工具
const CONSTANTS = require('./constants.js');
const NetworkUtil = require('./network.js');

class AuthUtil {
  static instance = null;

  constructor() {
    this.networkUtil = NetworkUtil.getInstance();
  }

  static getInstance() {
    if (!AuthUtil.instance) {
      AuthUtil.instance = new AuthUtil();
    }
    return AuthUtil.instance;
  }

  /**
   * 获取微信登录凭证
   */
  async getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error('获取登录凭证失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 获取用户信息（新版本兼容）
   */
  async getUserInfo() {
    try {
      // 首先尝试使用新的头像昵称填写能力
      const userInfo = await this._getUserInfoFromButton();
      if (userInfo) {
        return userInfo;
      }

      // 如果不支持，尝试使用旧的API（逐步废弃中）
      return await this._getUserInfoLegacy();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 通过按钮触发获取用户信息（推荐方式）
   * 注意：这个方法需要配合页面中的按钮使用
   */
  async _getUserInfoFromButton() {
    // 这个方法需要在用户点击按钮时调用
    // 实际实现需要在页面中使用 <button open-type="chooseAvatar"> 和 <input type="nickname">
    return null;
  }

  /**
   * 使用传统方式获取用户信息（逐步废弃）
   */
  async _getUserInfoLegacy() {
    return new Promise((resolve, reject) => {
      // 检查是否已授权
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，直接获取用户信息
            wx.getUserInfo({
              success: (userRes) => {
                resolve({
                  userInfo: userRes.userInfo,
                  rawData: userRes.rawData,
                  signature: userRes.signature,
                  encryptedData: userRes.encryptedData,
                  iv: userRes.iv
                });
              },
              fail: reject
            });
          } else {
            // 未授权，需要引导用户授权
            reject(new Error('用户未授权获取用户信息'));
          }
        },
        fail: reject
      });
    });
  }

  /**
   * 生成用户账户信息
   */
  generateUserAccount(userInfo, wxCode) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // 清理用户名，只保留字母和数字，移除中文和特殊字符
    const cleanNickname = (userInfo.nickName || 'user').replace(/[^a-zA-Z0-9]/g, '');
    const safeNickname = cleanNickname || 'user'; // 如果清理后为空，使用默认值
    
    return {
      // 后端API要求的字段格式
      email: `${safeNickname.toLowerCase()}${randomSuffix}${CONSTANTS.USER_CONFIG.DEFAULT_EMAIL_SUFFIX}`,
      username: `${CONSTANTS.USER_CONFIG.USERNAME_PREFIX}${safeNickname}${randomSuffix}`,
      full_name: userInfo.nickName || `用户${randomSuffix}`,
      password: `wx_${wxCode.slice(-8)}`, // 使用微信code生成临时密码
      is_active: true
    };
  }

  /**
   * 用户登录流程
   */
  async loginUser() {
    try {
      // 1. 获取微信登录凭证
      const wxCode = await this.getWxLoginCode();
      console.log('获取微信登录凭证成功:', wxCode);

      // 2. 尝试通过code查询用户是否已存在
      const existingUser = await this._checkUserExists(wxCode);
      if (existingUser) {
        return {
          success: true,
          data: existingUser,
          isNewUser: false
        };
      }

      // 3. 如果用户不存在，创建新用户
      const newUser = await this._createNewUser(wxCode);
      return {
        success: true,
        data: newUser,
        isNewUser: true
      };

    } catch (error) {
      console.error('用户登录失败:', error);
      return {
        success: false,
        error: error.message || CONSTANTS.ERROR_MESSAGES.LOGIN_FAILED,
        errorType: 'LOGIN_FAILED'
      };
    }
  }

  /**
   * 检查用户是否已存在
   */
  async _checkUserExists(wxCode) {
    try {
      // 由于后端API限制，这里需要调整为通过其他方式检查用户
      // 实际项目中应该后端支持通过wx_code查询用户
      const storedUser = wx.getStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO);
      if (storedUser && storedUser.wx_code === wxCode) {
        // 验证用户是否仍然存在
        const result = await this.networkUtil.makeRequest(
          CONSTANTS.API_ENDPOINTS.USER_BY_ID(storedUser.id)
        );
        if (result.success) {
          return result.data.data || result.data;
        }
      }
      return null;
    } catch (error) {
      console.error('检查用户存在性失败:', error);
      return null;
    }
  }

  /**
   * 创建新用户
   */
  async _createNewUser(wxCode) {
    try {
      // 生成默认用户信息
      const defaultUserInfo = {
        nickName: `用户${Date.now().toString().slice(-6)}`,
        avatarUrl: ''
      };

      const userAccount = this.generateUserAccount(defaultUserInfo, wxCode);

      const result = await this.networkUtil.makeRequest(
        CONSTANTS.API_ENDPOINTS.USERS,
        'POST',
        userAccount
      );

      if (result.success) {
        const userData = result.data.data || result.data;
        // 保存用户信息
        wx.setStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO, userData);
        return userData;
      } else {
        throw new Error(result.error || CONSTANTS.ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId, profileData) {
    try {
      const result = await this.networkUtil.makeRequest(
        CONSTANTS.API_ENDPOINTS.USER_BY_ID(userId),
        'PUT',
        profileData
      );

      if (result.success) {
        const userData = result.data.data || result.data;
        // 更新本地存储
        wx.setStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO, userData);
        return {
          success: true,
          data: userData
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR
      };
    }
  }

  /**
   * 用户登出
   */
  async logoutUser() {
    try {
      // 清除本地存储
      wx.removeStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO);
      wx.removeStorageSync(CONSTANTS.STORAGE_KEYS.USER_PROFILE);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      const userInfo = wx.getStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO);
      if (!userInfo || !userInfo.id) {
        return {
          isLoggedIn: false,
          user: null
        };
      }

      // 验证用户信息是否仍然有效
      const result = await this.networkUtil.makeRequest(
        CONSTANTS.API_ENDPOINTS.USER_BY_ID(userInfo.id),
        'GET',
        null,
        { maxRetries: 1 } // 减少重试次数，加快检查速度
      );

      if (result.success) {
        const userData = result.data.data || result.data;
        // 更新本地存储
        wx.setStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO, userData);
        return {
          isLoggedIn: true,
          user: userData
        };
      } else {
        // 用户信息无效，清除本地存储
        this.logoutUser();
        return {
          isLoggedIn: false,
          user: null,
          error: result.error
        };
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return {
        isLoggedIn: false,
        user: null,
        error: error.message
      };
    }
  }
}

module.exports = AuthUtil;