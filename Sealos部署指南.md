# 🐳 产品属性提取助手 - Sealos云平台部署指南

## 📋 部署概述

Sealos是一个开源的云原生操作系统，提供简单易用的Kubernetes管理平台。本指南将帮助你将产品属性提取助手部署到Sealos云平台。

## 🚀 快速部署

### 方式一：一键部署脚本（推荐）

```bash
# 克隆项目
git clone https://github.com/mercy719/product-attribute-extractor.git
cd product-attribute-extractor

# 运行构建脚本
./build-sealos.sh

# 运行部署脚本
./sealos-deploy-commands.sh
```

### 方式二：手动部署

请按照以下详细步骤操作。

## 📦 部署前准备

### 1. 必需账号和服务
- [Sealos账号](https://cloud.sealos.io)
- [Docker Hub账号](https://hub.docker.com)（可选，用于镜像存储）
- [DeepSeek API密钥](https://platform.deepseek.com)

### 2. 本地环境
- Docker (用于构建镜像)
- kubectl (用于部署到Sealos)
- Git

## 🔧 步骤一：构建Docker镜像

### 1.1 检查项目文件
确保以下文件存在：
- ✅ `Dockerfile.sealos` - Sealos专用Docker配置
- ✅ `sealos-deploy.yaml` - Kubernetes部署配置
- ✅ `.dockerignore` - Docker忽略文件

### 1.2 构建镜像
```bash
# 构建Sealos专用镜像
docker build -f Dockerfile.sealos -t mercy719/product-attribute-extractor:latest .

# 测试镜像运行
docker run -d --name test \
  -e DEEPSEEK_API_KEY=your-test-key \
  -e SECRET_KEY=your-test-secret \
  -p 5001:5001 \
  mercy719/product-attribute-extractor:latest

# 检查健康状态
curl http://localhost:5001/api/health

# 清理测试容器
docker rm -f test
```

### 1.3 推送镜像（可选）
如果需要推送到Docker Hub：

```bash
# 登录Docker Hub
docker login

# 推送镜像
docker push mercy719/product-attribute-extractor:latest
```

## 🚀 步骤二：部署到Sealos

### 2.1 登录Sealos平台
1. 访问 [Sealos云平台](https://cloud.sealos.io)
2. 使用GitHub或邮箱账号登录
3. 进入控制台

### 2.2 创建命名空间
```bash
# 使用kubectl创建命名空间
kubectl create namespace product-extractor
```

### 2.3 配置密钥（Secrets）
在Sealos控制台或使用kubectl配置应用密钥：

#### 方法一：通过控制台
1. 进入"配置" → "密钥"
2. 创建名为 `app-secrets` 的密钥
3. 添加以下键值对：
   - `deepseek-api-key`: 你的DeepSeek API密钥
   - `flask-secret-key`: 随机生成的密钥（可以使用在线生成器）
   - `openai-api-key`: OpenAI API密钥（可选）

#### 方法二：使用kubectl
```bash
# 创建base64编码的密钥
echo -n "your-deepseek-api-key" | base64
echo -n "your-flask-secret-key" | base64
echo -n "your-openai-api-key" | base64

# 编辑sealos-deploy.yaml中的data部分
# 替换base64编码后的值
kubectl apply -f sealos-deploy.yaml -n product-extractor
```

### 2.4 部署应用
```bash
# 应用Kubernetes配置
kubectl apply -f sealos-deploy.yaml -n product-extractor

# 查看部署状态
kubectl get pods -n product-extractor

# 查看服务状态
kubectl get svc -n product-extractor
```

### 2.5 配置域名访问
1. 在Sealos控制台进入"网络" → "域名"
2. 创建域名绑定，指向 `product-attribute-extractor-service` 服务
3. 配置HTTPS证书（可选）

## ✅ 步骤三：验证部署

### 3.1 检查Pod状态
```bash
# 查看Pod详情
kubectl describe pods -l app=product-attribute-extractor -n product-extractor

# 查看日志
kubectl logs -f deployment/product-attribute-extractor -n product-extractor
```

### 3.2 测试应用功能
访问你的域名测试以下功能：
- **首页**: `https://你的域名/`
- **健康检查**: `https://你的域名/api/health`
- **API统计**: `https://你的域名/api/stats`

### 3.3 端口转发测试（本地调试）
```bash
# 临时端口转发到本地
kubectl port-forward service/product-attribute-extractor-service 5001:80 -n product-extractor

# 在本地测试
curl http://localhost:5001/api/health
```

## 🔧 配置说明

### 环境变量配置
| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `FLASK_ENV` | 运行环境 | `production` | 否 |
| `PORT` | 服务端口 | `5001` | 否 |
| `HOST` | 绑定地址 | `0.0.0.0` | 否 |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | - | ✅ |
| `OPENAI_API_KEY` | OpenAI API密钥 | - | 否 |
| `SECRET_KEY` | Flask密钥 | - | ✅ |
| `MAX_WORKERS` | 最大工作进程数 | `5` | 否 |

### 资源配置
- **CPU请求**: 200m
- **CPU限制**: 1000m
- **内存请求**: 256Mi
- **内存限制**: 1Gi
- **副本数**: 2

### 存储配置
- **上传存储**: 5Gi PVC
- **结果存储**: 10Gi PVC
- **存储类型**: ReadWriteOnce

## 🔍 监控和维护

### 1. 日志监控
```bash
# 实时查看日志
kubectl logs -f deployment/product-attribute-extractor -n product-extractor

# 查看特定时间段的日志
kubectl logs --since=1h deployment/product-attribute-extractor -n product-extractor
```

### 2. 性能监控
在Sealos控制台可以查看：
- CPU和内存使用率
- 网络流量
- 存储使用情况

### 3. 扩容缩容
```bash
# 手动扩容
kubectl scale deployment product-attribute-extractor --replicas=3 -n product-extractor

# 设置自动扩容
kubectl autoscale deployment product-attribute-extractor --min=2 --max=10 --cpu-percent=70 -n product-extractor
```

### 4. 更新部署
```bash
# 更新镜像版本
kubectl set image deployment/product-attribute-extractor product-attribute-extractor=mercy719/product-attribute-extractor:v2 -n product-extractor

# 查看更新状态
kubectl rollout status deployment/product-attribute-extractor -n product-extractor
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. Pod启动失败
```bash
# 查看Pod详情
kubectl describe pod <pod-name> -n product-extractor

# 常见原因：
# - 镜像拉取失败：检查镜像名称和标签
# - 资源不足：增加CPU/内存限制
# - 密钥配置错误：检查Secret配置
```

#### 2. 健康检查失败
```bash
# 检查健康检查端点
curl http://你的域名/api/health

# 调整健康检查配置
# 编辑sealos-deploy.yaml中的livenessProbe和readinessProbe
```

#### 3. API调用失败
```bash
# 检查环境变量配置
kubectl exec -it <pod-name> -n product-extractor -- env | grep API

# 验证API密钥有效性
# 检查DeepSeek账户余额
```

#### 4. 存储问题
```bash
# 查看PVC状态
kubectl get pvc -n product-extractor

# 查看存储使用情况
kubectl exec -it <pod-name> -n product-extractor -- df -h
```

## 📊 成本优化

### 1. 资源优化
- 根据实际使用情况调整CPU和内存限制
- 使用HPA（水平自动扩缩容）节省成本
- 定期清理不必要的存储

### 2. 镜像优化
- 使用多阶段构建减小镜像大小
- 定期更新基础镜像版本
- 清理不必要的依赖

## 🔄 备份和恢复

### 1. 数据备份
```bash
# 备份上传文件
kubectl exec -it <pod-name> -n product-extractor -- tar -czf /tmp/uploads-backup.tar.gz /app/uploads

# 备份数据库（如果使用）
kubectl exec -it <pod-name> -n product-extractor -- python -c "import sqlite3; sqlite3.connect('app.db').backup('app-backup.db')"
```

### 2. 配置备份
```bash
# 备份Kubernetes配置
kubectl get all,configmaps,secrets -n product-extractor -o yaml > cluster-backup.yaml
```

## 🎯 生产环境最佳实践

### 1. 安全配置
- 使用HTTPS加密传输
- 定期更新依赖包
- 配置网络策略限制访问
- 启用RBAC权限控制

### 2. 性能优化
- 配置CDN加速静态资源
- 使用Redis缓存API响应
- 配置负载均衡
- 优化数据库查询

### 3. 监控告警
- 配置Prometheus监控
- 设置Grafana仪表盘
- 配置告警规则
- 设置通知渠道

## 📞 技术支持

如果遇到部署问题：

1. **查看官方文档**: [Sealos文档](https://sealos.io/docs)
2. **GitHub Issues**: 在项目仓库提交问题
3. **社区支持**: Sealos官方社区

## 🎉 部署完成

恭喜！你的产品属性提取助手现在运行在Sealos云平台上了！

**访问地址**: `https://你的域名`

**管理地址**: [Sealos控制台](https://cloud.sealos.io)

**主要功能**:
- ✅ 云原生容器化部署
- ✅ 自动扩缩容支持
- ✅ 高可用性保障
- ✅ 持久化存储
- ✅ 监控和日志

现在你可以享受云原生带来的弹性和可靠性了！