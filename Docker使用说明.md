# 🐳 产品属性提取助手 - Docker本地部署使用说明

## 📋 快速开始

### 1. 启动应用

使用Docker管理脚本启动应用：

```bash
# 启动容器
./docker-manager.sh start

# 检查状态
./docker-manager.sh status

# 测试API
./docker-manager.sh test
```

### 2. 访问应用

- **Web界面**: http://localhost:5001
- **API健康检查**: http://localhost:5001/api/health
- **API信息**: http://localhost:5001/

## 🛠️ 管理命令

### Docker管理脚本 (`docker-manager.sh`)

| 命令 | 说明 |
|------|------|
| `./docker-manager.sh start` | 启动容器 |
| `./docker-manager.sh stop` | 停止容器 |
| `./docker-manager.sh restart` | 重启容器 |
| `./docker-manager.sh status` | 查看运行状态和资源使用 |
| `./docker-manager.sh logs` | 查看实时日志 |
| `./docker-manager.sh test` | 测试API端点 |
| `./docker-manager.sh clean` | 清理容器和镜像 |
| `./docker-manager.sh help` | 显示帮助信息 |

### 手动Docker命令

如果需要手动管理容器：

```bash
# 启动容器
docker run -d --name product-extractor \
    -e DEEPSEEK_API_KEY=your-api-key \
    -e SECRET_KEY=your-secret-key \
    -p 5001:5001 \
    -v $(pwd)/uploads:/app/uploads \
    -v $(pwd)/results:/app/results \
    mercy719/product-attribute-extractor:latest

# 查看容器状态
docker ps

# 查看日志
docker logs -f product-extractor

# 停止容器
docker stop product-extractor

# 启动已存在的容器
docker start product-extractor

# 删除容器
docker rm product-extractor
```

## 📊 API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 获取API信息 |
| `/api/health` | GET | 健康检查 |
| `/api/preview` | POST | 预览文件内容 |
| `/api/tasks` | GET | 获取任务列表 |
| `/api/tasks` | POST | 创建新任务 |
| `/api/tasks/<task_id>` | GET | 获取任务状态 |
| `/api/download/<filename>` | GET | 下载结果文件 |

## 📁 目录结构

```
product-attribute-extractor/
├── docker-manager.sh          # Docker管理脚本
├── uploads/                   # 上传文件目录
├── results/                   # 处理结果目录
├── Dockerfile.sealos.simple   # Docker镜像配置
├── sealos-deploy.yaml         # Kubernetes部署配置
└── Docker使用说明.md          # 本文档
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | 必需 |
| `OPENAI_API_KEY` | OpenAI API密钥 | 可选 |
| `SECRET_KEY` | Flask密钥 | 随机生成 |
| `FLASK_ENV` | 运行环境 | development |
| `PORT` | 服务端口 | 5001 |
| `MAX_WORKERS` | 最大工作进程数 | 5 |

### 数据持久化

应用使用Docker卷来持久化数据：

- **uploads目录**: 存储上传的Excel/CSV文件
- **results目录**: 存储处理后的结果文件

这些目录映射到宿主机的对应目录，确保数据不会因容器重启而丢失。

## 🎯 使用流程

### 1. 准备文件
准备包含产品信息的Excel或CSV文件。

### 2. 上传文件
- 访问 http://localhost:5001
- 点击上传按钮选择文件
- 系统会自动预览文件内容

### 3. 配置属性提取
- 选择包含产品描述的文本列
- 添加要提取的属性名称
- 可选择添加自定义提示
- 选择LLM提供商（DeepSeek/OpenAI）

### 4. 开始处理
- 配置API密钥
- 点击开始处理
- 系统会显示处理进度

### 5. 下载结果
- 处理完成后下载增强的Excel文件
- 包含原始数据+提取的新属性

## 🔍 故障排除

### 常见问题

#### 1. 容器启动失败
```bash
# 查看容器状态
./docker-manager.sh status

# 查看日志
./docker-manager.sh logs
```

#### 2. 端口冲突
如果5001端口被占用，修改Docker运行命令中的端口映射：
```bash
docker run -d --name product-extractor \
    -p 8080:5001 \  # 使用8080端口映射到容器5001
    ...
```

#### 3. API密钥错误
- 检查环境变量中的API密钥是否正确
- 确认API密钥有足够的余额
- 查看容器日志确认错误信息

#### 4. 文件上传失败
- 检查uploads目录权限
- 确认文件大小不超过16MB
- 验证文件格式为支持的类型

### 日志分析

查看实时日志：
```bash
./docker-manager.sh logs
```

常见日志信息：
- `Starting gunicorn` - 应用启动
- `Worker exiting` - 工作进程退出
- `API key validation failed` - API密钥验证失败
- `File uploaded successfully` - 文件上传成功

## 📈 监控和维护

### 资源监控
```bash
# 查看容器资源使用
./docker-manager.sh status

# 查看Docker系统资源
docker system df
```

### 定期维护
```bash
# 清理未使用的Docker资源
docker system prune -f

# 备份重要数据
cp -r uploads/ backup/uploads-$(date +%Y%m%d)/
cp -r results/ backup/results-$(date +%Y%m%d)/
```

## 🚀 生产部署

对于生产环境，建议：

1. **使用环境变量管理密钥**
2. **配置HTTPS**
3. **设置监控和日志收集**
4. **使用Kubernetes或Docker Compose**
5. **配置备份策略**

## 📞 技术支持

如果遇到问题：

1. 查看[Sealos部署指南.md](Sealos部署指南.md)了解云平台部署
2. 检查GitHub仓库的Issues页面
3. 查看项目README.md获取更多信息

---

**最后更新**: 2025-10-22
**版本**: 1.0