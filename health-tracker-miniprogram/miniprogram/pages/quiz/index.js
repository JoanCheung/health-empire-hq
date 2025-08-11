// Quiz page - Multi-step health assessment questionnaire
Page({
  data: {
    step: 1,
    totalSteps: 4,
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
        question4: '',
        question5: '',
        question6: '',
        question7: '',
        question8: '',
        question9: '',
        question10: '',
        question11: '',
        question12: '',
        question13: '',
        question14: '',
        question15: ''
      },
      questionTexts: {
        question1: '您是否经常感到口干舌燥？',
        question2: '您觉得自己的舌头颜色是？',
        question3: '您觉得自己的舌苔厚度如何？',
        question4: '您的睡眠质量如何？',
        question5: '您的大便性状通常是？',
        question6: '您是否经常感到腹胀？',
        question7: '您的精力状态如何？',
        question8: '您平时是否怕冷？',
        question9: '您的食欲如何？',
        question10: '您的情绪状态如何？',
        question11: '您是否经常感到压力大？',
        question12: '您的运动习惯如何？',
        question13: '您是否经常感到身体某处疼痛？',
        question14: '您的月经周期是否规律？（女性）',
        question15: '您平时主要的不适症状有哪些？'
      }
    },
    // 按步骤组织问题
    questionsStep2: [
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
          { value: 'excellent', label: '很好，睡眠充足，入睡容易' },
          { value: 'good', label: '较好，偶尔失眠或早醒' },
          { value: 'fair', label: '一般，经常失眠，睡眠浅' },
          { value: 'poor', label: '很差，严重失眠，多梦易醒' }
        ]
      }
    ],
    questionsStep3: [
      {
        id: 'question5',
        text: '您的大便性状通常是？',
        category: '消化系统',
        options: [
          { value: 'normal', label: '正常成型，每日1-2次' },
          { value: 'dry', label: '干燥硬结，排便困难' },
          { value: 'loose', label: '软烂不成型，次数较多' },
          { value: 'diarrhea', label: '腹泻，水样便' },
          { value: 'constipation', label: '便秘，2-3天一次或更久' }
        ]
      },
      {
        id: 'question6',
        text: '您是否经常感到腹胀？',
        category: '消化系统', 
        options: [
          { value: 'never', label: '从不，消化很好' },
          { value: 'after-meals', label: '饭后偶尔胀气' },
          { value: 'often', label: '经常胀气，特别是下午' },
          { value: 'severe', label: '严重腹胀，影响食欲' }
        ]
      },
      {
        id: 'question7',
        text: '您的精力状态如何？',
        category: '体能状态',
        options: [
          { value: 'energetic', label: '精力充沛，很少疲劳' },
          { value: 'good', label: '精力较好，偶尔疲劳' },
          { value: 'tired', label: '容易疲劳，需要休息' },
          { value: 'exhausted', label: '经常疲惫，很难恢复' }
        ]
      },
      {
        id: 'question8',
        text: '您平时是否怕冷？',
        category: '体温调节',
        options: [
          { value: 'normal', label: '不怕冷，体温调节正常' },
          { value: 'slightly', label: '稍微怕冷，比别人多穿些' },
          { value: 'very', label: '很怕冷，手脚经常冰凉' },
          { value: 'extreme', label: '极度怕冷，夏天也穿长袖' }
        ]
      },
      {
        id: 'question9',
        text: '您的食欲如何？',
        category: '消化系统',
        options: [
          { value: 'good', label: '食欲良好，定时定量' },
          { value: 'decreased', label: '食欲减退，吃得较少' },
          { value: 'increased', label: '食欲旺盛，容易饥饿' },
          { value: 'irregular', label: '食欲不规律，时好时坏' }
        ]
      }
    ],
    questionsStep4: [
      {
        id: 'question10',
        text: '您的情绪状态如何？',
        category: '精神状态',
        options: [
          { value: 'stable', label: '情绪稳定，心态平和' },
          { value: 'anxious', label: '容易焦虑，担心较多' },
          { value: 'irritable', label: '容易烦躁，脾气急躁' },
          { value: 'depressed', label: '情绪低落，兴趣减退' }
        ]
      },
      {
        id: 'question11',
        text: '您是否经常感到压力大？',
        category: '精神状态',
        options: [
          { value: 'low', label: '压力很小，生活轻松' },
          { value: 'moderate', label: '适中压力，能够应对' },
          { value: 'high', label: '压力较大，经常紧张' },
          { value: 'overwhelming', label: '压力很大，难以承受' }
        ]
      },
      {
        id: 'question12',
        text: '您的运动习惯如何？',
        category: '生活习惯',
        options: [
          { value: 'regular', label: '规律运动，每周3次以上' },
          { value: 'occasional', label: '偶尔运动，不太规律' },
          { value: 'rare', label: '很少运动，主要久坐' },
          { value: 'none', label: '几乎不运动，缺乏锻炼' }
        ]
      },
      {
        id: 'question13',
        text: '您是否经常感到身体某处疼痛？',
        category: '疼痛症状',
        options: [
          { value: 'none', label: '无疼痛，身体舒适' },
          { value: 'head', label: '头痛，特别是太阳穴' },
          { value: 'neck-shoulder', label: '颈肩疼痛，肌肉僵硬' },
          { value: 'back', label: '腰背疼痛，久坐加重' },
          { value: 'joints', label: '关节疼痛，活动受限' }
        ]
      },
      {
        id: 'question14',
        text: '您的月经周期是否规律？（女性回答）',
        category: '女性健康',
        options: [
          { value: 'regular', label: '规律，28-30天周期' },
          { value: 'irregular', label: '不规律，周期不固定' },
          { value: 'delayed', label: '经常延后，周期偏长' },
          { value: 'early', label: '经常提前，周期偏短' },
          { value: 'not-applicable', label: '男性或已绝经' }
        ]
      },
      {
        id: 'question15',
        text: '您平时主要的不适症状有哪些？（可多选）',
        category: '综合症状',
        type: 'multiple',
        options: [
          { value: 'headache', label: '头痛头晕' },
          { value: 'fatigue', label: '乏力疲劳' },
          { value: 'insomnia', label: '失眠多梦' },
          { value: 'appetite', label: '食欲不振' },
          { value: 'cold-limbs', label: '手脚冰凉' },
          { value: 'sweating', label: '容易出汗' },
          { value: 'chest-tight', label: '胸闷气短' },
          { value: 'none', label: '无明显不适' }
        ]
      }
    ],
    tongueImage: '',
    tongueImageFileID: '',
    isSubmitting: false,
    showLoading: false,
    loadingText: '正在分析...',
    isStep1Valid: false,
    isStep2Valid: false,
    isStep3Valid: false,
    isStep4Valid: false,
    
    // AI Questions flow
    aiQuestions: [],
    aiAnswers: {},
    showAIQuestions: false,
    currentAIStep: 0,
    isAIQuestionsCompleted: false
  },

  // 更新验证状态
  updateValidationStatus() {
    const isStep1Valid = this.checkStep1Valid();
    const isStep2Valid = this.checkStep2Valid();
    const isStep3Valid = this.checkStep3Valid();
    const isStep4Valid = this.checkStep4Valid();
    this.setData({
      isStep1Valid,
      isStep2Valid,
      isStep3Valid,
      isStep4Valid
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

  // 检查第三步是否有效
  checkStep3Valid() {
    const answers = this.data.formData.quizAnswers;
    return answers.question5 && answers.question6 && answers.question7 && answers.question8 && answers.question9;
  },

  // 检查第四步是否有效 
  checkStep4Valid() {
    const answers = this.data.formData.quizAnswers;
    // question15 is optional multiple choice, others are required
    return answers.question10 && answers.question11 && answers.question12 && answers.question13 && answers.question14;
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
    
    // 加载用户资料并预填表单
    this.loadUserProfile();
  },

  /**
   * 加载用户资料并预填基本信息
   */
  async loadUserProfile() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: {}
      });

      if (result.result && result.result.success && result.result.profile) {
        const profile = result.result.profile;
        console.log('加载到用户资料，预填表单:', profile);
        
        // 预填基本信息
        this.setData({
          'formData.basicInfo.gender': profile.gender || 'male',
          'formData.basicInfo.age': profile.age ? profile.age.toString() : '',
          'formData.basicInfo.height': profile.height ? profile.height.toString() : '',
          'formData.basicInfo.weight': profile.weight ? profile.weight.toString() : ''
        });
        
        // 更新验证状态
        this.updateValidationStatus();
        
        wx.showToast({
          title: '已加载您的基本信息',
          icon: 'success',
          duration: 2000
        });
      } else {
        console.log('用户资料为空，使用空白表单');
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
      // 加载失败不影响正常使用，静默处理
    }
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
    const questionType = e.currentTarget.dataset.type || 'single';
    
    if (questionType === 'multiple') {
      // 多选题处理
      const currentQuestion = this.getCurrentQuestionById(question);
      const selectedLabels = value.map(index => currentQuestion.options[index].label);
      this.setData({
        [`formData.quizAnswers.${question}`]: selectedLabels.join(', ')
      });
    } else {
      // 单选题处理
      this.setData({
        [`formData.quizAnswers.${question}`]: value
      });
    }
    
    this.updateValidationStatus();
  },

  // 根据ID获取当前问题
  getCurrentQuestionById(questionId) {
    const allQuestions = [...this.data.questionsStep2, ...this.data.questionsStep3, ...this.data.questionsStep4];
    return allQuestions.find(q => q.id === questionId);
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
        title: '请回答所有基础问题',
        icon: 'none'
      });
      return;
    }
    
    if (step === 3 && !this.data.isStep3Valid) {
      wx.showToast({
        title: '请回答所有症状问题',
        icon: 'none'
      });
      return;
    }
    
    if (step < this.data.totalSteps) {
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
      // 先进行基础网络检测
      if (retryCount === 0) {
        console.log('开始网络诊断...');
        console.log('网络类型:', wx.getNetworkType ? await this.getNetworkType() : '无法检测');
        console.log('系统信息:', wx.getSystemInfo ? await this.getSystemInfo() : '无法检测');
      }

      const uploadPromise = new Promise((resolve, reject) => {
        // 尝试不同的配置组合
        const configs = [
          // 配置1: 标准配置
          {
            env: 'cloud1-6gg9zh5k6f75e020',
            timeout: 20000
          },
          // 配置2: 使用默认环境
          {
            timeout: 15000
          },
          // 配置3: 最小配置
          {}
        ];

        const configIndex = Math.min(retryCount, configs.length - 1);
        const currentConfig = configs[configIndex];
        
        console.log(`使用配置${configIndex + 1}:`, currentConfig);

        wx.cloud.uploadFile({
          cloudPath: `tongue-images/${fileName}`,
          filePath: filePath,
          config: currentConfig,
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
          content: `${errorMsg}\n\n这可能是网络环境问题。建议：\n1. 切换WiFi或使用手机流量\n2. 重启微信开发者工具\n3. 或跳过拍摄继续诊断`,
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

  // 网络检测辅助函数
  getNetworkType() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => resolve(res.networkType),
        fail: () => resolve('unknown')
      });
    });
  },

  getSystemInfo() {
    return new Promise((resolve) => {
      wx.getSystemInfo({
        success: (res) => resolve({
          platform: res.platform,
          version: res.version,
          SDKVersion: res.SDKVersion
        }),
        fail: () => resolve({})
      });
    });
  },

  // 提交评估 - 调用生成问题流程
  async handleSubmit() {
    if (this.data.isSubmitting) return;
    
    this.setData({
      isSubmitting: true,
      showLoading: true,
      loadingText: '正在生成个性化澄清问题...'
    });

    try {
      // 第一步：生成AI澄清问题
      const questionsResult = await this.generateAIQuestions();
      
      if (questionsResult && questionsResult.questions && questionsResult.questions.length > 0) {
        // 有AI问题，显示AI问题界面
        this.setData({
          aiQuestions: questionsResult.questions,
          showAIQuestions: true,
          currentAIStep: 0,
          showLoading: false,
          isSubmitting: false
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
      this.setData({
        isSubmitting: false,
        showLoading: false
      });
    }
  },

  // 生成AI问题
  generateAIQuestions() {
    return new Promise((resolve) => {
      // 25秒超时，配合云函数600秒设置
      const localTimeout = setTimeout(() => {
        console.warn('AI问题生成超时，跳过AI问诊环节');
        resolve(null);
      }, 25000);

      wx.cloud.callFunction({
        name: 'generate-questions',
        data: {
          formData: this.data.formData,  
          tongueImageFileID: this.data.tongueImageFileID
        },
        config: {
          env: 'cloud1-6gg9zh5k6f75e020'  // 强制使用云端环境
        },
        success: (res) => {
          clearTimeout(localTimeout);
          console.log('AI问题生成结果:', res);
          if (res.result && res.result.success) {
            resolve(res.result);
          } else {
            console.error('AI问题生成失败:', res.result?.error);
            resolve(null); // 失败时返回null，会直接进行分析
          }
        },
        fail: (err) => {
          clearTimeout(localTimeout);
          console.error('调用generate-questions失败:', err);
          resolve(null); // 失败时返回null，会直接进行分析
        }
      });
    });
  },

  // AI问题回答
  onAIQuestionChange(e) {
    const questionIndex = e.currentTarget.dataset.index;
    const selectedOptions = e.detail.value;
    
    // 将选中的选项转换为答案字符串
    const question = this.data.aiQuestions[questionIndex];
    const selectedLabels = selectedOptions.map(optionIndex => question.options[optionIndex]);
    
    this.setData({
      [`aiAnswers.question${questionIndex}`]: selectedLabels.join(', ')
    });
  },

  // 下一个AI问题
  nextAIQuestion() {
    const { currentAIStep, aiQuestions } = this.data;
    const currentAnswer = this.data.aiAnswers[`question${currentAIStep}`];
    
    if (!currentAnswer) {
      wx.showToast({
        title: '请选择答案',
        icon: 'none'
      });
      return;
    }
    
    if (currentAIStep < aiQuestions.length - 1) {
      this.setData({
        currentAIStep: currentAIStep + 1
      });
    } else {
      // 所有AI问题回答完毕
      this.setData({
        isAIQuestionsCompleted: true
      });
    }
  },

  // 上一个AI问题
  prevAIQuestion() {
    const { currentAIStep } = this.data;
    if (currentAIStep > 0) {
      this.setData({
        currentAIStep: currentAIStep - 1
      });
    }
  },

  // 最终提交 - 包含AI问题答案
  async handleFinalSubmit() {
    if (this.data.isSubmitting) return;
    
    this.setData({
      isSubmitting: true,
      showLoading: true,
      loadingText: '正在进行深度健康分析...'
    });

    try {
      const analysisResult = await this.performAnalysis(this.data.aiQuestions, this.data.aiAnswers);
      this.handleAnalysisResult(analysisResult);
    } catch (error) {
      console.error('最终分析失败:', error);
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
  },

  // 执行分析 (带重试机制)
  async performAnalysis(aiQuestions = null, aiAnswers = null) {
    console.log('🚀 === 开始执行分析 ===');
    console.log('当前formData:', JSON.stringify(this.data.formData, null, 2));
    console.log('tongueImageFileID:', this.data.tongueImageFileID);
    console.log('AI问题:', aiQuestions ? aiQuestions.length : 0);
    console.log('AI答案:', aiAnswers ? Object.keys(aiAnswers) : []);
    
    const analysisData = {
      formData: { ...this.data.formData },
      imageUrl: this.data.tongueImageFileID
    };

    // 如果有AI问题和答案，添加到分析数据中
    if (aiQuestions && aiAnswers) {
      analysisData.formData.aiQuestions = aiQuestions;
      analysisData.formData.aiAnswers = aiAnswers;
      console.log('✅ 已添加AI问题和答案到分析数据');
    }

    console.log('📤 即将发送的分析数据:', JSON.stringify(analysisData, null, 2));

    // 重试机制：最多重试3次
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`尝试第${attempt}次分析...`);
        
        // 更新加载提示
        this.setData({
          loadingText: attempt === 1 ? '正在进行深度健康分析...' : 
                      attempt === 2 ? '重新分析中，请稍候...' : '最后一次尝试中...'
        });

        const result = await this.callAnalyzeFunction(analysisData);
        console.log(`✅ 第${attempt}次分析成功`);
        return result;
        
      } catch (error) {
        console.error(`❌ 第${attempt}次分析失败:`, error);
        
        // 如果是最后一次尝试，直接抛出错误
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 等待2秒后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  },

  // 调用analyze云函数的核心方法
  callAnalyzeFunction(analysisData) {
    return new Promise((resolve, reject) => {
      // 50秒本地超时保护，给AI分析充足时间
      const localTimeout = setTimeout(() => {
        console.warn('AI分析超时，使用备用分析方案');
        resolve(this.generateOfflineAnalysis(analysisData));
      }, 50000);

      wx.cloud.callFunction({
        name: 'analyze',
        data: analysisData,
        config: {
          env: 'cloud1-6gg9zh5k6f75e020'  // 强制使用云端环境
        },
        success: (res) => {
          clearTimeout(localTimeout);
          console.log('✅ analyze云函数调用成功');
          console.log('返回结果:', res);
          if (res.result && res.result.success) {
            resolve(res.result);
          } else {
            console.error('AI分析失败，使用备用分析:', res.result?.error);
            resolve(this.generateOfflineAnalysis(analysisData));
          }
        },
        fail: (err) => {
          clearTimeout(localTimeout);
          console.error('❌ 调用analyze云函数失败，使用备用分析');
          console.error('错误详情:', err);
          // 失败时直接返回离线分析结果
          resolve(this.generateOfflineAnalysis(analysisData));
        }
      });
    });
  },

  // 生成离线分析结果
  generateOfflineAnalysis(analysisData) {
    console.log('📱 使用离线备用分析方案');
    
    const { formData } = analysisData;
    const { basicInfo, quizAnswers } = formData;
    
    // 计算BMI
    const height = basicInfo.height / 100;
    const bmi = basicInfo.weight / (height * height);
    
    // 基于问答答案生成简单的健康评分
    let healthScore = 80;
    
    // 根据舌诊答案调整评分
    if (quizAnswers.question1 === 'always') healthScore -= 10;
    else if (quizAnswers.question1 === 'often') healthScore -= 5;
    
    if (quizAnswers.question2 === 'pale') healthScore -= 8;
    else if (quizAnswers.question2 === 'dark-red') healthScore -= 6;
    
    if (quizAnswers.question4 === 'poor') healthScore -= 15;
    else if (quizAnswers.question4 === 'fair') healthScore -= 8;
    
    // 根据BMI调整评分
    if (bmi < 18.5) healthScore -= 5;
    else if (bmi > 28) healthScore -= 10;
    else if (bmi > 24) healthScore -= 3;
    
    // 确保评分在合理范围内
    healthScore = Math.max(60, Math.min(100, healthScore));
    
    // 生成建议
    const suggestions = [
      '保持规律作息，确保充足睡眠',
      '多饮温水，保持体内水分平衡',
      '适量运动，增强体质',
      '饮食清淡，多食新鲜蔬果',
      '定期体检，关注身体变化'
    ];
    
    // 根据具体问题添加针对性建议
    if (quizAnswers.question1 === 'always' || quizAnswers.question1 === 'often') {
      suggestions.unshift('注意补充水分，避免辛辣食物');
    }
    
    if (quizAnswers.question4 === 'poor' || quizAnswers.question4 === 'fair') {
      suggestions.unshift('改善睡眠环境，建立良好睡眠习惯');
    }
    
    return {
      success: true,
      data: {
        healthScore: healthScore,
        bmi: parseFloat(bmi.toFixed(1)),
        bmiStatus: bmi < 18.5 ? '偏瘦' : bmi > 28 ? '肥胖' : bmi > 24 ? '偏重' : '正常',
        overallAssessment: `基于您提供的基本信息和舌诊问答，您的整体健康状况${healthScore >= 80 ? '良好' : healthScore >= 70 ? '一般' : '需要关注'}。建议您保持良好的生活习惯，关注身体变化。本次分析使用了简化评估方案，建议条件允许时寻求专业医疗建议。`,
        tongueAnalysis: {
          color: this.getTongueColorAnalysis(quizAnswers.question2),
          coating: this.getTongueCoatingAnalysis(quizAnswers.question3),
          overall: '基于问答信息的简化舌诊分析，实际情况需结合专业检查'
        },
        riskFactors: this.generateRiskFactors(quizAnswers, basicInfo),
        suggestions: suggestions.slice(0, 5),
        tcmConstitution: this.getTCMConstitution(quizAnswers),
        seasonalAdvice: '当前季节注意保暖，适当进补，避免过度劳累',
        followUpRecommendations: [
          '建议2-3个月后重新评估',
          '如有不适症状，及时就医'
        ],
        disclaimer: '此分析基于简化算法，仅供参考，不能替代专业医疗诊断',
        isOfflineAnalysis: true
      },
      message: '离线分析完成',
      note: '由于网络问题，使用了离线分析方案'
    };
  },

  // 舌头颜色分析
  getTongueColorAnalysis(color) {
    switch(color) {
      case 'pale': return '舌色偏淡，可能提示气血不足，建议加强营养';
      case 'red': return '舌色偏红，可能有热象，建议清淡饮食';
      case 'dark-red': return '舌色暗红，需要注意调理，建议咨询医生';
      default: return '舌色基本正常，继续保持良好状态';
    }
  },

  // 舌苔分析
  getTongueCoatingAnalysis(coating) {
    switch(coating) {
      case 'thick': return '苔质偏厚，可能有湿浊，建议清淡饮食';
      case 'no-coating': return '无苔或少苔，可能阴液不足，注意滋阴';
      case 'peeling': return '剥脱苔需要关注，建议专业咨询';
      default: return '苔质基本正常';
    }
  },

  // 生成风险因素
  generateRiskFactors(quizAnswers, basicInfo) {
    const risks = [];
    
    if (quizAnswers.question1 === 'always') risks.push('慢性脱水风险');
    if (quizAnswers.question4 === 'poor') risks.push('睡眠质量问题');
    
    const height = basicInfo.height / 100;
    const bmi = basicInfo.weight / (height * height);
    if (bmi > 28) risks.push('肥胖相关健康风险');
    else if (bmi < 18.5) risks.push('营养不良风险');
    
    return risks.length > 0 ? risks : ['暂无明显风险因素'];
  },

  // 中医体质分析
  getTCMConstitution(quizAnswers) {
    if (quizAnswers.question1 === 'always' && quizAnswers.question2 === 'red') {
      return '偏热性体质';
    } else if (quizAnswers.question2 === 'pale' && quizAnswers.question4 === 'poor') {
      return '偏虚弱体质';
    } else {
      return '平和体质';
    }
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