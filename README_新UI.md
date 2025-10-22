# 产品属性提取助手 - 现代化UI版本

## 🎉 新UI特性

### 现代化React界面
- **技术栈**: React 18 + TypeScript + Vite
- **UI组件**: Shadcn/ui (基于Radix UI)
- **样式**: TailwindCSS
- **状态管理**: React Query

### 功能亮点
- **响应式设计**: 支持桌面和移动设备
- **深色/浅色主题**: 自动适应系统设置
- **流畅动画**: 优雅的交互体验
- **步骤式向导**: 引导用户完成整个流程
- **实时进度监控**: 可视化任务处理进度
- **智能错误提示**: 友好的错误信息和解决建议

## 🚀 快速开始

### 前置要求
- Node.js 16+
- Python 3.9+
- DeepSeek API密钥

### 启动步骤

#### 1. 启动后端API服务

```bash
# 进入项目目录
cd product-attribute-extractor

# 激活Python虚拟环境
source venv/bin/activate

# 安装Python依赖（如果还没有）
pip install -r requirements.txt

# 设置环境变量
export DEEPSEEK_API_KEY="你的API密钥"
export PORT=5001
export FLASK_ENV=development

# 启动API服务
python api_app.py
```

后端API将运行在: `http://localhost:5001`

#### 2. 启动前端开发服务器

```bash
# 新开一个终端窗口
cd product-attribute-extractor/frontend

# 安装Node.js依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在: `http://localhost:5173`

#### 3. 访问应用

在浏览器中打开: `http://localhost:5173`

## 🏗️ 项目结构

```
product-attribute-extractor/
├── api_app.py              # Flask API服务（支持CORS）
├── app.py                  # 原始Flask应用（备用）
├── config.py               # 配置管理
├── requirements.txt        # Python依赖
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── lib/           # 工具函数
│   │   ├── services/      # API服务
│   │   └── App.tsx        # 主应用组件
│   ├── package.json       # Node.js依赖
│   ├── vite.config.ts     # Vite配置
│   └── tailwind.config.ts # TailwindCSS配置
├── uploads/               # 上传文件目录
├── results/               # 处理结果目录
├── static/                # 静态资源
├── templates/             # Flask模板（备用）
└── README.md              # 项目文档
```

## 🔧 API接口

### 健康检查
```
GET /api/health
```

### 文件预览
```
POST /api/preview
Content-Type: multipart/form-data
Body: file (Excel/CSV文件)
```

### 创建任务
```
POST /api/tasks
Content-Type: multipart/form-data
Body:
  - file: 文件
  - textColumns: JSON字符串
  - attributes: JSON字符串
  - customPrompts: JSON字符串
  - apiKey: API密钥
  - provider: 服务提供商
```

### 获取任务状态
```
GET /api/tasks/{taskId}
```

### 获取任务列表
```
GET /api/tasks
```

### 下载结果
```
GET /api/download/{filename}
```

## 🎨 UI组件说明

### 主要组件

1. **FileUpload** - 文件上传组件
   - 支持拖拽上传
   - 文件类型验证
   - 实时预览功能

2. **TaskWizard** - 任务向导组件
   - 步骤式引导
   - 表单验证
   - 进度指示

3. **TaskList** - 任务列表组件
   - 任务状态显示
   - 实时更新
   - 操作按钮

4. **TaskDetail** - 任务详情组件
   - 进度监控
   - 状态轮询
   - 结果下载

### UI特性

- **响应式布局**: 自适应不同屏幕尺寸
- **主题切换**: 支持深色/浅色主题
- **加载状态**: 优雅的加载动画
- **错误处理**: 友好的错误提示
- **键盘导航**: 完整的键盘支持

## 🛠️ 开发说明

### 环境变量配置

创建 `.env` 文件：

```bash
# API配置
DEEPSEEK_API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here

# 服务器配置
PORT=5001
HOST=0.0.0.0
FLASK_ENV=development

# 前端配置（在frontend/.env中）
VITE_API_URL=http://localhost:5001
```

### 开发命令

#### 后端开发
```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python api_app.py

# 生产环境启动
gunicorn api_app:app --bind 0.0.0.0:$PORT --timeout 300 --workers 2
```

#### 前端开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 部署指南

### Docker部署

```bash
# 构建镜像
docker build -t product-extractor .

# 运行容器
docker run -d \
  --name product-extractor \
  -p 5001:5001 \
  -e DEEPSEEK_API_KEY=your-api-key \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/results:/app/results \
  product-extractor
```

### 云平台部署

#### Vercel + Railway (推荐)
1. 前端部署到Vercel
2. 后端API部署到Railway
3. 配置环境变量
4. 设置域名和CORS

#### 单平台部署
1. 构建前端: `npm run build`
2. 将构建文件复制到后端静态目录
3. 使用Flask提供静态文件服务

## 🔍 故障排除

### 常见问题

1. **CORS错误**
   ```bash
   # 确保安装了flask-cors
   pip install flask-cors

   # 检查API服务是否正常运行
   curl http://localhost:5001/api/health
   ```

2. **API密钥错误**
   ```bash
   # 设置环境变量
   export DEEPSEEK_API_KEY="your-api-key"

   # 检查密钥是否有效
   curl -H "Authorization: Bearer your-api-key" \
        https://api.deepseek.com/v1/models
   ```

3. **前端构建失败**
   ```bash
   # 清理缓存
   rm -rf node_modules package-lock.json
   npm install

   # 检查Node.js版本
   node --version  # 需要>=16
   ```

4. **文件上传失败**
   - 检查文件大小 (<16MB)
   - 确认文件格式 (xlsx, xls, csv)
   - 查看后端日志

### 调试模式

#### 后端调试
```bash
# 启用调试模式
export FLASK_ENV=development
export FLASK_DEBUG=1
python api_app.py
```

#### 前端调试
```bash
# 启用详细日志
npm run dev -- --verbose

# 或者在浏览器开发者工具中查看
```

## 📈 性能优化

### 前端优化
- 代码分割
- 懒加载
- 图片优化
- 缓存策略

### 后端优化
- API限流
- 连接池
- 任务队列
- 结果缓存

## 🔒 安全配置

### 生产环境安全
- 使用HTTPS
- 设置适当的CORS策略
- 限制文件上传大小
- 输入验证和清理
- API密钥安全管理

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

---

**恭喜！** 🎉 您现在拥有了一个功能强大、界面现代的产品属性提取工具！

如有任何问题或需要进一步的定制，请查看文档或联系开发团队。