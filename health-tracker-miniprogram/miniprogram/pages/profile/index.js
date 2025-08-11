Page({
  data: {
    currentYear: 2024,
    currentMonth: 1,
    calendarDays: [],
    records: [],
    selectedRecord: null,
    selectedDate: '',
    debugInfo: {},
    kpis: {
      consecutiveDays: 0,
      averageEnergyLevel: 0,
      monthlyRecords: 0
    },
    showDebugButtons: false // 是否显示调试按钮
  },

  onLoad() {
    console.log('Profile页面加载');
    this.initializeCalendar();
  },

  onShow() {
    console.log('Profile页面显示，开始获取记录');
    this.getRecords();
  },

  // 初始化日历 - 使用中国时区
  initializeCalendar() {
    // 获取中国时间（UTC+8）
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 强制UTC+8
    
    console.log('当前UTC时间:', now.toISOString());
    console.log('中国时间:', chinaTime.toISOString());
    
    this.setData({
      currentYear: chinaTime.getFullYear(),
      currentMonth: chinaTime.getMonth() + 1
    });
    
    this.generateCalendarDays();
  },

  // 获取健康记录 - 增强调试版本
  async getRecords() {
    console.log('=== 🔍 开始调试健康记录获取 ===');
    
    try {
      wx.showLoading({
        title: '调试加载中...'
      });

      // 1. 检查云开发初始化状态
      console.log('1. 检查云开发状态...');
      if (!wx.cloud) {
        throw new Error('云开发未初始化');
      }

      // 2. 调用云函数
      console.log('2. 调用getRecords云函数...');
      const result = await wx.cloud.callFunction({
        name: 'getRecords',
        config: {
          env: 'cloud1-6gg9zh5k6f75e020',  // 强制使用云端环境
          timeout: 15000  // getRecords 15秒超时
        }
      });

      // 3. 详细分析返回结果
      console.log('3. 云函数返回分析:');
      console.log('- 完整result对象:', result);
      console.log('- result.result:', result.result);
      console.log('- 成功标志:', result.result ? result.result.success : 'undefined');
      console.log('- 数据:', result.result ? result.result.data : 'undefined');
      console.log('- 错误信息:', result.result ? result.result.error : 'undefined');

      if (result.result && result.result.success) {
        console.log('✅ 云函数调用成功!');
        
        const records = result.result.data || [];
        console.log('4. 数据处理:');
        console.log('- 原始记录数量:', records.length);
        
        if (records.length > 0) {
          console.log('- 第一条记录结构:', Object.keys(records[0]));
          console.log('- 第一条记录内容:', records[0]);
          console.log('- 日期字段检查:', {
            date: records[0].date,
            fullDate: records[0].fullDate,
            createTime: records[0].createTime
          });
        }

        // 计算KPI统计数据
        const kpis = this.calculateKPIs(records);
        
        // 检查是否有错误或问题需要显示调试按钮
        const hasIssues = records.length === 0 || this.checkForIssues(records);
        
        // 设置数据到页面
        this.setData({
          records: records,
          kpis: kpis,
          showDebugButtons: hasIssues,
          debugInfo: {
            lastUpdate: new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'}),
            recordCount: records.length,
            cloudFunctionSuccess: true,
            hasIssues: hasIssues
          }
        });

        console.log('5. 数据已设置到页面, records长度:', this.data.records.length);

        // 重新生成日历
        this.generateCalendarDays();
        console.log('6. 日历已重新生成');

        // 用户提示
        if (records.length > 0) {
          wx.showToast({
            title: `🎉 成功加载${records.length}条记录`,
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '数据库为空，请先完成健康诊断',
            icon: 'none',
            duration: 4000
          });
        }

      } else {
        console.error('❌ 云函数调用失败');
        const errorMsg = result.result ? result.result.error : '未知错误';
        console.error('失败原因:', errorMsg);
        
        this.setData({
          debugInfo: {
            lastUpdate: new Date().toLocaleString(),
            recordCount: 0,
            cloudFunctionSuccess: false,
            error: errorMsg
          }
        });

        wx.showToast({
          title: `获取失败: ${errorMsg}`,
          icon: 'none',
          duration: 4000
        });
      }

    } catch (error) {
      console.error('❌ 异常错误:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        errMsg: error.errMsg
      });

      this.setData({
        debugInfo: {
          lastUpdate: new Date().toLocaleString(),
          recordCount: 0,
          cloudFunctionSuccess: false,
          exception: error.message
        }
      });

      wx.showToast({
        title: `异常: ${error.message}`,
        icon: 'none',
        duration: 4000
      });

    } finally {
      wx.hideLoading();
      console.log('=== 🔍 健康记录获取调试完成 ===');
      console.log('最终页面数据:', {
        recordsCount: this.data.records.length,
        debugInfo: this.data.debugInfo
      });
    }
  },

  // 生成日历天数数据 - 增强调试版本
  generateCalendarDays() {
    console.log('--- 🗓️ 开始生成日历 ---');
    console.log('当前records数量:', this.data.records.length);
    
    const { currentYear, currentMonth, records } = this.data;
    
    // 创建记录日期的快速查找映射
    const recordMap = {};
    records.forEach(record => {
      console.log('处理记录日期:', record.date || record.fullDate);
      const dateKey = record.date || record.fullDate;
      if (dateKey) {
        recordMap[dateKey] = record;
      }
    });
    
    console.log('记录日期映射:', recordMap);
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取当月第一天是星期几
    const firstDayWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    // 添加上月的日期（用于填充）
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonthLastDay = new Date(prevYear, prevMonth, 0).getDate();
    
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const fullDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      calendarDays.push({
        day: day,
        date: day,
        fullDate: fullDate,
        isCurrentMonth: false,
        hasRecord: false,
        isSelected: false,
        uniqueId: `prev-${day}` // 添加唯一ID
      });
    }
    
    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasRecord = !!recordMap[fullDate];
      
      console.log(`日期${fullDate}: 有记录=${hasRecord}`);
      
      calendarDays.push({
        day: day,
        date: day,
        fullDate: fullDate,
        isCurrentMonth: true,
        hasRecord: hasRecord,
        isSelected: false,
        uniqueId: `curr-${day}` // 添加唯一ID
      });
    }
    
    // 添加下月的日期（用于填充到42天）
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      calendarDays.push({
        day: day,
        date: day,
        fullDate: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        hasRecord: false,
        isSelected: false,
        uniqueId: `next-${day}` // 添加唯一ID
      });
    }
    
    console.log('生成的日历天数:', calendarDays.length);
    console.log('有记录的日期数量:', calendarDays.filter(day => day.hasRecord).length);
    
    // 调试日历布局 - 显示前14天
    console.log('=== 日历布局调试 ===');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    console.log('星期:', weekdays.join('  '));
    
    for (let week = 0; week < 2; week++) {
      let weekStr = '';
      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        if (index < calendarDays.length) {
          const dayInfo = calendarDays[index];
          const dayStr = String(dayInfo.day).padStart(2, ' ');
          const monthMarker = dayInfo.isCurrentMonth ? '' : '`';
          weekStr += dayStr + monthMarker + ' ';
        }
      }
      console.log(`第${week + 1}周: ${weekStr}`);
    }
    
    // 专门检查8月1-3日的位置
    for (let d = 1; d <= 3; d++) {
      const targetDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayIndex = calendarDays.findIndex(day => day.fullDate === targetDate && day.isCurrentMonth);
      if (dayIndex !== -1) {
        const weekIndex = Math.floor(dayIndex / 7);
        const dayOfWeek = dayIndex % 7;
        console.log(`${currentMonth}月${d}日位置: 第${weekIndex + 1}周, 星期${weekdays[dayOfWeek]} (索引${dayIndex})`);
      }
    }
    
    this.setData({
      calendarDays: calendarDays
    });
    
    console.log('--- 🗓️ 日历生成完成 ---');
  },

  // 计算KPI统计数据
  calculateKPIs(records) {
    if (!records || records.length === 0) {
      return {
        consecutiveDays: 0,
        averageEnergyLevel: 0,
        monthlyRecords: 0
      };
    }

    // 1. 计算本月记录次数
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const currentMonth = chinaTime.getMonth() + 1;
    const currentYear = chinaTime.getFullYear();
    
    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.createTime);
      return recordDate.getMonth() + 1 === currentMonth && 
             recordDate.getFullYear() === currentYear;
    }).length;

    // 2. 计算连续记录天数
    const sortedRecords = records
      .map(record => ({
        ...record,
        dateOnly: new Date(record.createTime).toISOString().split('T')[0]
      }))
      .sort((a, b) => new Date(b.dateOnly) - new Date(a.dateOnly));

    let consecutiveDays = 0;
    const today = chinaTime.toISOString().split('T')[0];
    
    if (sortedRecords.length > 0) {
      // 去重日期（一天可能有多条记录）
      const uniqueDates = [...new Set(sortedRecords.map(r => r.dateOnly))];
      
      // 从今天开始计算连续天数
      let checkDate = new Date(chinaTime);
      for (const dateStr of uniqueDates) {
        const recordDate = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(recordDate)) {
          consecutiveDays++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 3. 计算平均精力水平
    let averageEnergyLevel = 0;
    const energyRecords = records.filter(record => {
      return record.formData && 
             record.formData.quizAnswers && 
             record.formData.quizAnswers.question7; // 精力状态问题
    });

    if (energyRecords.length > 0) {
      const energyMapping = {
        'energetic': 10,    // 精力充沛
        'good': 7.5,        // 精力较好
        'tired': 5,         // 容易疲劳
        'exhausted': 2.5    // 经常疲惫
      };

      const totalEnergy = energyRecords.reduce((sum, record) => {
        const energyLevel = record.formData.quizAnswers.question7;
        return sum + (energyMapping[energyLevel] || 5);
      }, 0);

      averageEnergyLevel = Math.round((totalEnergy / energyRecords.length) * 10) / 10;
    }

    console.log('KPI计算结果:', {
      consecutiveDays,
      averageEnergyLevel,
      monthlyRecords,
      totalRecords: records.length
    });

    return {
      consecutiveDays,
      averageEnergyLevel,
      monthlyRecords
    };
  },

  // 检查是否有问题需要显示调试按钮
  checkForIssues(records) {
    // 1. 检查是否有分析失败的记录
    const hasFailedAnalysis = records.some(record => 
      record.analysis && record.analysis.isOfflineAnalysis
    );

    // 2. 检查是否有数据不完整的记录
    const hasIncompleteData = records.some(record => 
      !record.formData || !record.analysis
    );

    // 3. 检查是否有API调用失败的记录
    const hasAPIFailures = records.some(record => 
      record.apiSource === 'backup' || 
      (record.analysis && record.analysis.note && record.analysis.note.includes('备用'))
    );

    console.log('问题检测结果:', {
      hasFailedAnalysis,
      hasIncompleteData,
      hasAPIFailures
    });

    return hasFailedAnalysis || hasIncompleteData || hasAPIFailures;
  },

  // 格式化记录用于显示
  formatRecordForDisplay(record) {
    const formattedRecord = { ...record };
    
    // 格式化创建时间为中国时区
    if (record.createTime) {
      const createTime = new Date(record.createTime);
      
      // 转换为中国时区显示
      const chinaTime = new Date(createTime.getTime() + (8 * 60 * 60 * 1000));
      
      formattedRecord.date = chinaTime.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      
      formattedRecord.time = chinaTime.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      console.log('时间格式化结果:', {
        原始时间: record.createTime,
        UTC时间: createTime.toISOString(),
        中国时间: chinaTime.toISOString(),
        显示日期: formattedRecord.date,
        显示时间: formattedRecord.time
      });
    }

    // 从分析结果中提取健康数据用于显示
    if (record.analysis) {
      formattedRecord.healthScore = record.analysis.healthScore;
      formattedRecord.bmi = record.analysis.bmi;
      formattedRecord.bmiStatus = record.analysis.bmiStatus;
      formattedRecord.constitution = record.analysis.tcmConstitution;
      formattedRecord.overallAssessment = record.analysis.overallAssessment;
      
      // 从基本信息中提取数据
      if (record.formData && record.formData.basicInfo) {
        formattedRecord.weight = record.formData.basicInfo.weight;
        formattedRecord.height = record.formData.basicInfo.height;
        formattedRecord.age = record.formData.basicInfo.age;
        formattedRecord.gender = record.formData.basicInfo.gender === 'male' ? '男' : '女';
      }
      
      // 生成简单的备注信息
      if (record.analysis.riskFactors && record.analysis.riskFactors.length > 0) {
        formattedRecord.notes = `主要风险因素: ${record.analysis.riskFactors.join(', ')}`;
      }
    }

    return formattedRecord;
  },

  // 处理日期点击
  handleDateClick(e) {
    const { date, fullDate } = e.currentTarget.dataset;
    console.log('点击日期:', fullDate);
    
    const record = this.data.records.find(r => 
      r.date === fullDate || r.fullDate === fullDate
    );
    
    console.log('找到的记录:', record);
    
    if (record) {
      // 格式化记录时间为中国时区
      const formattedRecord = this.formatRecordForDisplay(record);
      
      this.setData({
        selectedRecord: formattedRecord,
        selectedDate: fullDate
      });
    } else {
      this.setData({
        selectedRecord: null,
        selectedDate: fullDate
      });
    }
  },

  // 月份导航
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
    this.setData({
      currentYear,
      currentMonth
    });
    this.generateCalendarDays();
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
    this.setData({
      currentYear,
      currentMonth
    });
    this.generateCalendarDays();
  },

  // 跳转到健康评估页面
  goToAssessment() {
    wx.navigateTo({
      url: '/pages/quiz/index'
    });
  },

  // 数据库调试功能
  async goToDebug() {
    wx.showLoading({ title: '正在检查数据库...' });
    
    try {
      // 获取当前数据库状态
      const result = await wx.cloud.callFunction({
        name: 'getRecords',
        data: {}
      });

      console.log('数据库调试结果:', result);
      wx.hideLoading();

      if (result.result && result.result.success) {
        const records = result.result.data || [];
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r => r.date === today);
        
        // 统计信息
        const stats = {
          total: records.length,
          dates: [...new Set(records.map(r => r.date))].sort(),
          apiSources: records.reduce((acc, r) => {
            const api = r.analysis?.apiSource || 'unknown';
            acc[api] = (acc[api] || 0) + 1;
            return acc;
          }, {}),
          latest: records[0]?.date || '无',
          oldest: records[records.length - 1]?.date || '无'
        };

        const debugInfo = [
          `📊 数据库统计:`,
          `• 总记录数: ${stats.total}`,
          `• 记录日期: ${stats.dates.join(', ')}`,
          `• 最新记录: ${stats.latest}`, 
          `• 最旧记录: ${stats.oldest}`,
          `• 今天(${today})记录: ${todayRecords.length}条`,
          '',
          `🤖 API使用统计:`,
          ...Object.entries(stats.apiSources).map(([api, count]) => `• ${api}: ${count}次`),
          '',
          `💡 问题诊断:`,
          todayRecords.length === 0 ? 
            `❌ 今天没有数据 - 可能analyze云函数保存失败` :
            `✅ 今天有${todayRecords.length}条数据`
        ].join('\n');

        wx.showModal({
          title: '🔍 数据库调试信息',
          content: debugInfo,
          showCancel: true,
          cancelText: '测试保存',
          confirmText: '确定',
          success: (res) => {
            if (res.cancel) {
              // 测试保存功能
              this.testSaveRecord();
            }
          }
        });

      } else {
        wx.showModal({
          title: '❌ 调试失败',
          content: `获取数据库信息失败: ${result.result?.error || '未知错误'}`,
          showCancel: false
        });
      }

    } catch (error) {
      wx.hideLoading();
      console.error('调试失败:', error);
      wx.showModal({
        title: '❌ 调试异常',
        content: `调试过程出错: ${error.message}`,
        showCancel: false
      });
    }
  },

  // 测试保存记录功能
  async testSaveRecord() {
    wx.showLoading({ title: '测试保存中...' });

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

      wx.hideLoading();
      console.log('测试保存结果:', result);

      if (result.result && result.result.success) {
        wx.showModal({
          title: '✅ 测试成功',
          content: `测试记录保存成功！\n记录ID: ${result.result.recordId}\n这说明当前的数据保存功能正常工作。`,
          showCancel: true,
          cancelText: '刷新数据',
          confirmText: '确定',
          success: (res) => {
            if (res.cancel) {
              this.getRecords(); // 刷新数据
            }
          }
        });
      } else {
        wx.showModal({
          title: '❌ 测试失败',
          content: `测试保存失败: ${result.result?.error || '未知错误'}\n这说明数据保存功能有问题。`,
          showCancel: false
        });
      }

    } catch (error) {
      wx.hideLoading();
      console.error('测试保存失败:', error);
      wx.showModal({
        title: '❌ 测试异常',
        content: `测试过程出错: ${error.message}`,
        showCancel: false
      });
    }
  }
});