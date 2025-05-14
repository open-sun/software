#!/bin/bash

# ==============================
# Start Frontend and Backend in Foreground
# ==============================

# 项目根目录
ROOT_DIR=$(pwd)

# 前端目录
FRONTEND_DIR="${ROOT_DIR}/frontend"

# 后端目录
BACKEND_DIR="${ROOT_DIR}/backend"

# 检查可用的 Python 命令
if command -v python3 &> /dev/null; then
  PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
  PYTHON_CMD="python"
else
  echo "未找到 Python 环境，请确保 Python 已正确安装并配置 PATH。"
  exit 1
fi

echo "使用 Python 命令：$PYTHON_CMD"

# 前端启动函数
start_frontend() {
  echo "========== 启动前端 =========="
  cd $FRONTEND_DIR

  # 检查 package.json 是否更新或 node_modules 是否缺失
  if [ ! -d "node_modules" ] || [ "$(find . -name package.json -newer node_modules)" ]; then
    echo "检测到 package.json 变动或 node_modules 缺失，执行 npm install..."
    npm install
  else
    echo "依赖已安装，跳过 npm install。"
  fi

  # 启动前端
  echo "启动前端：npm start"
  npm start
}

# 后端启动函数
start_backend() {
  echo "========== 启动后端 =========="
  cd $BACKEND_DIR

  # 检查 app.py 是否存在
  if [ ! -f "app.py" ]; then
    echo "后端启动文件 app.py 未找到，请检查路径。"
    exit 1
  fi

  # 启动后端
  echo "启动后端：$PYTHON_CMD app.py"
  $PYTHON_CMD app.py
}

# 捕获 Ctrl + C 信号，确保前后端进程都能被终止
trap "echo '检测到中断信号，停止所有进程...'; exit" SIGINT

# 启动前端和后端，顺序执行，前端结束后再启动后端
start_frontend
start_backend

echo "========== 项目启动完成 =========="
echo "前端：http://localhost:3000"
echo "后端：http://127.0.0.1:5000"
