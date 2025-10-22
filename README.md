# 产品属性提取助手

一个基于Flask和LLM的产品属性提取Web应用，支持从Excel和CSV文件中智能提取产品属性。

## 功能特性

- **文件支持**: Excel (.xlsx, .xls) 和 CSV 文件
- **智能提取**: 基于LLM的产品属性提取
- **多LLM支持**: 支持DeepSeek和OpenAI API
- **自定义提示**: 为每个属性添加自定义提取提示
- **并行处理**: 多线程处理，支持断点续传
- **实时监控**: 实时任务状态和进度显示
- **任务管理**: 历史任务查看和结果下载
- **生产就绪**: 包含Docker和云平台部署配置

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <your-repo-url>
cd product-attribute-extractor

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置API密钥
# 至少需要配置其中一个LLM的API密钥
DEEPSEEK_API_KEY=your-deepseek-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. 启动应用

#### 方法一：使用启动脚本（推荐）

```bash
chmod +x start.sh
./start.sh
```

#### 方法二：手动启动

```bash
export FLASK_ENV=development
python app.py
```

#### 方法三：使用Gunicorn（生产环境）

```bash
gunicorn app:app --bind 0.0.0.0:5001 --timeout 300 --workers 2
```

### 4. 访问应用

打开浏览器访问: http://localhost:5001

## 使用指南

### 基本使用流程

1. **上传文件**: 选择包含产品信息的Excel或CSV文件
2. **预览数据**: 查看文件列结构和前5行数据
3. **配置属性**:
   - 选择含有产品信息的文本列
   - 添加要提取的属性
   - 可选择添加自定义提示
4. **LLM配置**: 选择LLM提供商并配置API密钥
5. **开始处理**: 启动属性提取任务
6. **下载结果**: 处理完成后下载增强的Excel文件

### 高级功能

#### 自定义提取提示

为提高提取准确性，可以为每个属性添加自定义提示：

- **外观颜色**: "只提取主体颜色，忽略装饰部分"
- **功率**: "以W为单位，不要包含其他单位"
- **特殊属性**: "如果含有XXX关键词，则为YYY"

#### 支持的LLM提供商

- **DeepSeek**: 性价比高，中文支持好
- **OpenAI**: GPT-4o，多语言支持强

## 部署指南

### Docker部署

```bash
# 构建镜像
docker build -t product-attribute-extractor .

# 运行容器
docker run -d \
  --name product-extractor \
  -p 5001:5001 \
  -e DEEPSEEK_API_KEY=your-api-key \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/results:/app/results \
  product-attribute-extractor
```

### 云平台部署

#### Railway部署

1. 连接GitHub仓库到Railway
2. 配置环境变量：
   - `DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY`
   - `FLASK_ENV=production`
   - `PORT=5001`（Railway会自动设置）

#### Render部署

1. 连接GitHub仓库到Render
2. 选择Web Service
3. 配置环境变量
4. 设置启动命令: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 300 --workers 2`

#### VPS部署

```bash
# 使用systemd管理服务
sudo nano /etc/systemd/system/product-extractor.service
```

```ini
[Unit]
Description=Product Attribute Extractor
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/product-attribute-extractor
Environment=PATH=/path/to/product-attribute-extractor/venv/bin
ExecStart=/path/to/product-attribute-extractor/venv/bin/gunicorn app:app --bind 0.0.0.0:5001 --timeout 300 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl enable product-extractor
sudo systemctl start product-extractor
```

## API文档

### 端点列表

- `GET /` - 首页
- `POST /upload` - 上传文件并开始处理
- `GET /task/<task_id>` - 获取任务状态
- `GET /tasks` - 获取所有任务列表
- `GET /download/<filename>` - 下载处理结果
- `POST /preview` - 预览文件内容
- `GET /health` - 健康检查
- `GET /stats` - 系统统计信息

### 上传文件参数

**POST /upload**
- `file`: 上传的文件
- `textColumns`: 包含产品信息的列名（JSON数组）
- `attributesToExtract`: 要提取的属性列表（JSON数组）
- `provider`: LLM提供商（"deepseek"或"openai"）
- `apiKey`: API密钥（可选）
- `customPrompts`: 自定义提示（JSON对象，可选）

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `FLASK_ENV` | 运行环境 | `development` |
| `SECRET_KEY` | Flask密钥 | 随机生成 |
| `PORT` | 服务端口 | `5001` |
| `HOST` | 绑定地址 | `0.0.0.0` |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | 必填 |
| `OPENAI_API_KEY` | OpenAI API密钥 | 可选 |
| `MAX_WORKERS` | 最大并发线程数 | `5` |
| `CLEANUP_INTERVAL` | 清理间隔（小时） | `24` |
| `MAX_FILE_AGE` | 文件最大保存时间（小时） | `72` |

### 应用配置

- **文件大小限制**: 16MB
- **支持格式**: .xlsx, .xls, .csv
- **最大重试次数**: 3次
- **重试间隔**: 2秒

## 故障排除

### 常见问题

1. **API密钥错误**
   - 确保在.env文件中正确配置了API密钥
   - 检查API密钥是否有效且余额充足

2. **文件上传失败**
   - 检查文件大小是否超过16MB
   - 确保文件格式为支持的类型

3. **处理缓慢**
   - 可以调整MAX_WORKERS增加并发数
   - 检查网络连接和API响应时间

4. **内存不足**
   - 对于大文件，考虑增加服务器内存
   - 可以调整worker数量减少内存使用

### 日志查看

```bash
# 查看应用日志
tail -f app.log

# Docker容器日志
docker logs -f product-extractor

# systemd服务日志
journalctl -u product-extractor -f
```

## 开发指南

### 项目结构

```
product-attribute-extractor/
├── app.py                 # 主应用文件
├── config.py              # 配置管理
├── requirements.txt       # 依赖包
├── Dockerfile            # Docker配置
├── Procfile              # 云平台部署配置
├── start.sh              # 启动脚本
├── .env.example          # 环境变量模板
├── templates/
│   └── index.html        # 前端界面
├── static/               # 静态资源
├── uploads/              # 上传文件目录
├── results/              # 处理结果目录
└── README.md             # 说明文档
```

### 本地开发

```bash
# 开发模式启动
export FLASK_ENV=development
python app.py

# 启用调试模式
export FLASK_DEBUG=1
python app.py
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持Excel和CSV文件处理
- 集成DeepSeek和OpenAI API
- 提供Docker和云平台部署配置
- 完整的Web界面和API