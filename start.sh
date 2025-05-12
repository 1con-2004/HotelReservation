#!/bin/bash

# 创建数据库
echo "正在创建数据库..."
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS hotel"

# 启动后端服务
echo "启动后端服务..."
cd backend
yarn install
yarn dev &
BACKEND_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 5

# 测试登录接口
echo "测试登录接口..."
cd ..
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin", "password":"admin123"}' --noproxy '*'

# 启动前端
echo "启动前端..."
cd frontend
yarn install
yarn dev &
FRONTEND_PID=$!

echo "项目已启动"
echo "后端运行在 http://localhost:3000"
echo "前端运行在 http://localhost:5173"
echo "按 Ctrl+C 停止服务"

# 等待用户按下Ctrl+C
wait $BACKEND_PID
kill $FRONTEND_PID 