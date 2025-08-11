#!/bin/bash

# 部署用户登录和信息管理系统
echo "🚀 部署用户登录和信息管理系统..."

ENV_ID="cloud1-6gg9zh5k6f75e020"
PROJECT_PATH="/Users/joan/WeChatProjects/zhijilu1"
CLI_PATH="/Applications/wechatwebdevtools.app/Contents/MacOS/cli"

echo "📦 等待云函数创建完成..."
sleep 10

echo "📦 部署getUserProfile云函数..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names getUserProfile \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ getUserProfile部署成功"
else
    echo "❌ getUserProfile部署失败，等待重试..."
    sleep 20
    echo "🔄 重试部署getUserProfile..."
    $CLI_PATH cloud functions deploy \
      --env $ENV_ID \
      --names getUserProfile \
      --project $PROJECT_PATH \
      --remote-npm-install
fi

echo "📦 部署saveUserInfo云函数..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names saveUserInfo \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ saveUserInfo部署成功"
else
    echo "❌ saveUserInfo部署失败，等待重试..."
    sleep 20
    echo "🔄 重试部署saveUserInfo..."
    $CLI_PATH cloud functions deploy \
      --env $ENV_ID \
      --names saveUserInfo \
      --project $PROJECT_PATH \
      --remote-npm-install
fi

echo "📦 部署saveUserProfile云函数..."
$CLI_PATH cloud functions deploy \
  --env $ENV_ID \
  --names saveUserProfile \
  --project $PROJECT_PATH \
  --remote-npm-install

if [ $? -eq 0 ]; then
    echo "✅ saveUserProfile部署成功"
else
    echo "❌ saveUserProfile部署失败，等待重试..."
    sleep 20
    echo "🔄 重试部署saveUserProfile..."
    $CLI_PATH cloud functions deploy \
      --env $ENV_ID \
      --names saveUserProfile \
      --project $PROJECT_PATH \
      --remote-npm-install
fi

echo "🎉 用户登录和信息管理系统部署完成！"
echo ""
echo "✨ 新功能特性："
echo ""
echo "👤 用户登录系统："
echo "   1. 微信授权登录 - 获取用户基本信息（昵称、头像等）"
echo "   2. 自动用户管理 - 新用户创建，老用户更新登录信息"
echo "   3. 登录状态检查 - 页面加载时自动检查登录状态"
echo ""
echo "📝 用户资料管理："
echo "   1. 详细信息收集 - 姓名、年龄、身高体重、职业等"
echo "   2. 健康信息采集 - 既往病史、过敏史、用药情况"
echo "   3. BMI自动计算 - 根据身高体重自动计算BMI指数"
echo "   4. 紧急联系人 - 设置紧急联系人信息"
echo ""
echo "🔐 数据库结构："
echo "   • users集合 - 存储用户基本登录信息"
echo "   • user_profiles集合 - 存储用户详细健康资料"
echo ""
echo "📱 页面功能："
echo "   • 首页登录提示 - 引导用户授权登录"
echo "   • 个人资料页面 - 完善详细健康信息"
echo "   • 资料状态显示 - 显示资料完善程度"
echo ""
echo "🧪 测试建议："
echo "   1. 访问首页，检查登录状态显示"
echo "   2. 点击微信授权登录按钮"
echo "   3. 完善个人资料信息"
echo "   4. 验证资料保存和读取功能"
echo "   5. 检查BMI计算是否正确"
echo ""
echo "📊 云函数说明："
echo "   • getUserProfile - 获取用户详细资料"
echo "   • saveUserInfo - 保存用户基本登录信息"
echo "   • saveUserProfile - 保存用户详细健康资料"