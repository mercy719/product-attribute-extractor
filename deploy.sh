#!/bin/bash

# 产品属性提取助手 - GitHub & Railway 部署脚本
# 作者: Claude AI Assistant
# 版本: 1.0

echo "🚀 开始部署产品属性提取助手到GitHub和Railway..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤 1: 检查Git状态
echo -e "${BLUE}📋 步骤 1: 检查Git状态${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ 所有更改都已提交${NC}"
else
    echo -e "${YELLOW}⚠️  发现未提交的更改，正在提交...${NC}"
    git add .
    git commit -m "chore: 部署前最后的提交"
fi

# 步骤 2: 检查远程仓库
echo -e "${BLUE}📋 步骤 2: 检查GitHub远程仓库${NC}"
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 未找到远程仓库${NC}"
    echo -e "${YELLOW}请手动创建GitHub仓库并运行以下命令：${NC}"
    echo "git remote add origin https://github.com/你的用户名/product-attribute-extractor.git"
    echo "git push -u origin main"
    exit 1
else
    echo -e "${GREEN}✅ 找到远程仓库: $REMOTE_URL${NC}"
fi

# 步骤 3: 推送到GitHub
echo -e "${BLUE}📋 步骤 3: 推送代码到GitHub${NC}"
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 代码成功推送到GitHub${NC}"
else
    echo -e "${RED}❌ 推送失败，请检查GitHub仓库是否存在${NC}"
    echo -e "${YELLOW}请访问GitHub创建仓库：https://github.com/new${NC}"
    echo -e "${YELLOW}仓库名称: product-attribute-extractor${NC}"
    exit 1
fi

# 步骤 4: 生成部署说明
echo -e "${BLUE}📋 步骤 4: 生成Railway部署说明${NC}"
cat > RAILWAY_DEPLOY_GUIDE.md << 'EOF'
# Railway 部署指南

## 1. 连接GitHub仓库

1. 访问 [Railway](https://railway.app)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的 `product-attribute-extractor` 仓库
4. 点击 "Deploy Now"

## 2. 配置环境变量

在Railway项目中添加以下环境变量：

### 必需的环境变量
- `DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
- `SECRET_KEY`: Flask应用密钥 (可以使用随机字符串)

### 可选的环境变量
- `OPENAI_API_KEY`: 你的OpenAI API密钥
- `MAX_WORKERS`: 最大并发线程数 (默认: 5)
- `FLASK_ENV`: 设置为 "production"

## 3. 部署配置

项目已配置以下文件：
- `railway.toml`: Railway部署配置
- `Dockerfile.railway`: Docker配置
- `Procfile`: 启动命令配置

## 4. 部署验证

部署完成后，你的应用将在以下地址可用：
- `https://你的项目名.up.railway.app`

## 5. 健康检查

应用提供以下端点：
- `/`: 主页
- `/api/health`: 健康检查
- `/api/stats`: 系统统计

## 6. 故障排除

如果部署失败：
1. 检查环境变量是否正确设置
2. 查看Railway构建日志
3. 确保API密钥有效且有足够余额
EOF

echo -e "${GREEN}✅ 已生成部署指南: RAILWAY_DEPLOY_GUIDE.md${NC}"

# 步骤 5: 显示仓库信息
echo -e "${BLUE}📋 步骤 5: 部署信息${NC}"
echo -e "${GREEN}GitHub仓库地址: $REMOTE_URL${NC}"
echo -e "${YELLOW}请按照以下步骤在Railway上部署：${NC}"
echo "1. 访问 https://railway.app"
echo "2. 连接GitHub仓库: product-attribute-extractor"
echo "3. 配置环境变量 (至少需要DEEPSEEK_API_KEY)"
echo "4. 点击部署"

echo -e "${GREEN}🎉 部署准备完成！${NC}"
echo -e "${BLUE}详细说明请查看: RAILWAY_DEPLOY_GUIDE.md${NC}"