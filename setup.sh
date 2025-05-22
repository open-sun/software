#!/bin/bash

# ==============================
# Node.js v22.12.0 and npm v10.9.0 Installation Script with Backend Configuration
# ==============================

# 目标版本
TARGET_NODE_VERSION="v22.12.0"
TARGET_NPM_VERSION="10.9.0"
BACKEND_DIR="backend"
VENV_DIR="${BACKEND_DIR}/.venv"


#!/bin/bash

cat > backend/.env <<EOF
# 智谱AI的API密钥
ZHIPUAI_API_KEY=2fb8ce7647eb491db91be7d8b6650be6.vJ2aSN6frXXn4qlY

# 数据库密码
DB_PASSWORD=123456
EOF

echo "backend/.env 文件已生成。"
echo "Node.js v22.12.0 和 npm v10.9.0 安装脚本"
echo "=============================="

# 检查 Node.js 版本
if command -v node &> /dev/null; then
  INSTALLED_NODE_VERSION=$(node -v)
  echo "已检测到 Node.js 版本：$INSTALLED_NODE_VERSION"
  if [ "$INSTALLED_NODE_VERSION" == "$TARGET_NODE_VERSION" ]; then
    echo "Node.js 版本符合要求，跳过安装。"
    NODE_INSTALLED=true
  else
    echo "Node.js 版本不符，将重新安装..."
    NODE_INSTALLED=false
  fi
else
  echo "Node.js 未安装，将进行安装..."
  NODE_INSTALLED=false
fi

# 检查 npm 版本
if command -v npm &> /dev/null; then
  INSTALLED_NPM_VERSION=$(npm -v)
  echo "已检测到 npm 版本：$INSTALLED_NPM_VERSION"
  if [ "$INSTALLED_NPM_VERSION" == "$TARGET_NPM_VERSION" ]; then
    echo "npm 版本符合要求，跳过安装。"
    NPM_INSTALLED=true
  else
    echo "npm 版本不符，将重新安装..."
    NPM_INSTALLED=false
  fi
else
  echo "npm 未安装，将进行安装..."
  NPM_INSTALLED=false
fi

# 如果 Node.js 或 npm 未满足条件，则进行安装
if [ "$NODE_INSTALLED" = false ] || [ "$NPM_INSTALLED" = false ]; then
  # 更新系统包
  sudo apt update -y

  # 安装依赖
  sudo apt install -y curl

  # 下载 Node.js v22.12.0 安装包
  echo "正在下载 Node.js v22.12.0..."
  curl -O https://nodejs.org/dist/v22.12.0/node-v22.12.0-linux-x64.tar.xz

  # 解压 Node.js 安装包
  echo "正在解压 Node.js v22.12.0..."
  tar -xvf node-v22.12.0-linux-x64.tar.xz

  # 移动到 /usr/local 目录
  sudo mv node-v22.12.0-linux-x64 /usr/local/node-v22.12.0

  # 创建软链接
  sudo ln -sf /usr/local/node-v22.12.0/bin/node /usr/bin/node
  sudo ln -sf /usr/local/node-v22.12.0/bin/npm /usr/bin/npm

  # 清理下载的安装包
  rm -f node-v22.12.0-linux-x64.tar.xz

  echo "Node.js 和 npm 安装完成！"
else
  echo "Node.js 和 npm 均已满足目标版本，无需重新安装。"
fi

# 最终版本检查
echo "当前 Node.js 版本：$(node -v)"
echo "当前 npm 版本：$(npm -v)"

# ==============================
# 后端 Python 环境配置
# ==============================
echo "=============================="
echo "开始配置后端 Python 环境..."

# 检查 backend 目录是否存在
if [ ! -d "$BACKEND_DIR" ]; then
  echo "后端目录 $BACKEND_DIR 不存在，跳过配置。"
else
  cd $BACKEND_DIR

  # 检查 Python 环境
  if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
  elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
  else
    echo "Python 未安装，请先安装 Python。"
    exit 1
  fi

  echo "使用 Python 命令：$PYTHON_CMD"

  # 创建虚拟环境
  if [ ! -d "$VENV_DIR" ]; then
    echo "创建 Python 虚拟环境：$VENV_DIR"
    $PYTHON_CMD -m venv .venv
  else
    echo "虚拟环境已存在，跳过创建。"
  fi

  # 激活虚拟环境
  source .venv/bin/activate

  # 检查 requirements.txt 是否存在
  if [ -f "requirements.txt" ]; then
    echo "安装 requirements.txt 中的依赖..."
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
  else
    echo "未找到 requirements.txt，跳过依赖安装。"
  fi

  # 退出虚拟环境
  deactivate

  # 返回项目根目录
  cd $ROOT_DIR
fi

echo "后端 Python 环境配置完成。"
echo "=============================="
