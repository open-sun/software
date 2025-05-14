#!/bin/bash

# ==============================
# Start Frontend and Backend in Parallel with Virtual Environment Activation
# ==============================

# 项目根目录
ROOT_DIR=$(pwd)

# 前端目录
FRONTEND_DIR="${ROOT_DIR}/frontend"

# 后端目录
BACKEND_DIR="${ROOT_DIR}/backend"
VENV_DIR="${BACKEND_DIR}/.venv"

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
  npm start &
  FRONTEND_PID=$!
  echo "前端进程 PID: $FRONTEND_PID"
}

# 后端启动函数
start_backend() {
  echo "========== 启动后端 =========="
  cd $BACKEND_DIR

  # 检查虚拟环境
  if [ ! -d "$VENV_DIR" ]; then
    echo "未找到虚拟环境：$VENV_DIR，请先创建虚拟环境并安装依赖。"
    echo "示例：cd $BACKEND_DIR && $PYTHON_CMD -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
  fi

  # 激活虚拟环境
  echo "激活虚拟环境：$VENV_DIR"
  source .venv/bin/activate

  # 检查 app.py 是否存在
  if [ ! -f "app.py" ]; then
    echo "后端启动文件 app.py 未找到，请检查路径。"
    deactivate
    exit 1
  fi

  # 启动后端
  echo "启动后端：$PYTHON_CMD app.py"
  $PYTHON_CMD app.py &
  BACKEND_PID=$!
  echo "后端进程 PID: $BACKEND_PID"

  # 退出虚拟环境
  deactivate
}

# 捕获 Ctrl + C 信号，确保前后端进程都能被终止
cleanup() {
  echo "检测到中断信号，停止所有进程..."
  if [ -n "$FRONTEND_PID" ]; then
    kill -9 $FRONTEND_PID 2>/dev/null
    echo "已终止前端进程：$FRONTEND_PID"
  fi
  if [ -n "$BACKEND_PID" ]; then
    kill -9 $BACKEND_PID 2>/dev/null
    echo "已终止后端进程：$BACKEND_PID"
  fi
  exit 0
}

trap cleanup SIGINT

# 启动前端和后端
start_frontend
start_backend

# 等待前后端进程
wait $FRONTEND_PID
wait $BACKEND_PID

echo "========== 项目启动完成 =========="
echo "前端：http://localhost:3000"
echo "后端：http://127.0.0.1:5000"
