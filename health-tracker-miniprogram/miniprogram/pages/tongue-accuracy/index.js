// 舌象识别准确性分析页面
Page({
  data: {
    loading: true,
    adminInfo: null,
    currentTab: 'overview', // overview, batch, reports
    
    // 概览数据
    overview: {
      totalAnalyzed: 0,
      avgAccuracy: 0,
      recentReports: [],
      quickStats: {
        colorAccuracy: 0,
        coatingAccuracy: 0,
        diagnosisConsistency: 0
      }
    },
    
    // 批量分析
    batchAnalysis: {
      isRunning: false,
      progress: 0,
      results: null,
      lastRun: null
    },
    
    // 报告列表
    reports: [],
    
    // 当前查看的详细报告
    currentReport: null,
    showReportDetail: false
  },

  onLoad() {
    // 检查管理员权限
    this.checkAdminAccess();
  },

  /**
   * 检查管理员权限
   */
  async checkAdminAccess() {
    try {
      wx.showLoading({ title: '验证权限中...' });
      
      const permissionResult = await wx.cloud.callFunction({
        name: 'checkAdminPermission',
        data: {
          requiredRole: 'admin' // 需要管理员及以上权限
        }
      });

      wx.hideLoading();

      if (!permissionResult.result || !permissionResult.result.success) {
        this.showErrorAndGoBack('权限检查失败', permissionResult.result?.error || '无法验证权限');
        return;
      }

      if (!permissionResult.result.isAdmin || !permissionResult.result.hasPermission) {
        this.showErrorAndGoBack('访问受限', '此页面需要管理员权限');
        return;
      }

      // 权限验证通过
      this.setData({
        adminInfo: permissionResult.result.adminInfo
      });

      // 加载数据
      this.loadOverviewData();
      
    } catch (error) {
      wx.hideLoading();
      console.error('权限检查失败:', error);
      this.showErrorAndGoBack('权限验证异常', '权限验证过程中出现错误');
    }
  },

  /**
   * 显示错误并返回
   */
  showErrorAndGoBack(title, content) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: () => {
        wx.navigateBack();
      }
    });
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    
    switch (tab) {
      case 'overview':
        this.loadOverviewData();
        break;
      case 'batch':
        this.loadBatchAnalysisData();
        break;
      case 'reports':
        this.loadReportsData();
        break;
    }
  },

  /**
   * 加载概览数据
   */
  async loadOverviewData() {
    try {
      this.setData({ loading: true });

      // 获取最新的准确性报告
      const reportResult = await wx.cloud.callFunction({
        name: 'analyzeTongueAccuracy',
        data: {
          mode: 'generate_report'
        }
      });

      if (reportResult.result && reportResult.result.success) {
        const report = reportResult.result.report;
        
        this.setData({
          overview: {
            totalAnalyzed: report.summary?.totalAnalyzed || 0,
            avgAccuracy: report.accuracyMetrics?.avgOverallAccuracy || 0,
            recentReports: [report],
            quickStats: {
              colorAccuracy: report.accuracyMetrics?.avgColorAccuracy || 0,
              coatingAccuracy: report.accuracyMetrics?.avgCoatingAccuracy || 0,
              diagnosisConsistency: report.accuracyMetrics?.avgDiagnosisConsistency || 0
            }
          }
        });
      }
    } catch (error) {
      console.error('加载概览数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载批量分析数据
   */
  async loadBatchAnalysisData() {
    // 获取上次批量分析结果
    try {
      // 这里可以从数据库获取上次的分析结果
      console.log('加载批量分析历史数据');
    } catch (error) {
      console.error('加载批量分析数据失败:', error);
    }
  },

  /**
   * 加载报告数据
   */
  async loadReportsData() {
    try {
      this.setData({ loading: true });
      
      // 这里应该有一个获取报告列表的云函数
      // 暂时模拟数据
      const mockReports = [
        {
          id: 'report_1',
          date: new Date().toISOString(),
          totalSamples: 150,
          avgAccuracy: 78.5,
          type: '定期分析报告'
        }
      ];
      
      this.setData({
        reports: mockReports
      });
    } catch (error) {
      console.error('加载报告数据失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 开始批量分析
   */
  async startBatchAnalysis() {
    const confirmResult = await this.showConfirm(
      '开始批量分析',
      '这将分析最近100条舌象记录的准确性，可能需要几分钟时间，确定开始吗？'
    );

    if (!confirmResult) return;

    try {
      this.setData({
        'batchAnalysis.isRunning': true,
        'batchAnalysis.progress': 0
      });

      wx.showLoading({ title: '分析中...' });

      const result = await wx.cloud.callFunction({
        name: 'analyzeTongueAccuracy',
        data: {
          mode: 'batch_analyze'
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        this.setData({
          'batchAnalysis.results': result.result.summary,
          'batchAnalysis.lastRun': new Date().toLocaleString(),
          'batchAnalysis.progress': 100
        });

        wx.showToast({
          title: '分析完成',
          icon: 'success'
        });
      } else {
        throw new Error(result.result?.error || '批量分析失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('批量分析失败:', error);
      wx.showToast({
        title: error.message || '分析失败',
        icon: 'none'
      });
    } finally {
      this.setData({
        'batchAnalysis.isRunning': false
      });
    }
  },

  /**
   * 查看报告详情
   */
  viewReportDetail(e) {
    const { report } = e.currentTarget.dataset;
    this.setData({
      currentReport: report,
      showReportDetail: true
    });
  },

  /**
   * 关闭报告详情
   */
  closeReportDetail() {
    this.setData({
      showReportDetail: false,
      currentReport: null
    });
  },

  /**
   * 分析单条记录
   */
  async analyzeSingleRecord() {
    const { value } = await this.showPrompt('输入记录ID', '请输入要分析的健康记录ID');
    
    if (!value) return;

    try {
      wx.showLoading({ title: '分析中...' });

      const result = await wx.cloud.callFunction({
        name: 'analyzeTongueAccuracy',
        data: {
          mode: 'analyze',
          analysisId: value
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        const accuracy = result.result.accuracyResult;
        
        wx.showModal({
          title: '分析结果',
          content: `总体准确性: ${accuracy.overallScore.toFixed(1)}分\n舌色准确性: ${accuracy.colorAccuracy.score}分\n舌苔准确性: ${accuracy.coatingAccuracy.score}分`,
          showCancel: false
        });
      } else {
        throw new Error(result.result?.error || '分析失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('单记录分析失败:', error);
      wx.showToast({
        title: error.message || '分析失败',
        icon: 'none'
      });
    }
  },

  /**
   * 显示确认对话框
   */
  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },

  /**
   * 显示输入框
   */
  showPrompt(title, placeholder) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        placeholderText: placeholder,
        editable: true,
        success: (res) => {
          resolve(res);
        }
      });
    });
  },

  /**
   * 刷新当前数据
   */
  refreshData() {
    switch (this.data.currentTab) {
      case 'overview':
        this.loadOverviewData();
        break;
      case 'batch':
        this.loadBatchAnalysisData();
        break;
      case 'reports':
        this.loadReportsData();
        break;
    }
  },

  /**
   * 导出报告
   */
  exportReport() {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  }
});