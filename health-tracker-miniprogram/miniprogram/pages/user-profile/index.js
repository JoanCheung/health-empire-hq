// 用户个人信息完善页面
Page({
  data: {
    profileForm: {
      name: '',
      age: '',
      gender: 'male',
      height: '',
      weight: '',
      phone: '',
      occupation: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      healthGoals: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    loading: false,
    isEditing: false
  },

  onLoad() {
    // 获取现有的用户资料
    this.getUserProfile();
  },

  /**
   * 获取用户资料
   */
  async getUserProfile() {
    try {
      wx.showLoading({ title: '加载中...' });

      const result = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: {}
      });

      if (result.result && result.result.success && result.result.profile) {
        // 有现有资料，填充表单
        const profile = result.result.profile;
        this.setData({
          profileForm: {
            name: profile.name || '',
            age: profile.age || '',
            gender: profile.gender || 'male',
            height: profile.height || '',
            weight: profile.weight || '',
            phone: profile.phone || '',
            occupation: profile.occupation || '',
            medicalHistory: profile.medicalHistory || '',
            allergies: profile.allergies || '',
            currentMedications: profile.currentMedications || '',
            healthGoals: profile.healthGoals || '',
            emergencyContact: profile.emergencyContact || '',
            emergencyPhone: profile.emergencyPhone || ''
          },
          isEditing: true
        });

        wx.setNavigationBarTitle({
          title: '编辑个人资料'
        });
      } else {
        // 新用户，创建资料
        wx.setNavigationBarTitle({
          title: '完善个人资料'
        });
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
      wx.showToast({
        title: '获取资料失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 处理表单输入
   */
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`profileForm.${field}`]: value
    });
  },

  /**
   * 处理性别选择
   */
  handleGenderChange(e) {
    this.setData({
      'profileForm.gender': e.detail.value
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { profileForm } = this.data;
    
    if (!profileForm.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return false;
    }
    
    if (!profileForm.age || profileForm.age < 1 || profileForm.age > 150) {
      wx.showToast({
        title: '请输入有效年龄',
        icon: 'none'
      });
      return false;
    }
    
    if (!profileForm.height || profileForm.height < 50 || profileForm.height > 250) {
      wx.showToast({
        title: '请输入有效身高',
        icon: 'none'
      });
      return false;
    }
    
    if (!profileForm.weight || profileForm.weight < 20 || profileForm.weight > 300) {
      wx.showToast({
        title: '请输入有效体重',
        icon: 'none'
      });
      return false;
    }
    
    if (profileForm.phone && !/^1[3-9]\d{9}$/.test(profileForm.phone)) {
      wx.showToast({
        title: '请输入有效手机号',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  /**
   * 保存用户资料
   */
  async saveProfile() {
    if (!this.validateForm()) {
      return;
    }

    try {
      this.setData({ loading: true });
      wx.showLoading({ title: '保存中...' });

      const result = await wx.cloud.callFunction({
        name: 'saveUserProfile',
        data: {
          profile: this.data.profileForm
        }
      });

      if (result.result && result.result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });

        // 延迟返回主页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error(result.result?.error || '保存失败');
      }
    } catch (error) {
      console.error('保存用户资料失败:', error);
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  /**
   * 跳过完善资料
   */
  skipProfile() {
    wx.showModal({
      title: '确认跳过？',
      content: '跳过完善资料将影响健康分析的准确性，建议完善后使用',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});