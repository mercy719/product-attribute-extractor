#!/bin/bash

# 产品属性提取助手启动脚本

# 设置默认端口
if [ -z "$PORT" ]; then
    export PORT=5001
fi

# 设置默认环境
if [ -z "$FLASK_ENV" ]; then
    export FLASK_ENV=production
fi

echo "=========================================="
echo "产品属性提取助手启动中..."
echo "端口: $PORT"
echo "环境: $FLASK_ENV"
echo "=========================================="

# 检查是否存在虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装依赖包..."
pip install -r requirements.txt

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    cp .env.example .env
    echo "请编辑 .env 文件配置你的API密钥"
fi

# 启动应用
echo "启动应用..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --timeout 300 --workers 2