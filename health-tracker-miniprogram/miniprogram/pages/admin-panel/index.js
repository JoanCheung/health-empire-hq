// 管理员控制面板页面
Page({
  data: {
    adminInfo: null,
    admins: [],
    loading: true,
    showAddModal: false,
    newAdmin: {
      name: '',
      role: 'moderator',
      notes: ''
    },
    roleOptions: [
      { value: 'super_admin', label: '超级管理员', desc: '拥有所有权限' },
      { value: 'admin', label: '管理员', desc: '拥有大部分管理权限' },
      { value: 'moderator', label: '版主', desc: '拥有基本管理权限' }
    ],
    selectedRole: 0,
    stats: {
      totalAdmins: 0,
      activeAdmins: 0,
      roleDistribution: {}
    }
  },

  onLoad() {
    // 检查超级管理员权限
    this.checkSuperAdminAccess();
  },

  /**
   * 检查超级管理员权限
   */
  async checkSuperAdminAccess() {
    try {
      wx.showLoading({ title: '验证权限中...' });
      
      const permissionResult = await wx.cloud.callFunction({
        name: 'checkAdminPermission',
        data: {
          requiredRole: 'super_admin' // 管理员面板需要超级管理员权限
        }
      });

      wx.hideLoading();

      console.log('超级管理员权限检查结果:', permissionResult);

      if (!permissionResult.result || !permissionResult.result.success) {
        this.showErrorAndGoBack('权限检查失败', permissionResult.result?.error || '无法验证权限');
        return;
      }

      if (!permissionResult.result.isAdmin || !permissionResult.result.hasPermission) {
        this.showErrorAndGoBack('访问受限', '此页面仅供超级管理员使用');
        return;
      }

      // 权限验证通过
      this.setData({
        adminInfo: permissionResult.result.adminInfo
      });

      // 加载管理员列表
      this.loadAdminList();
      
    } catch (error) {
      wx.hideLoading();
      console.error('权限检查失败:', error);
      this.showErrorAndGoBack('权限验证异常', '权限验证过程中出现错误，请稍后重试');
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
   * 加载管理员列表
   */
  async loadAdminList() {
    try {
      this.setData({ loading: true });

      const result = await wx.cloud.callFunction({
        name: 'manageAdmins',
        data: {
          action: 'list'
        }
      });

      if (result.result && result.result.success) {
        const admins = result.result.admins || [];
        
        // 计算统计信息
        const stats = this.calculateStats(admins);
        
        this.setData({
          admins: admins,
          stats: stats,
          loading: false
        });

        console.log('管理员列表加载成功, 共', admins.length, '人');
      } else {
        throw new Error(result.result?.error || '加载管理员列表失败');
      }
    } catch (error) {
      console.error('加载管理员列表失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  /**
   * 计算统计信息
   */
  calculateStats(admins) {
    const stats = {
      totalAdmins: admins.length,
      activeAdmins: admins.length,
      roleDistribution: {}
    };

    admins.forEach(admin => {
      const role = admin.role;
      stats.roleDistribution[role] = (stats.roleDistribution[role] || 0) + 1;
    });

    return stats;
  },

  /**
   * 显示添加管理员模态框
   */
  showAddAdminModal() {
    this.setData({
      showAddModal: true,
      newAdmin: {
        name: '',
        role: 'moderator',
        notes: ''
      },
      selectedRole: 2 // 默认选择版主
    });
  },

  /**
   * 隐藏添加管理员模态框
   */
  hideAddAdminModal() {
    this.setData({
      showAddModal: false
    });
  },

  /**
   * 处理表单输入
   */
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`newAdmin.${field}`]: value
    });
  },

  /**
   * 角色选择变化
   */
  handleRoleChange(e) {
    const selectedIndex = parseInt(e.detail.value);
    const selectedRole = this.data.roleOptions[selectedIndex];
    
    this.setData({
      selectedRole: selectedIndex,
      'newAdmin.role': selectedRole.value
    });
  },

  /**
   * 添加管理员
   */
  async addAdmin() {
    const { newAdmin } = this.data;
    
    if (!newAdmin.name.trim()) {
      wx.showToast({
        title: '请输入管理员姓名',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '添加中...' });

      const result = await wx.cloud.callFunction({
        name: 'manageAdmins',
        data: {
          action: 'add',
          targetOpenid: 'manual-' + Date.now(), // 临时ID，实际使用时需要获取真实openid
          adminData: newAdmin
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        
        this.hideAddAdminModal();
        this.loadAdminList(); // 重新加载列表
      } else {
        throw new Error(result.result?.error || '添加失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('添加管理员失败:', error);
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      });
    }
  },

  /**
   * 移除管理员
   */
  async removeAdmin(e) {
    const { admin } = e.currentTarget.dataset;
    
    const confirmResult = await this.showConfirmModal(
      '确认移除管理员',
      `确定要移除管理员 ${admin.name} 吗？`
    );

    if (!confirmResult) return;

    try {
      wx.showLoading({ title: '移除中...' });

      // 这里需要真实的openid，当前使用id作为临时方案
      const result = await wx.cloud.callFunction({
        name: 'manageAdmins',
        data: {
          action: 'remove',
          targetOpenid: admin.openid
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        wx.showToast({
          title: '移除成功',
          icon: 'success'
        });
        
        this.loadAdminList(); // 重新加载列表
      } else {
        throw new Error(result.result?.error || '移除失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('移除管理员失败:', error);
      wx.showToast({
        title: error.message || '移除失败',
        icon: 'none'
      });
    }
  },

  /**
   * 显示确认对话框
   */
  showConfirmModal(title, content) {
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
   * 刷新管理员列表
   */
  refreshList() {
    this.loadAdminList();
  },

  /**
   * 跳转到API统计
   */
  goToAPIStats() {
    wx.navigateTo({
      url: '/pages/api-stats/index'
    });
  },

  /**
   * 初始化超级管理员（开发时使用）
   */
  async initSuperAdmin() {
    const confirmResult = await this.showConfirmModal(
      '初始化超级管理员',
      '这将创建系统的第一个超级管理员，确定继续吗？'
    );

    if (!confirmResult) return;

    try {
      wx.showLoading({ title: '初始化中...' });

      const result = await wx.cloud.callFunction({
        name: 'manageAdmins',
        data: {
          action: 'init'
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        wx.showToast({
          title: '初始化成功',
          icon: 'success'
        });
        
        this.loadAdminList();
      } else {
        throw new Error(result.result?.error || '初始化失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('初始化超级管理员失败:', error);
      wx.showToast({
        title: error.message || '初始化失败',
        icon: 'none'
      });
    }
  }
});