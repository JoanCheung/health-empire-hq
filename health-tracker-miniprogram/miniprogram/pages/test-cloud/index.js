Page({
  data: {
    networkTestResults: null,
    networkTesting: false,
    simpleTestResult: null,
    simpleTesting: false
  },

  // 测试云端analyze函数
  testCloudAnalyze() {
    console.log('🧪 测试云端analyze函数调用');
    
    const testData = {
      formData: {
        basicInfo: {
          gender: "female",
          age: "31",
          height: "155",
          weight: "52.5"
        },
        quizAnswers: {
          question1: "sometimes",
          question2: "pale",
          question3: "thin",
          question4: "good"
        },
        questionTexts: {
          question1: "您是否经常感到口干舌燥？",
          question2: "您觉得自己的舌头颜色是？",
          question3: "您觉得自己的舌苔厚度如何？",
          question4: "您的睡眠质量如何？"
        }
      },
      imageUrl: "test_image_url"
    };

    // 尝试多种方式强制云端调用
    wx.cloud.callFunction({
      name: 'analyze',
      data: testData,
      config: {
        env: 'cloud1-6gg9zh5k6f75e020',
        timeout: 30000  // 测试页面30秒超时
      },
      success: (res) => {
        console.log('✅ 云端调用成功:', res);
        console.log('RequestID:', res.requestID);
        console.log('是否本地:', res.requestID.includes('local_debug'));
      },
      fail: (err) => {
        console.error('❌ 云端调用失败:', err);
      }
    });
  },

  // 测试getRecords
  testGetRecords() {
    console.log('🧪 测试getRecords函数调用');
    
    const startTime = Date.now();
    
    wx.cloud.callFunction({
      name: 'getRecords',
      config: {
        env: 'cloud1-6gg9zh5k6f75e020',
        timeout: 15000  // 15秒超时，看是否会在3秒就失败
      },
      success: (res) => {
        const elapsed = Date.now() - startTime;
        console.log('✅ getRecords调用成功:', res);
        console.log('✅ 客户端耗时:', elapsed, 'ms');
        console.log('记录数量:', res.result ? res.result.data.length : 0);
        
        if (elapsed > 3000) {
          console.log('🎉 好消息！云函数可以运行超过3秒');
          wx.showToast({
            title: `成功！耗时${Math.round(elapsed/1000)}秒`,
            icon: 'success'
          });
        } else {
          console.log('⚠️ 云函数运行时间:', elapsed, 'ms');
        }
      },
      fail: (err) => {
        const elapsed = Date.now() - startTime;
        console.error('❌ getRecords调用失败:', err);
        console.error('❌ 失败耗时:', elapsed, 'ms');
        
        if (err.errMsg && err.errMsg.includes('3 seconds')) {
          console.error('🚨 确认：仍然存在3秒超时限制！');
          wx.showToast({
            title: '确认3秒超时问题',
            icon: 'none',
            duration: 3000
          });
        } else if (elapsed < 4000) {
          console.error('🚨 疑似3秒超时问题，实际耗时:', elapsed, 'ms');
          wx.showToast({
            title: `疑似3秒超时: ${Math.round(elapsed/1000)}秒`,
            icon: 'none',
            duration: 3000
          });
        } else {
          wx.showToast({
            title: '调用失败: ' + (err.errMsg || err.message),
            icon: 'none'
          });
        }
      }
    });
  },

  // 网络连接诊断
  async runNetworkTest() {
    if (this.data.networkTesting) return;
    
    console.log('🔍 开始网络诊断...');
    
    this.setData({
      networkTesting: true,
      networkTestResults: null
    });
    
    wx.showLoading({
      title: '诊断网络连接...'
    });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'network-test',
        config: {
          env: 'cloud1-6gg9zh5k6f75e020',
          timeout: 30000  // 30秒超时
        }
      });
      
      console.log('🔍 网络诊断结果:', result);
      
      if (result.result && result.result.success) {
        this.setData({
          networkTestResults: result.result.results
        });
        
        wx.showToast({
          title: '诊断完成',
          icon: 'success'
        });
        
        // 输出详细诊断结果到控制台
        console.log('=== 网络诊断详细结果 ===');
        result.result.results.tests.forEach((test, index) => {
          console.log(`${index + 1}. ${test.name}: ${test.status}`);
          if (test.details) console.log(`   详情: ${test.details}`);
          if (test.error) console.log(`   错误: ${test.error}`);
        });
        console.log('========================');
        
      } else {
        console.error('网络诊断失败:', result.result ? result.result.error : '未知错误');
        wx.showToast({
          title: '诊断失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('❌ 网络诊断调用失败:', error);
      wx.showToast({
        title: '调用失败: ' + error.message,
        icon: 'none'
      });
    } finally {
      this.setData({
        networkTesting: false
      });
      wx.hideLoading();
    }
  },

  // 超时测试（使用getRecords云函数）
  async runSimpleTest() {
    if (this.data.simpleTesting) return;
    
    console.log('🧪 开始5秒超时测试...');
    
    this.setData({
      simpleTesting: true,
      simpleTestResult: null
    });
    
    wx.showLoading({
      title: '测试5秒延时...'
    });
    
    const startTime = Date.now();
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getRecords',
        data: {
          timeoutTest: 5000  // 测试5秒延时
        },
        config: {
          env: 'cloud1-6gg9zh5k6f75e020',
          timeout: 10000  // 10秒客户端超时
        }
      });
      
      const clientTime = Date.now() - startTime;
      
      console.log('🧪 超时测试结果:', result);
      console.log('🧪 客户端总耗时:', clientTime, 'ms');
      
      if (result.result && result.result.success) {
        console.log('✅ 超时测试成功！云函数可以运行5秒以上');
        console.log('✅ 请求延时:', result.result.requestedDelay, 'ms');
        console.log('✅ 实际延时:', result.result.actualDelay, 'ms');
        console.log('✅ 客户端总耗时:', clientTime, 'ms');
        
        this.setData({
          simpleTestResult: {
            success: true,
            serverTime: result.result.actualDelay,
            clientTime: clientTime,
            message: '云函数可以运行超过3秒！'
          }
        });
        
        wx.showToast({
          title: '测试成功！无3秒限制',
          icon: 'success'
        });
      } else {
        console.error('❌ 超时测试失败:', result.result ? result.result.error : '未知错误');
        wx.showToast({
          title: '测试失败',
          icon: 'none'
        });
      }
    } catch (error) {
      const clientTime = Date.now() - startTime;
      console.error('❌ 超时测试调用失败:', error);
      console.error('❌ 客户端耗时:', clientTime, 'ms');
      
      this.setData({
        simpleTestResult: {
          success: false,
          error: error.message,
          clientTime: clientTime,
          isTimeout: error.message.includes('timeout') || error.message.includes('3 seconds')
        }
      });
      
      if (error.message.includes('3 seconds') || clientTime < 4000) {
        console.error('🚨 确认问题：存在3秒超时限制！');
        console.error('🚨 客户端耗时:', clientTime, 'ms');
        wx.showToast({
          title: `确认3秒超时! ${Math.round(clientTime/1000)}s`,
          icon: 'none',
          duration: 3000
        });
      } else {
        wx.showToast({
          title: '调用失败: ' + error.message,
          icon: 'none'
        });
      }
    } finally {
      this.setData({
        simpleTesting: false
      });
      wx.hideLoading();
    }
  }
});