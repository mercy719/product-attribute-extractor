#!/bin/bash

# Docker镜像推送脚本
# 使用方法: ./push-docker.sh

echo "🐳 推送Docker镜像到Docker Hub"

# 镜像信息
IMAGE_NAME="mercy719/product-attribute-extractor"
TAG="latest"

echo "镜像名称: $IMAGE_NAME:$TAG"

# 步骤1: 登录Docker Hub
echo "请先登录Docker Hub:"
echo "docker login"
echo ""

# 步骤2: 推送镜像
echo "登录后运行以下命令推送镜像:"
echo "docker push $IMAGE_NAME:$TAG"
echo ""

# 步骤3: 验证推送
echo "验证镜像是否推送成功:"
echo "docker pull $IMAGE_NAME:$TAG"
echo ""

echo "推送完成后，可以运行Sealos部署脚本:"
echo "./sealos-deploy-commands.sh"