#!/bin/bash

# WeChat Cloud Functions Deployment Script
# Replace YOUR_ENV_ID with your actual environment ID

ENV_ID="cloud1-6gg9zh5k6f75e020"  # Replace with your actual environment ID
PROJECT_PATH="/Users/joan/WeChatProjects/zhijilu1"
CLI_PATH="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

echo "🚀 Starting cloud functions deployment..."

# Deploy generate-questions function
echo "📦 Deploying generate-questions function..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names generate-questions \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ generate-questions deployed successfully"
else
    echo "❌ generate-questions deployment failed"
    exit 1
fi

# Deploy analyze function
echo "📦 Deploying analyze function..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names analyze \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ analyze deployed successfully"
else
    echo "❌ analyze deployment failed"
    exit 1
fi

# Deploy getRecords function
echo "📦 Deploying getRecords function..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names getRecords \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ getRecords deployed successfully"
else
    echo "❌ getRecords deployment failed"
    exit 1
fi

# Deploy login function
echo "📦 Deploying login function..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names login \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ login deployed successfully"
else
    echo "❌ login deployment failed"
    exit 1
fi

echo "🎉 All cloud functions deployed successfully!"
echo ""
echo "⚠️  IMPORTANT: Don't forget to configure the QWEN_API_KEY environment variable:"
echo "   1. Go to WeChat Developer Tools -> Cloud Development"
echo "   2. Select your environment -> Cloud Functions"
echo "   3. Click on each function (generate-questions, analyze)"
echo "   4. Go to Environment Variables tab"
echo "   5. Add: QWEN_API_KEY = your_qwen_api_key"
echo ""
echo "📋 To get your Qwen API key:"
echo "   1. Visit https://dashscope.aliyun.com/"
echo "   2. Sign up/login with your Alibaba Cloud account"
echo "   3. Go to API Key management"
echo "   4. Create a new API key"
echo "   5. Copy the key and use it as QWEN_API_KEY value"