Page({
  data: {
    result: {},
    recordId: ''
  },

  onLoad(options) {
    try {
      const result = JSON.parse(decodeURIComponent(options.result || '{}'));
      const recordId = options.recordId || '';
      
      console.log('接收到的结果数据:', result);
      
      this.setData({
        result,
        recordId
      });
    } catch (error) {
      console.error('解析结果数据失败:', error);
      wx.showToast({
        title: '数据错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 查看API统计
  viewAPIStats() {
    wx.navigateTo({
      url: '/pages/api-stats/index'
    });
  },

  // 分享结果
  shareResult() {
    const { healthScore, bmiStatus } = this.data.result;
    
    wx.showActionSheet({
      itemList: ['分享给好友', '保存截图'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 触发分享
          wx.showModal({
            title: '分享提示',
            content: '请点击右上角"..."按钮选择分享给好友',
            showCancel: false,
            confirmText: '知道了'
          });
        } else if (res.tapIndex === 1) {
          // 保存截图
          wx.showModal({
            title: '截图保存',
            content: '请使用手机截屏功能保存当前页面',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      }
    });
  },

  // 重新评估
  newAssessment() {
    wx.showModal({
      title: '重新评估',
      content: '确定要开始新的健康评估吗？',
      success: (res) => {
        if (res.confirm) {
          wx.redirectTo({
            url: '/pages/quiz/index'
          });
        }
      }
    });
  },

  // 返回首页
  goToHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 跳转到健康档案
  goToProfile() {
    wx.reLaunch({
      url: '/pages/profile/index'
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    const { healthScore, bmiStatus } = this.data.result;
    return {
      title: `我的健康评分：${healthScore}分 (${bmiStatus})`,
      path: '/pages/index/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const { healthScore, bmiStatus } = this.data.result;
    return {
      title: `健康评分：${healthScore}分 - 智慧健康诊断`
    };
  }
});