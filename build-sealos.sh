#!/bin/bash

# 产品属性提取助手 - Sealos部署构建脚本
# 作者: Claude AI Assistant
# 版本: 1.0

echo "🐳 开始构建Sealos部署镜像..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="mercy719/product-attribute-extractor"
TAG="latest"

# 步骤 1: 检查Docker是否安装
echo -e "${BLUE}📋 步骤 1: 检查Docker环境${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker环境正常${NC}"
fi

# 步骤 2: 检查Dockerfile
echo -e "${BLUE}📋 步骤 2: 检查Dockerfile.sealos${NC}"
if [ ! -f "Dockerfile.sealos" ]; then
    echo -e "${RED}❌ Dockerfile.sealos不存在${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Dockerfile.sealos存在${NC}"
fi

# 步骤 3: 构建Docker镜像
echo -e "${BLUE}📋 步骤 3: 构建Docker镜像${NC}"
docker build -f Dockerfile.sealos -t ${IMAGE_NAME}:${TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker镜像构建成功${NC}"
else
    echo -e "${RED}❌ Docker镜像构建失败${NC}"
    exit 1
fi

# 步骤 4: 测试镜像
echo -e "${BLUE}📋 步骤 4: 测试Docker镜像${NC}"
echo -e "${YELLOW}启动容器进行健康检查...${NC}"

# 创建临时容器进行测试
docker run -d --name test-container \
    -e DEEPSEEK_API_KEY=test-key \
    -e SECRET_KEY=test-secret \
    -p 5001:5001 \
    ${IMAGE_NAME}:${TAG}

# 等待容器启动
sleep 10

# 检查容器状态
if docker ps | grep -q test-container; then
    echo -e "${GREEN}✅ 容器启动成功${NC}"

    # 检查健康状态
    if curl -f http://localhost:5001/api/health &> /dev/null; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  健康检查失败，但容器正在运行${NC}"
    fi
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    docker logs test-container
    docker rm -f test-container 2>/dev/null
    exit 1
fi

# 清理测试容器
docker rm -f test-container

# 步骤 5: 显示镜像信息
echo -e "${BLUE}📋 步骤 5: 镜像信息${NC}"
docker images | grep ${IMAGE_NAME}

# 步骤 6: 生成Sealos部署命令
echo -e "${BLUE}📋 步骤 6: 生成Sealos部署命令${NC}"
cat > sealos-deploy-commands.sh << 'EOF'
#!/bin/bash

# Sealos部署命令

# 1. 登录Sealos (如果需要)
# sealos login

# 2. 创建命名空间
kubectl create namespace product-extractor

# 3. 应用配置
kubectl apply -f sealos-deploy.yaml -n product-extractor

# 4. 查看部署状态
kubectl get pods -n product-extractor

# 5. 查看服务
kubectl get svc -n product-extractor

# 6. 查看日志
kubectl logs -f deployment/product-attribute-extractor -n product-extractor
EOF

chmod +x sealos-deploy-commands.sh

echo -e "${GREEN}🎉 构建完成！${NC}"
echo -e "${BLUE}镜像名称: ${IMAGE_NAME}:${TAG}${NC}"
echo -e "${YELLOW}下一步: ${NC}"
echo "1. 如果需要推送到Docker Hub: docker push ${IMAGE_NAME}:${TAG}"
echo "2. 在Sealos平台部署: kubectl apply -f sealos-deploy.yaml"
echo -e "${BLUE}详细说明请查看: Sealos部署指南.md${NC}"