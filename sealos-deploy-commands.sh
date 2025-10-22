#!/bin/bash

# 产品属性提取助手 - Sealos部署命令
# 作者: Claude AI Assistant
# 版本: 1.0

echo "🚀 开始Sealos部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤 1: 检查kubectl
echo -e "${BLUE}📋 步骤 1: 检查kubectl环境${NC}"
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl未安装，请先安装kubectl${NC}"
    echo -e "${YELLOW}安装指南: https://kubernetes.io/docs/tasks/tools/install-kubectl/${NC}"
    exit 1
else
    echo -e "${GREEN}✅ kubectl环境正常${NC}"
fi

# 步骤 2: 检查Sealos连接
echo -e "${BLUE}📋 步骤 2: 检查Sealos连接${NC}"
if kubectl cluster-info &> /dev/null; then
    echo -e "${GREEN}✅ Kubernetes集群连接正常${NC}"
else
    echo -e "${RED}❌ 无法连接到Kubernetes集群${NC}"
    echo -e "${YELLOW}请确保已配置Sealos的kubeconfig${NC}"
    exit 1
fi

# 步骤 3: 创建命名空间
echo -e "${BLUE}📋 步骤 3: 创建命名空间${NC}"
kubectl create namespace product-extractor --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ 命名空间已创建/更新${NC}"

# 步骤 4: 创建密钥（交互式）
echo -e "${BLUE}📋 步骤 4: 配置应用密钥${NC}"
echo -e "${YELLOW}请输入以下配置信息：${NC}"

# 获取DeepSeek API密钥
read -p "DeepSeek API密钥: " DEEPSEEK_KEY
if [ -z "$DEEPSEEK_KEY" ]; then
    echo -e "${RED}❌ DeepSeek API密钥不能为空${NC}"
    exit 1
fi

# 生成随机密钥
SECRET_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}生成的Flask密钥: $SECRET_KEY${NC}"

# 获取OpenAI API密钥（可选）
read -p "OpenAI API密钥 (可选，直接回车跳过): " OPENAI_KEY

# 创建base64编码的密钥
DEEPSEEK_ENCODED=$(echo -n "$DEEPSEEK_KEY" | base64)
SECRET_ENCODED=$(echo -n "$SECRET_KEY" | base64)
if [ ! -z "$OPENAI_KEY" ]; then
    OPENAI_ENCODED=$(echo -n "$OPENAI_KEY" | base64)
fi

# 创建Secret配置
cat > app-secrets.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: product-extractor
type: Opaque
data:
  deepseek-api-key: $DEEPSEEK_ENCODED
  flask-secret-key: $SECRET_ENCODED
EOF

if [ ! -z "$OPENAI_KEY" ]; then
    echo "  openai-api-key: $OPENAI_ENCODED" >> app-secrets.yaml
fi

echo -e "${GREEN}✅ Secret配置已创建${NC}"

# 步骤 5: 部署应用
echo -e "${BLUE}📋 步骤 5: 部署应用到Sealos${NC}"

# 首先应用Secret
kubectl apply -f app-secrets.yaml

# 修改sealos-deploy.yaml中的镜像名称（如果不是默认的）
sed 's|mercy719/product-attribute-extractor:latest|mercy719/product-attribute-extractor:latest|g' sealos-deploy.yaml > sealos-deploy-temp.yaml

# 应用部署配置
kubectl apply -f sealos-deploy-temp.yaml -n product-extractor

echo -e "${GREEN}✅ 应用部署完成${NC}"

# 步骤 6: 等待部署完成
echo -e "${BLUE}📋 步骤 6: 等待部署完成${NC}"
echo -e "${YELLOW}等待Pod启动...${NC}"

# 等待Deployment完成
kubectl rollout status deployment/product-attribute-extractor -n product-extractor --timeout=300s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 部署成功完成${NC}"
else
    echo -e "${RED}❌ 部署超时或失败${NC}"
    echo -e "${YELLOW}请运行以下命令查看状态：${NC}"
    echo "kubectl get pods -n product-extractor"
    echo "kubectl logs -f deployment/product-attribute-extractor -n product-extractor"
    exit 1
fi

# 步骤 7: 显示部署状态
echo -e "${BLUE}📋 步骤 7: 部署状态信息${NC}"
echo -e "${GREEN}Pod状态:${NC}"
kubectl get pods -n product-extractor

echo -e "${GREEN}服务状态:${NC}"
kubectl get svc -n product-extractor

echo -e "${GREEN}存储状态:${NC}"
kubectl get pvc -n product-extractor

# 步骤 8: 获取访问信息
echo -e "${BLUE}📋 步骤 8: 访问信息${NC}"

# 获取服务IP
SERVICE_IP=$(kubectl get service product-attribute-extractor-service -n product-extractor -o jsonpath='{.spec.clusterIP}' 2>/dev/null)

if [ ! -z "$SERVICE_IP" ]; then
    echo -e "${GREEN}集群内部访问地址: http://$SERVICE_IP:5001${NC}"
    echo -e "${GREEN}健康检查地址: http://$SERVICE_IP:5001/api/health${NC}"
fi

# 获取外部访问信息（如果有LoadBalancer）
EXTERNAL_IP=$(kubectl get service product-attribute-extractor-service -n product-extractor -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [ ! -z "$EXTERNAL_IP" ]; then
    echo -e "${GREEN}外部访问地址: http://$EXTERNAL_IP${NC}"
else
    echo -e "${YELLOW}未找到外部访问地址，可能需要配置Ingress或端口转发${NC}"
    echo -e "${YELLOW}端口转发命令: kubectl port-forward service/product-attribute-extractor-service 5001:80 -n product-extractor${NC}"
fi

# 步骤 9: 清理临时文件
rm -f app-secrets.yaml sealos-deploy-temp.yaml

echo -e "${GREEN}🎉 Sealos部署完成！${NC}"
echo -e "${BLUE}常用命令:${NC}"
echo "- 查看Pod: kubectl get pods -n product-extractor"
echo "- 查看日志: kubectl logs -f deployment/product-attribute-extractor -n product-extractor"
echo "- 端口转发: kubectl port-forward service/product-attribute-extractor-service 5001:80 -n product-extractor"
echo "- 删除部署: kubectl delete namespace product-extractor"