#!/bin/bash

# 部署健康档案和API统计修复
echo "🚀 部署健康档案和API统计修复..."

ENV_ID="cloud1-6gg9zh5k6f75e020"
PROJECT_PATH="/Users/joan/WeChatProjects/zhijilu1"
CLI_PATH="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

echo "📦 部署修复后的analyze云函数（API统计记录）..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names analyze \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ analyze部署成功"
else
    echo "❌ analyze部署失败"
    exit 1
fi

echo "🎉 健康档案和API统计修复部署完成！"
echo ""
echo "✨ 修复内容："
echo ""
echo "🏥 健康档案修复："
echo "   1. 动态KPI计算 - 基于真实数据计算连续天数、精力水平、记录次数"
echo "   2. 中国时区修复 - 日历显示正确的中国时间"
echo "   3. 智能调试按钮 - 只在有问题时显示刷新和调试按钮"
echo "   4. KPI状态提示 - 显示健康状态的文字描述"
echo ""
echo "📊 API统计修复："
echo "   1. 详细API调用记录 - 记录具体使用的API、成功率、错误原因"
echo "   2. 管理员权限控制 - API统计页面只对管理员可见"
echo "   3. 增强统计信息 - 包括备用分析次数、历史上下文使用等"
echo "   4. 实时数据展示 - 基于数据库中的真实apiCallInfo数据"
echo ""
echo "📝 KPI计算逻辑说明："
echo "   • 连续记录天数: 从今天往前计算连续有记录的天数"
echo "   • 平均精力水平: 基于问卷中'精力状态'问题的平均分（满分10分）"
echo "   • 本月记录次数: 当月提交的健康记录总数"
echo ""
echo "🔒 管理员设置："
echo "   请在 /pages/api-stats/index.js 第32行修改管理员openid列表"
echo "   替换 'your-admin-openid-here' 为实际的管理员微信openid"
echo ""
echo "🧪 测试建议："
echo "   1. 查看健康档案页面KPI是否显示真实数据"
echo "   2. 检查日历时间是否为中国时区"
echo "   3. 确认调试按钮只在有问题时显示"
echo "   4. 验证API统计页面的管理员权限控制"