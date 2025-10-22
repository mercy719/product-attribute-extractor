# 🚀 GitHub + Railway 部署完整步骤

## 📋 前置要求
- GitHub账号
- Railway账号
- DeepSeek API密钥

---

## 🔥 第一部分：GitHub仓库创建

### 步骤1：创建GitHub仓库
1. **访问GitHub**: https://github.com/new
2. **填写仓库信息**:
   - Repository name: `product-attribute-extractor`
   - Description: `产品属性提取助手 - 基于AI的现代化Web应用`
   - 设置为 **Public** 公开仓库
   - **不要**勾选 "Initialize this repository with a README"
3. 点击 "Create repository"

### 步骤2：推送代码到GitHub
现在执行以下命令（我已经为你准备好了Git仓库）：

```bash
# 设置远程仓库地址（替换your-username为你的GitHub用户名）
git remote set-url origin https://github.com/your-username/product-attribute-extractor.git

# 推送代码到GitHub
git push -u origin main
```

**⚠️ 重要**: 记得将 `your-username` 替换为你的实际GitHub用户名。

---

## 🚀 第二部分：Railway部署

### 步骤1：登录Railway
1. 访问 https://railway.app
2. 点击 "Login" 或 "Sign up"
3. 选择 "Continue with GitHub" 授权登录

### 步骤2：创建新项目
1. 登录后点击 "New Project" 按钮
2. 选择 "Deploy from GitHub repo"
3. 找到并选择 `product-attribute-extractor` 仓库
4. 点击 "Import Repository"

### 步骤3：配置部署设置
1. **选择构建配置**:
   - Railway会自动检测到你的项目
   - 确认使用 `Dockerfile.railway` 作为构建文件

2. **配置环境变量**:
   在项目设置的 "Variables" 标签页添加以下环境变量：

   ```bash
   DEEPSEEK_API_KEY=sk-你的DeepSeekAPI密钥
   SECRET_KEY=your-very-secret-key-here
   FLASK_ENV=production
   PORT=5001
   ```

   **注意**:
   - DEEPSEEK_API_KEY是你自己的DeepSeek API密钥
   - SECRET_KEY可以生成一个随机字符串，比如: `openssl rand -hex 32`

### 步骤4：开始部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要5-10分钟）
3. 查看部署日志确保没有错误

---

## ✅ 第三部分：验证部署

### 部署完成后
1. **获取应用URL**:
   - Railway会提供一个类似 `https://your-app-name.up.railway.app` 的URL
   - 这个URL就是你的生产环境地址

2. **测试功能**:
   - 访问应用URL
   - 测试文件上传功能
   - 测试属性提取功能
   - 确认API正常工作

### 健康检查
访问 `https://your-app-name.up.railway.app/api/health` 应该返回：
```json
{
  "status": "ok",
  "message": "产品属性提取助手生产环境运行正常",
  "version": "2.0"
}
```

---

## 🔧 第四部分：故障排除

### 常见问题和解决方案

#### 1. 构建失败
**问题**: Railway构建过程中出现错误
**解决方案**:
- 检查 `Dockerfile.railway` 文件语法
- 确保所有依赖都在 `requirements.txt` 和 `package.json` 中
- 查看Railway的构建日志，定位具体错误

#### 2. API密钥错误
**问题**: DeepSeek API调用失败
**解决方案**:
- 确保 `DEEPSEEK_API_KEY` 环境变量设置正确
- 验证API密钥是否有效且余额充足
- 检查API密钥是否包含额外空格

#### 3. 端口配置问题
**问题**: 应用无法访问
**解决方案**:
- 确保 `PORT` 环境变量设置为 `5001`
- 检查健康检查路径是否正确：`/api/health`

#### 4. 前端构建问题
**问题**: 前端界面显示异常
**解决方案**:
- 确保 `npm run build` 成功执行
- 检查静态文件是否正确复制到 `static/` 目录
- 验证前端路由配置

### 查看日志
- **Railway控制台**: 在项目的 "Logs" 标签页查看实时日志
- **构建日志**: 在部署历史中查看具体的构建错误

---

## 🎯 第五部分：优化和维护

### 性能优化
1. **配置自动扩展**:
   - 在Railway设置中配置自动扩展规则
   - 根据负载自动调整资源

2. **启用缓存**:
   - 考虑添加Redis缓存
   - 优化静态文件服务

### 监控和告警
1. **设置监控**:
   - 监控API响应时间
   - 跟踪错误率和成功率
   - 监控资源使用情况

2. **配置告警**:
   - 设置错误率告警
   - 配置资源使用告警

### 安全配置
1. **定期更新依赖**:
   - 定期检查并更新Python和Node.js依赖
   - 修复安全漏洞

2. **备份重要数据**:
   - 定期备份上传的文件和处理结果
   - 考虑使用对象存储服务

---

## 🎉 部署完成！

恭喜！按照以上步骤，你将拥有一个功能完整的现代化产品属性提取工具，具有：

✨ **现代化界面**: React + TypeScript + Shadcn/ui
🤖 **AI驱动**: DeepSeek API智能属性提取
🚀 **生产就绪**: Railway自动部署和扩展
📱 **响应式设计**: 支持桌面和移动设备
🔄 **实时监控**: 任务进度追踪和状态管理

### 🌍 访问你的应用
使用Railway提供的URL即可访问你的生产环境应用！

### 📞 获取支持
如遇问题，可以：
1. 查看Railway日志
2. 检查环境变量配置
3. 参考故障排除指南
4. 联系技术支持

**🎯 现在你拥有了一个完全部署在云端的现代化AI应用！**