#!/bin/bash

echo "📦 准备部署login云函数..."

# 确保依赖已安装
cd cloudfunctions/login
if [ ! -d "node_modules" ]; then
    echo "安装依赖中..."
    npm install
fi

echo "✅ login云函数准备完成"
echo ""
echo "请在微信开发者工具中："
echo "1. 打开云开发控制台"
echo "2. 进入云函数页面"
echo "3. 右键点击 login 文件夹"
echo "4. 选择'上传并部署：云端安装依赖'"
echo ""
echo "或者启用开发者工具的CLI服务："
echo "1. 开发者工具 -> 设置 -> 安全设置"
echo "2. 开启'服务端口'"
echo "3. 然后运行 ./deploy-functions.sh"