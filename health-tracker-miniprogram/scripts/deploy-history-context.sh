#!/bin/bash

echo "🚀 Deploying getHistoryContext cloud function..."

# 使用微信开发者工具命令行工具部署云函数
/Applications/wechatwebdevtools.app/Contents/MacOS/cli -p /Users/joan/WeChatProjects/zhijilu1 --upload-cloud-function getHistoryContext

echo "✅ getHistoryContext function deployed successfully!"