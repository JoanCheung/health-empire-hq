// 数据库调试页面
Page({
  data: {
    records: [],
    stats: {},
    loading: false
  },

  onLoad() {
    this.loadDatabaseInfo();
  },

  // 加载数据库信息
  async loadDatabaseInfo() {
    this.setData({ loading: true });

    try {
      // 调用getRecords获取数据
      const result = await wx.cloud.callFunction({
        name: 'getRecords',
        data: {}
      });

      console.log('数据库调试结果:', result);

      if (result.result && result.result.success) {
        const records = result.result.data || [];
        
        // 计算统计信息
        const stats = {
          totalRecords: records.length,
          dates: [...new Set(records.map(r => r.date))].sort(),
          apiSources: this.countBy(records, 'apiSource'),
          analysisTypes: this.countBy(records, 'analysisType'),
          healthScores: records.map(r => r.healthScore),
          latestRecord: records[0],
          oldestRecord: records[records.length - 1]
        };

        this.setData({
          records,
          stats,
          loading: false
        });

        // 检查今天是否有数据
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r => r.date === today);
        
        if (todayRecords.length === 0) {
          wx.showModal({
            title: '⚠️ 数据缺失',
            content: `今天(${today})没有找到健康记录。数据库中最新记录是${stats.latestRecord?.date || '无'}`,
            showCancel: false
          });
        }

      } else {
        throw new Error(result.result?.error || '获取数据失败');
      }

    } catch (error) {
      console.error('加载数据库信息失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 统计函数
  countBy(array, key) {
    return array.reduce((acc, item) => {
      const value = item[key] || 'unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  },

  // 测试保存新记录
  async testSaveRecord() {
    wx.showLoading({ title: '测试保存...' });

    try {
      const testData = {
        formData: {
          basicInfo: {
            age: '30',
            gender: 'male',
            height: '175',
            weight: '70'
          },
          quizAnswers: {
            question1: 'sometimes',
            question2: 'light-red', 
            question3: 'thin',
            question4: 'good'
          },
          questionTexts: {
            question1: '测试问题1',
            question2: '测试问题2',
            question3: '测试问题3',
            question4: '测试问题4'
          }
        },
        imageUrl: ''
      };

      const result = await wx.cloud.callFunction({
        name: 'analyze',
        data: testData
      });

      console.log('测试保存结果:', result);

      if (result.result && result.result.success) {
        wx.showToast({
          title: '测试保存成功！',
          icon: 'success'
        });
        
        // 重新加载数据
        setTimeout(() => {
          this.loadDatabaseInfo();
        }, 1000);
      } else {
        throw new Error(result.result?.error || '保存失败');
      }

    } catch (error) {
      console.error('测试保存失败:', error);
      wx.showModal({
        title: '测试保存失败',
        content: error.message,
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 刷新数据
  refreshData() {
    this.loadDatabaseInfo();
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});