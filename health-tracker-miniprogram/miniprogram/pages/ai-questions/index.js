Page({
  data: {
    formData: null,
    tongueImageFileID: '',
    aiQuestions: [],
    answers: {},
    answeredCount: 0,
    allAnswered: false,
    isSubmitting: false,
    showLoading: false,
    loadingText: '正在分析...'
  },

  onLoad(options) {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    
    wx.cloud.init({
      traceUser: true
    });

    // 从URL参数中获取数据
    try {
      const formData = JSON.parse(decodeURIComponent(options.formData || '{}'));
      const tongueImageFileID = options.tongueImageFileID || '';
      const aiQuestions = JSON.parse(decodeURIComponent(options.aiQuestions || '[]'));
      
      console.log('接收到的数据:', { formData, tongueImageFileID, aiQuestions });
      
      this.setData({
        formData,
        tongueImageFileID,
        aiQuestions
      });
    } catch (error) {
      console.error('解析参数失败:', error);
      wx.showToast({
        title: '数据错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 回答问题
  onAnswerChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const questionKey = `question${index}`;
    
    const newAnswers = { ...this.data.answers };
    newAnswers[questionKey] = value;
    
    // 计算已回答问题数量
    const answeredCount = Object.keys(newAnswers).filter(key => newAnswers[key]).length;
    const allAnswered = answeredCount === this.data.aiQuestions.length;
    
    this.setData({
      answers: newAnswers,
      answeredCount,
      allAnswered
    });
  },

  // 跳过AI问题，直接分析
  async skipAIQuestions() {
    wx.showModal({
      title: '确认跳过',
      content: '跳过AI问题将使用基础分析，可能不如个性化分析准确。确定要跳过吗？',
      success: async (res) => {
        if (res.confirm) {
          await this.performAnalysis();
        }
      }
    });
  },

  // 提交答案
  async submitAnswers() {
    if (this.data.isSubmitting) return;
    
    if (!this.data.allAnswered) {
      wx.showToast({
        title: '请回答所有问题',
        icon: 'none'
      });
      return;
    }

    await this.performAnalysis(this.data.aiQuestions, this.data.answers);
  },

  // 执行分析
  async performAnalysis(aiQuestions = null, aiAnswers = null) {
    this.setData({
      isSubmitting: true,
      showLoading: true,
      loadingText: '正在进行深度健康分析...'
    });

    try {
      const analysisData = {
        formData: { ...this.data.formData },
        imageUrl: this.data.tongueImageFileID
      };

      // 如果有AI问题和答案，添加到分析数据中
      if (aiQuestions && aiAnswers) {
        analysisData.formData.aiQuestions = aiQuestions;
        analysisData.formData.aiAnswers = aiAnswers;
      }

      console.log('发送分析数据:', analysisData);

      const result = await new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'analyze',
          data: analysisData,
          config: {
            env: 'cloud1-6gg9zh5k6f75e020',
            timeout: 30000  // 增加超时时间为30秒
          },
          success: (res) => {
            console.log('分析结果:', res);
            resolve(res.result);
          },
          fail: (err) => {
            console.error('调用analyze失败:', err);
            reject(err);
          }
        });
      });

      if (result.success) {
        // 跳转到结果页面
        wx.redirectTo({
          url: `/pages/result/index?result=${encodeURIComponent(JSON.stringify(result.data))}&recordId=${result.recordId || ''}`
        });
      } else {
        wx.showToast({
          title: result.error || '分析失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('分析失败:', error);
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({
        isSubmitting: false,
        showLoading: false
      });
    }
  }
});