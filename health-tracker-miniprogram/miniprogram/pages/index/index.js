// index.js - 健康诊断小程序首页
const config = require('../../config.js');
const CONSTANTS = require('../../utils/constants.js');
const NetworkUtil = require('../../utils/network.js');
const AuthUtil = require('../../utils/auth.js');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    userProfile: null,
    loading: false,
    users: [], // 存储从API获取的用户列表
    apiConfig: null, // API配置
    lastCheckTime: 0, // 上次检查登录状态的时间
    isRefreshing: false // 是否正在刷新数据
  },

  // 工具类实例
  networkUtil: null,
  authUtil: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('页面加载开始');
    
    // 初始化工具类
    this.networkUtil = NetworkUtil.getInstance();
    this.authUtil = AuthUtil.getInstance();
    
    // 初始化并验证API配置
    if (!config.validateConfig()) {
      this.showError(CONSTANTS.ERROR_MESSAGES.API_CONFIG_ERROR);
      return;
    }
    
    const apiConfig = config.getApiConfig();
    this.setData({ apiConfig });
    
    // 初始化页面数据
    this.initPageData();
  },

  /**
   * 初始化页面数据
   */
  async initPageData() {
    try {
      this.setData({ loading: true });
      
      // 并发执行数据加载和登录状态检查
      const [usersResult, loginResult] = await Promise.allSettled([
        this.loadUsersFromAPI(),
        this.checkUserStatus()
      ]);
      
      if (usersResult.status === 'rejected') {
        console.error('加载用户数据失败:', usersResult.reason);
      }
      
      if (loginResult.status === 'rejected') {
        console.error('检查登录状态失败:', loginResult.reason);
      }
      
      console.log('页面初始化完成');
    } catch (error) {
      console.error('页面初始化失败:', error);
      this.showError(CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 从后端API加载用户数据
   */
  async loadUsersFromAPI() {
    try {
      const result = await this.networkUtil.makeRequest(CONSTANTS.API_ENDPOINTS.USERS);
      
      if (result.success && result.data) {
        this.setData({
          users: result.data.items || result.data || [],
        });
        console.log('用户数据加载成功:', result.data);
        return result.data;
      } else {
        console.error('加载用户数据失败:', result.error);
        this.showError(CONSTANTS.ERROR_MESSAGES.DATA_LOAD_FAILED);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('API请求失败:', error);
      this.showError(CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR);
      throw error;
    }
  },

  // 删除旧的 makeAPIRequest 方法，使用 NetworkUtil 替代

  /**
   * 显示错误信息
   */
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000,
      mask: true
    });
  },

  /**
   * 显示成功信息
   */
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  },

  /**
   * 检查用户登录状态和个人信息完整性
   */
  async checkUserStatus(forceCheck = false) {
    try {
      const now = Date.now();
      // 避免频繁检查，30秒内不重复检查（除非强制检查）
      if (!forceCheck && (now - this.data.lastCheckTime) < 30000) {
        console.log('跳过重复检查登录状态');
        return;
      }
      
      this.setData({ lastCheckTime: now });
      
      const loginStatus = await this.authUtil.checkLoginStatus();
      
      if (loginStatus.isLoggedIn && loginStatus.user) {
        this.setData({
          isLoggedIn: true,
          userInfo: loginStatus.user,
          userProfile: loginStatus.user
        });
        console.log('用户登录状态验证成功:', loginStatus.user);
        return loginStatus.user;
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: null,
          userProfile: null
        });
        console.log('用户未登录或登录已过期');
        if (loginStatus.error) {
          console.warn('登录状态检查错误:', loginStatus.error);
        }
        return null;
      }
    } catch (error) {
      console.error('登录状态检查失败:', error);
      // 不在这里显示错误提示，避免频繁弹窗
      return null;
    }
  },

  /**
   * 获取用户详细资料
   */
  async getUserProfile(userId) {
    if (!userId) {
      const userInfo = wx.getStorageSync(CONSTANTS.STORAGE_KEYS.USER_INFO);
      userId = userInfo?.id;
    }
    
    if (!userId) {
      console.log('无用户ID，无法获取用户资料');
      return null;
    }

    try {
      const result = await this.networkUtil.makeRequest(
        CONSTANTS.API_ENDPOINTS.USER_BY_ID(userId)
      );

      if (result.success && result.data) {
        const userData = result.data.data || result.data;
        this.setData({
          userProfile: userData
        });
        console.log('用户资料获取成功:', userData);
        return userData;
      } else {
        console.log('用户资料获取失败或为空，需要引导用户完善信息');
        return null;
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
      this.showError(CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND);
      return null;
    }
  },

  /**
   * 用户授权登录 - 使用新的安全登录方式
   */
  async handleUserLogin() {
    try {
      this.setData({ loading: true });
      
      console.log('开始用户登录流程');
      
      // 使用 AuthUtil 处理登录
      const loginResult = await this.authUtil.loginUser();
      
      if (loginResult.success && loginResult.data) {
        this.setData({
          userInfo: loginResult.data,
          userProfile: loginResult.data,
          isLoggedIn: true
        });

        this.showSuccess(
          loginResult.isNewUser 
            ? CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS + '（新用户）'
            : CONSTANTS.SUCCESS_MESSAGES.LOGIN_SUCCESS
        );

        console.log('用户登录成功:', {
          user: loginResult.data,
          isNewUser: loginResult.isNewUser
        });
      } else {
        console.error('用户登录失败:', loginResult.error);
        
        if (loginResult.errorType === 'LOGIN_FAILED') {
          this.showError(CONSTANTS.ERROR_MESSAGES.LOGIN_FAILED);
        } else {
          this.showError(loginResult.error || CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR);
        }
      }
    } catch (error) {
      console.error('登录过程异常:', error);
      this.showError(CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    if (this.data.isRefreshing) {
      console.log('正在刷新，跳过重复请求');
      return;
    }
    
    try {
      this.setData({ isRefreshing: true });
      
      // 并发执行数据刷新
      await Promise.allSettled([
        this.loadUsersFromAPI(),
        this.checkUserStatus(true) // 强制检查
      ]);
      
      console.log('数据刷新完成');
    } catch (error) {
      console.error('数据刷新失败:', error);
    } finally {
      this.setData({ isRefreshing: false });
    }
  },

  /**
   * 用户退出登录
   */
  async handleLogout() {
    try {
      const result = await new Promise((resolve) => {
        wx.showModal({
          title: '确认退出',
          content: '确定要退出登录吗？',
          success: resolve,
          fail: () => resolve({ confirm: false })
        });
      });
      
      if (result.confirm) {
        // 使用 AuthUtil 处理登出
        const logoutResult = await this.authUtil.logoutUser();
        
        if (logoutResult.success) {
          // 重置页面数据
          this.setData({
            userInfo: null,
            isLoggedIn: false,
            userProfile: null
          });
          
          this.showSuccess(CONSTANTS.SUCCESS_MESSAGES.LOGOUT_SUCCESS);
          console.log('用户退出登录成功');
        } else {
          console.error('退出登录失败:', logoutResult.error);
          this.showError('退出登录失败');
        }
      }
    } catch (error) {
      console.error('退出登录异常:', error);
      this.showError(CONSTANTS.ERROR_MESSAGES.SYSTEM_ERROR);
    }
  },

  /**
   * 跳转到个人信息完善页面
   */
  goToCompleteProfile() {
    wx.navigateTo({
      url: '/pages/user-profile/index'
    });
  },

  /**
   * 处理用户头像选择（新版本微信小程序推荐方式）
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    console.log('用户选择头像:', avatarUrl);
    
    // 更新本地显示
    this.setData({
      'userProfile.avatarUrl': avatarUrl
    });
    
    // 如果用户已登录，更新到服务器
    if (this.data.isLoggedIn && this.data.userInfo) {
      this.updateUserAvatar(avatarUrl);
    }
  },

  /**
   * 处理用户昵称输入（新版本微信小程序推荐方式）
   */
  onNicknameChange(e) {
    const nickname = e.detail.value;
    console.log('用户输入昵称:', nickname);
    
    // 更新本地显示
    this.setData({
      'userProfile.full_name': nickname
    });
    
    // 如果用户已登录，更新到服务器
    if (this.data.isLoggedIn && this.data.userInfo) {
      this.updateUserNickname(nickname);
    }
  },

  /**
   * 更新用户头像
   */
  async updateUserAvatar(avatarUrl) {
    try {
      const result = await this.authUtil.updateUserProfile(this.data.userInfo.id, {
        avatar_url: avatarUrl
      });
      
      if (result.success) {
        console.log('头像更新成功');
        this.setData({
          userInfo: result.data,
          userProfile: result.data
        });
      } else {
        console.error('头像更新失败:', result.error);
      }
    } catch (error) {
      console.error('头像更新异常:', error);
    }
  },

  /**
   * 更新用户昵称
   */
  async updateUserNickname(nickname) {
    try {
      const result = await this.authUtil.updateUserProfile(this.data.userInfo.id, {
        full_name: nickname
      });
      
      if (result.success) {
        console.log('昵称更新成功');
        this.setData({
          userInfo: result.data,
          userProfile: result.data
        });
      } else {
        console.error('昵称更新失败:', result.error);
      }
    } catch (error) {
      console.error('昵称更新异常:', error);
    }
  },

  // 开始诊断 - 跳转到quiz页面
  startDiagnosis() {
    wx.navigateTo({
      url: '/pages/quiz/index'
    });
  },

  // 跳转到健康档案
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/index'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('页面显示');
    // 页面显示时检查用户状态，但不频繁检查
    this.checkUserStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('页面隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('页面卸载');
    // 清理网络请求队列
    if (this.networkUtil) {
      this.networkUtil.clearQueue();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  async onPullDownRefresh() {
    console.log('用户下拉刷新');
    try {
      await this.refreshData();
      this.showSuccess(CONSTANTS.SUCCESS_MESSAGES.DATA_REFRESH_SUCCESS);
    } catch (error) {
      console.error('下拉刷新失败:', error);
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    return {
      title: '智慧健康诊断 - 基于AI技术的中医舌诊健康评估系统',
      path: '/pages/index/index'
    };
  }
});