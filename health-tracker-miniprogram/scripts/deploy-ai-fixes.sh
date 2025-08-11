#!/bin/bash

# Deploy AI澄清问题重复修复
echo "🚀 部署AI澄清问题重复修复..."

ENV_ID="cloud1-6gg9zh5k6f75e020"
PROJECT_PATH="/Users/joan/WeChatProjects/zhijilu1"
CLI_PATH="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

echo "📦 部署修复后的generate-questions云函数..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names generate-questions \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ generate-questions部署成功"
else
    echo "❌ generate-questions部署失败"
    exit 1
fi

echo "📦 部署修复后的analyze云函数..."
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

echo "🎉 AI澄清问题重复修复部署完成！"
echo ""
echo "✨ 修复内容："
echo "   1. generate-questions现在基于完整的15个问题生成非重复的澄清问题"
echo "   2. AI会基于舌象和全面问卷内容生成深度、个性化问题"
echo "   3. 修复了历史上下文获取问题，提供更准确的个性化分析"
echo "   4. 澄清问题答案会正确保存到数据库用于最终分析"
echo ""
echo "🧪 建议测试："
echo "   1. 完成完整的15题问卷"
echo "   2. 拍摄舌头照片"
echo "   3. 检查AI澄清问题是否与前15题不重复"
echo "   4. 确认澄清问题答案被正确保存到最终分析结果中"