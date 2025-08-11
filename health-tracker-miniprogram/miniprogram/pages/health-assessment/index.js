Page({
  data: {
    step: 1,
    formData: {
      basicInfo: {
        gender: 'male',
        age: '',
        height: '',
        weight: ''
      },
      quizAnswers: {
        question1: '',
        question2: '',
        question3: '',
        question4: ''
      },
      questionTexts: {
        question1: '您是否经常感到口干舌燥？',
        question2: '您觉得自己的舌头颜色是？',
        question3: '您觉得自己的舌苔厚度如何？',
        question4: '您的睡眠质量如何？'
      }
    },
    questions: [
      {
        id: 'question1',
        text: '您是否经常感到口干舌燥？',
        options: [
          { value: 'never', label: '从不' },
          { value: 'sometimes', label: '偶尔' },
          { value: 'often', label: '经常' },
          { value: 'always', label: '总是' }
        ]
      },
      {
        id: 'question2',  
        text: '您觉得自己的舌头颜色是？',
        options: [
          { value: 'light-red', label: '淡红色（正常）' },
          { value: 'pale', label: '淡白色' },
          { value: 'red', label: '红色' },
          { value: 'dark-red', label: '暗红色' }
        ]
      },
      {
        id: 'question3',
        text: '您觉得自己的舌苔厚度如何？',
        options: [
          { value: 'thin', label: '薄苔' },
          { value: 'thick', label: '厚苔' },
          { value: 'no-coating', label: '无苔' },
          { value: 'peeling', label: '剥脱苔' }
        ]
      },
      {
        id: 'question4',
        text: '您的睡眠质量如何？',
        options: [
          { value: 'excellent', label: '很好，睡眠充足' },
          { value: 'good', label: '较好，偶尔失眠' },
          { value: 'fair', label: '一般，经常失眠' },
          { value: 'poor', label: '很差，严重失眠' }
        ]
      }
    ],
    tongueImage: '',
    tongueImageFileID: '',
    isSubmitting: false,
    showLoading: false,
    loadingText: '正在分析...',
    isStep1Valid: false,
    isStep2Valid: false
  },

  // 更新验证状态
  updateValidationStatus() {
    const isStep1Valid = this.checkStep1Valid();
    const isStep2Valid = this.checkStep2Valid();
    this.setData({
      isStep1Valid,
      isStep2Valid
    });
  },

  // 检查第一步是否有效
  checkStep1Valid() {
    const { gender, age, height, weight } = this.data.formData.basicInfo;
    return gender && age && height && weight;
  },

  // 检查第二步是否有效
  checkStep2Valid() {
    const answers = this.data.formData.quizAnswers;
    return answers.question1 && answers.question2 && answers.question3 && answers.question4;
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

  // 性别选择
  onGenderChange(e) {
    this.setData({
      'formData.basicInfo.gender': e.detail.value
    });
    this.updateValidationStatus();
  },

  // 年龄输入
  onAgeInput(e) {
    this.setData({
      'formData.basicInfo.age': e.detail.value
    });
    this.updateValidationStatus();
  },

  // 身高输入
  onHeightInput(e) {
    this.setData({
      'formData.basicInfo.height': e.detail.value
    });
    this.updateValidationStatus();
  },

  // 体重输入
  onWeightInput(e) {
    this.setData({
      'formData.basicInfo.weight': e.detail.value
    });
    this.updateValidationStatus();
  },

  // 问题回答
  onQuestionChange(e) {
    const question = e.currentTarget.dataset.question;
    const value = e.detail.value;
    this.setData({
      [`formData.quizAnswers.${question}`]: value
    });
    this.updateValidationStatus();
  },

  // 下一步
  nextStep() {
    const { step } = this.data;
    
    if (step === 1 && !this.data.isStep1Valid) {
      wx.showToast({
        title: '请完善基本信息',
        icon: 'none'
      });
      return;
    }
    
    if (step === 2 && !this.data.isStep2Valid) {
      wx.showToast({
        title: '请回答所有问题',
        icon: 'none'
      });
      return;
    }
    
    if (step < 3) {
      this.setData({
        step: step + 1
      });
    }
  },

  // 上一步
  prevStep() {
    const { step } = this.data;
    if (step > 1) {
      this.setData({
        step: step - 1
      });
    }
  },

  // 拍摄照片
  takePicture() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          tongueImage: tempFilePath
        });
        
        // 上传到云存储
        this.uploadImage(tempFilePath);
      },
      fail: (err) => {
        console.error('拍摄失败:', err);
        wx.showToast({
          title: '拍摄失败',
          icon: 'none'
        });
      }
    });
  },

  // 重新拍摄
  retakePicture() {
    this.setData({
      tongueImage: '',
      tongueImageFileID: ''
    });
    this.takePicture();
  },

  // 跳过拍摄
  skipPhoto() {
    this.setData({
      tongueImage: '',
      tongueImageFileID: ''
    });
  },

  // 上传图片 - 增强版本，支持重试和更好的错误处理
  async uploadImage(filePath, retryCount = 0) {
    const maxRetries = 3;
    const fileName = `tongue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    
    if (retryCount === 0) {
      wx.showLoading({
        title: '上传中...'
      });
    } else {
      wx.showLoading({
        title: `重试中 (${retryCount}/${maxRetries})...`
      });
    }

    try {
      const uploadPromise = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: `tongue-images/${fileName}`,
          filePath: filePath,
          config: {
            env: 'cloud1-6gg9zh5k6f75e020',
            timeout: 30000  // 30秒超时
          },
          success: resolve,
          fail: reject
        });
      });

      // 添加超时保护
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('上传超时')), 35000);
      });

      const res = await Promise.race([uploadPromise, timeoutPromise]);
      
      console.log('图片上传成功:', res.fileID);
      this.setData({
        tongueImageFileID: res.fileID
      });
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });

    } catch (err) {
      console.error(`图片上传失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, err);
      
      // 判断是否需要重试
      const isNetworkError = err.message && (
        err.message.includes('network') || 
        err.message.includes('socket') || 
        err.message.includes('TLS') ||
        err.message.includes('timeout') ||
        err.message.includes('disconnected')
      );

      if (retryCount < maxRetries && isNetworkError) {
        wx.hideLoading();
        console.log(`网络错误，${2000 * (retryCount + 1)}ms后重试...`);
        
        // 显示重试提示
        wx.showToast({
          title: `网络不稳定，正在重试...`,
          icon: 'loading',
          duration: 2000
        });

        // 延迟重试，每次延迟时间递增
        setTimeout(() => {
          this.uploadImage(filePath, retryCount + 1);
        }, 2000 * (retryCount + 1));
        
      } else {
        // 最终失败
        wx.hideLoading();
        
        let errorMsg = '上传失败';
        if (err.message && err.message.includes('network')) {
          errorMsg = '网络连接不稳定，请检查网络后重试';
        } else if (err.message && err.message.includes('timeout')) {
          errorMsg = '上传超时，请重试';
        } else if (err.message && err.message.includes('TLS')) {
          errorMsg = '网络安全连接失败，请重试';
        }

        wx.showModal({
          title: '上传失败',
          content: `${errorMsg}\n\n您可以：\n1. 检查网络连接\n2. 重新拍摄舌头照片\n3. 或选择跳过拍摄继续诊断`,
          showCancel: true,
          cancelText: '重新拍摄',
          confirmText: '跳过拍摄',
          success: (res) => {
            if (res.cancel) {
              // 重新拍摄
              this.retakePicture();
            } else {
              // 跳过拍摄
              this.skipPhoto();
            }
          }
        });
      }
    }
  },

  // 提交评估
  async submitAssessment() {
    if (this.data.isSubmitting) return;
    
    this.setData({
      isSubmitting: true,
      showLoading: true,
      loadingText: '正在生成针对性问题...'
    });

    try {
      // 第一步：生成AI澄清问题
      const questionsResult = await this.generateAIQuestions();
      
      if (questionsResult && questionsResult.questions && questionsResult.questions.length > 0) {
        // 有AI问题，跳转到AI问题页面
        wx.navigateTo({
          url: `/pages/ai-questions/index?formData=${encodeURIComponent(JSON.stringify(this.data.formData))}&tongueImageFileID=${this.data.tongueImageFileID}&aiQuestions=${encodeURIComponent(JSON.stringify(questionsResult.questions))}`
        });
      } else {
        // 没有AI问题或生成失败，直接进行分析
        this.setData({
          loadingText: '正在进行健康分析...'
        });
        
        const analysisResult = await this.performAnalysis();
        this.handleAnalysisResult(analysisResult);
      }
    } catch (error) {
      console.error('提交失败:', error);
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({
        isSubmitting: false,
        showLoading: false
      });
    }
  },

  // 生成AI问题
  generateAIQuestions() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'generate-questions',
        data: {
          formData: this.data.formData,
          tongueImageFileID: this.data.tongueImageFileID
        },
        config: {
          env: 'cloud1-6gg9zh5k6f75e020',
          timeout: 30000  // 增加超时时间为30秒
        },
        success: (res) => {
          console.log('AI问题生成结果:', res);
          if (res.result.success) {
            resolve(res.result);
          } else {
            console.error('AI问题生成失败:', res.result.error);
            resolve(null); // 失败时返回null，会直接进行分析
          }
        },
        fail: (err) => {
          console.error('调用generate-questions失败:', err);
          resolve(null); // 失败时返回null，会直接进行分析
        }
      });
    });
  },

  // 执行分析
  performAnalysis(aiQuestions = null, aiAnswers = null) {
    return new Promise((resolve, reject) => {
      const analysisData = {
        formData: { ...this.data.formData },
        imageUrl: this.data.tongueImageFileID
      };

      // 如果有AI问题和答案，添加到分析数据中
      if (aiQuestions && aiAnswers) {
        analysisData.formData.aiQuestions = aiQuestions;
        analysisData.formData.aiAnswers = aiAnswers;
      }

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
  },

  // 处理分析结果
  handleAnalysisResult(result) {
    if (result.success) {
      // 跳转到结果页面
      wx.navigateTo({
        url: `/pages/result/index?result=${encodeURIComponent(JSON.stringify(result.data))}&recordId=${result.recordId || ''}`
      });
    } else {
      wx.showToast({
        title: result.error || '分析失败',
        icon: 'none'
      });
    }
  }
});