// API使用统计页面
Page({
  data: {
    stats: {
      total: 0,
      qwenCount: 0,
      geminiCount: 0,
      offlineCount: 0,
      qwenWinRate: 0,
      recentAnalysis: []
    },
    loading: true,
    adminInfo: null
  },

  onLoad() {
    // 检查是否为管理员用户
    this.checkAdminAccess();
  },

  // 检查管理员权限
  async checkAdminAccess() {
    try {
      wx.showLoading({ title: '验证权限中...' });
      
      // 使用新的权限检查云函数
      const permissionResult = await wx.cloud.callFunction({
        name: 'checkAdminPermission',
        data: {
          requiredRole: 'moderator' // API统计需要版主及以上权限
        }
      });

      wx.hideLoading();

      console.log('权限检查结果:', permissionResult);

      if (!permissionResult.result || !permissionResult.result.success) {
        wx.showModal({
          title: '权限检查失败',
          content: permissionResult.result?.error || '无法验证权限',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
        return;
      }

      if (!permissionResult.result.isAdmin || !permissionResult.result.hasPermission) {
        wx.showModal({
          title: '访问受限',
          content: '此页面仅供管理员查看，需要版主及以上权限',
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
        return;
      }

      // 权限验证通过，保存管理员信息
      this.setData({
        adminInfo: permissionResult.result.adminInfo
      });

      // 加载统计数据
      this.loadAPIStats();
    } catch (error) {
      wx.hideLoading();
      console.error('权限检查失败:', error);
      wx.showModal({
        title: '权限验证异常',
        content: '权限验证过程中出现错误，请稍后重试',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  // 加载API使用统计
  async loadAPIStats() {
    try {
      this.setData({ loading: true });

      // 调用云函数获取统计数据
      const result = await wx.cloud.callFunction({
        name: 'getRecords',
        data: {
          getStats: true // 新增统计参数
        }
      });

      console.log('API统计数据:', result);

      if (result.result && result.result.success) {
        const records = result.result.records || [];
        
        // 计算统计数据
        const stats = this.calculateStats(records);
        
        this.setData({
          stats,
          loading: false
        });
      } else {
        throw new Error('获取统计数据失败');
      }
    } catch (error) {
      console.error('加载API统计失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 计算统计数据
  calculateStats(records) {
    let qwenCount = 0;
    let geminiCount = 0;
    let offlineCount = 0;
    let backupCount = 0;
    const recentAnalysis = [];

    records.forEach(record => {
      // 优先使用新的apiCallInfo，然后使用apiSource
      let apiSource = 'Unknown';
      let wasSuccessful = true;
      
      if (record.apiCallInfo) {
        apiSource = record.apiCallInfo.usedAPI;
        wasSuccessful = record.apiCallInfo.analysisSuccess;
      } else {
        apiSource = record.apiSource || record.analysisType;
      }
      
      // 统计API使用情况
      if (apiSource === 'Qwen') {
        qwenCount++;
      } else if (apiSource === 'Gemini') {
        geminiCount++;
      } else if (apiSource === 'backup' || record.apiSource === 'backup') {
        backupCount++;
      } else if (record.analysis && record.analysis.isOfflineAnalysis) {
        offlineCount++;
      }

      // 收集最近的分析记录
      if (recentAnalysis.length < 15) {
        recentAnalysis.push({
          date: record.createTime,
          apiSource: apiSource,
          healthScore: record.analysis ? record.analysis.healthScore : 'N/A',
          wasSuccessful: wasSuccessful,
          hasHistoryContext: record.apiCallInfo ? record.apiCallInfo.hasHistoryContext : false,
          clarifyingQuestions: record.clarifyingQuestionsCount || 0,
          fallbackUsed: record.apiCallInfo ? record.apiCallInfo.fallbackUsed : false
        });
      }
    });

    const total = records.length;
    const successfulAICalls = qwenCount + geminiCount;
    const qwenWinRate = successfulAICalls > 0 ? Math.round((qwenCount / successfulAICalls) * 100) : 0;
    const successRate = total > 0 ? Math.round((successfulAICalls / total) * 100) : 0;

    console.log('API统计计算结果:', {
      total,
      qwenCount,
      geminiCount,
      backupCount,
      offlineCount,
      successRate,
      qwenWinRate
    });

    return {
      total,
      qwenCount,
      geminiCount,  
      backupCount,
      offlineCount,
      successRate,
      qwenWinRate,
      recentAnalysis: recentAnalysis.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
  },

  // 刷新统计
  refreshStats() {
    this.loadAPIStats();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});