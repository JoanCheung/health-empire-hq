// network-test/index.js
Page({
  data: {
    testing: false,
    results: null,
    error: null
  },

  onLoad() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    
    wx.cloud.init({
      traceUser: true
    });
  },

  async runNetworkTest() {
    if (this.data.testing) return;
    
    this.setData({
      testing: true,
      results: null,
      error: null
    });
    
    wx.showLoading({
      title: '诊断网络连接...'
    });
    
    try {
      console.log('开始网络诊断...');
      
      const result = await wx.cloud.callFunction({
        name: 'network-test',
        config: {
          env: 'cloud1-6gg9zh5k6f75e020',
          timeout: 30000  // 30秒超时
        }
      });
      
      console.log('网络诊断结果:', result);
      
      if (result.result && result.result.success) {
        this.setData({
          results: result.result.results,
          summary: result.result.summary
        });
        
        wx.showToast({
          title: '诊断完成',
          icon: 'success'
        });
      } else {
        this.setData({
          error: result.result ? result.result.error : '未知错误'
        });
        
        wx.showToast({
          title: '诊断失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('网络诊断调用失败:', error);
      this.setData({
        error: error.message || '调用失败'
      });
      
      wx.showToast({
        title: '调用失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        testing: false
      });
      wx.hideLoading();
    }
  },

  copyResults() {
    if (!this.data.results) return;
    
    const resultsText = JSON.stringify({
      timestamp: this.data.results.timestamp,
      tests: this.data.results.tests,
      summary: this.data.summary
    }, null, 2);
    
    wx.setClipboardData({
      data: resultsText,
      success: () => {
        wx.showToast({
          title: '结果已复制',
          icon: 'success'
        });
      }
    });
  }
});