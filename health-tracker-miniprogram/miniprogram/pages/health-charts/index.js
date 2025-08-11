// 健康变化图表页面
Page({
  data: {
    loading: true,
    currentTab: 'health_score', // health_score, bmi_trend, symptom_frequency, constitution_changes, comprehensive
    timeRange: '30d', // 7d, 30d, 90d, 6m, 1y
    
    // 图表数据
    chartData: null,
    summary: null,
    
    // 时间范围选项
    timeRangeOptions: [
      { value: '7d', label: '最近7天' },
      { value: '30d', label: '最近30天' },
      { value: '90d', label: '最近90天' },
      { value: '6m', label: '最近6个月' },
      { value: '1y', label: '最近1年' }
    ],
    
    // 图表类型选项
    chartTypeOptions: [
      { value: 'health_score', label: '健康评分', icon: '📊' },
      { value: 'bmi_trend', label: 'BMI趋势', icon: '⚖️' },
      { value: 'symptom_frequency', label: '症状频率', icon: '🔍' },
      { value: 'constitution_changes', label: '体质分布', icon: '🫀' },
      { value: 'comprehensive', label: '综合分析', icon: '📈' }
    ],
    
    // UI状态
    showTimeSelector: false,
    showTypeSelector: false,
    
    // 错误状态
    error: null,
    
    // 数据状态
    hasData: false,
    totalRecords: 0
  },

  onLoad() {
    console.log('健康图表页面加载');
    this.loadChartData();
  },

  onShow() {
    // 页面显示时刷新数据
    if (!this.data.loading) {
      this.loadChartData();
    }
  },

  /**
   * 加载图表数据
   */
  async loadChartData() {
    try {
      this.setData({ 
        loading: true,
        error: null
      });

      wx.showLoading({ title: '加载中...' });

      const result = await wx.cloud.callFunction({
        name: 'getHealthTrends',
        data: {
          timeRange: this.data.timeRange,
          chartType: this.data.currentTab
        }
      });

      wx.hideLoading();

      console.log('图表数据结果:', result);

      if (result.result && result.result.success) {
        const data = result.result.data;
        
        this.setData({
          chartData: data.chartData,
          summary: data.summary,
          totalRecords: data.totalRecords,
          hasData: data.totalRecords > 0,
          loading: false
        });

        if (data.totalRecords === 0) {
          wx.showToast({
            title: '暂无数据',
            icon: 'none'
          });
        }
      } else {
        throw new Error(result.result?.error || '加载失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('加载图表数据失败:', error);
      
      this.setData({
        loading: false,
        error: error.message || '加载失败',
        hasData: false
      });

      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 切换图表类型
   */
  switchChartType(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.currentTab) return;

    this.setData({
      currentTab: type,
      showTypeSelector: false
    });

    this.loadChartData();
  },

  /**
   * 切换时间范围
   */
  switchTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    if (range === this.data.timeRange) return;

    this.setData({
      timeRange: range,
      showTimeSelector: false
    });

    this.loadChartData();
  },

  /**
   * 显示/隐藏时间选择器
   */
  toggleTimeSelector() {
    this.setData({
      showTimeSelector: !this.data.showTimeSelector,
      showTypeSelector: false
    });
  },

  /**
   * 显示/隐藏类型选择器
   */
  toggleTypeSelector() {
    this.setData({
      showTypeSelector: !this.data.showTypeSelector,
      showTimeSelector: false
    });
  },

  /**
   * 关闭选择器
   */
  closeSelectors() {
    this.setData({
      showTimeSelector: false,
      showTypeSelector: false
    });
  },

  /**
   * 获取当前时间范围标签
   */
  getCurrentTimeRangeLabel() {
    const current = this.data.timeRangeOptions.find(opt => opt.value === this.data.timeRange);
    return current ? current.label : '最近30天';
  },

  /**
   * 获取当前图表类型标签
   */
  getCurrentChartTypeLabel() {
    const current = this.data.chartTypeOptions.find(opt => opt.value === this.data.currentTab);
    return current ? current.label : '健康评分';
  },

  /**
   * 获取趋势指示器样式
   */
  getTrendIndicatorClass(trend) {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-stable';
    }
  },

  /**
   * 获取趋势图标
   */
  getTrendIcon(trend) {
    if (!trend) return '➖';
    
    switch (trend.direction) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➖';
    }
  },

  /**
   * 格式化数值
   */
  formatValue(value, unit = '') {
    if (typeof value !== 'number') return '--';
    return value.toFixed(1) + unit;
  },

  /**
   * 获取健康评分等级颜色
   */
  getScoreColor(score) {
    if (score >= 85) return '#2ecc71';
    if (score >= 75) return '#f39c12';
    if (score >= 65) return '#e67e22';
    return '#e74c3c';
  },

  /**
   * 获取BMI分类颜色
   */
  getBMIColor(bmi) {
    if (bmi < 18.5) return '#3498db';
    if (bmi < 24) return '#2ecc71';
    if (bmi < 28) return '#f39c12';
    return '#e74c3c';
  },

  /**
   * 分享图表
   */
  shareChart() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 导出数据
   */
  exportData() {
    if (!this.data.hasData) {
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none'
      });
      return;
    }

    wx.showActionSheet({
      itemList: ['导出图表图片', '导出数据报告'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.exportChartImage();
        } else if (res.tapIndex === 1) {
          this.exportDataReport();
        }
      }
    });
  },

  /**
   * 导出图表图片
   */
  exportChartImage() {
    wx.showToast({
      title: '图片导出功能开发中',
      icon: 'none'
    });
  },

  /**
   * 导出数据报告
   */
  exportDataReport() {
    if (!this.data.summary) {
      wx.showToast({
        title: '暂无报告数据',
        icon: 'none'
      });
      return;
    }

    // 生成简单的文本报告
    const { summary, chartData } = this.data;
    let report = `健康数据报告\n\n`;
    report += `时间范围: ${this.getCurrentTimeRangeLabel()}\n`;
    report += `图表类型: ${this.getCurrentChartTypeLabel()}\n`;
    report += `记录总数: ${this.data.totalRecords}条\n\n`;

    if (summary.avgScore) {
      report += `平均健康评分: ${summary.avgScore}分\n`;
      report += `健康等级: ${summary.healthLevel}\n`;
    }

    if (summary.recommendation) {
      report += `\n建议: ${summary.recommendation}\n`;
    }

    // 复制到剪贴板
    wx.setClipboardData({
      data: report,
      success: () => {
        wx.showToast({
          title: '报告已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 查看详细数据
   */
  viewDetailData() {
    if (!this.data.hasData) {
      wx.showToast({
        title: '暂无详细数据',
        icon: 'none'
      });
      return;
    }

    // 显示详细数据模态框
    wx.showModal({
      title: '详细数据',
      content: this.formatDetailData(),
      showCancel: false,
      confirmText: '关闭'
    });
  },

  /**
   * 格式化详细数据
   */
  formatDetailData() {
    const { summary, totalRecords } = this.data;
    
    let details = `数据概览:\n`;
    details += `• 记录总数: ${totalRecords}条\n`;
    
    if (summary.avgScore) {
      details += `• 平均评分: ${summary.avgScore}分\n`;
      details += `• 最高评分: ${summary.maxScore}分\n`;
      details += `• 最低评分: ${summary.minScore}分\n`;
    }
    
    if (summary.trend) {
      details += `• 变化趋势: ${summary.trend.description}\n`;
    }
    
    if (summary.recordCount) {
      details += `• 有效记录: ${summary.recordCount}条\n`;
    }
    
    return details;
  },

  /**
   * 刷新数据
   */
  refreshData() {
    this.loadChartData();
  },

  /**
   * 跳转到健康档案
   */
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/index'
    });
  },

  /**
   * 跳转到健康诊断
   */
  goToQuiz() {
    wx.navigateTo({
      url: '/pages/quiz/index'
    });
  }
});