# 🔌 Docker容器开关管理指南

## 📊 资源使用对比

| 状态 | CPU使用率 | 内存占用 | 磁盘使用 | 网络端口 |
|------|-----------|----------|----------|----------|
| 运行中 | ~0.85% | ~140MB | 镜像940MB | 5001端口占用 |
| 已停止 | 0% | 0MB | 镜像940MB | 端口释放 |

## 🛑 关闭程序（节约资源）

### 快速命令
```bash
# 推荐方式
./docker-manager.sh stop

# Docker原生命令
docker stop product-extractor
```

### 完全清理（释放最大资源）
```bash
# 停止并删除容器
./docker-manager.sh clean

# 或者手动执行
docker stop product-extractor
docker rm product-extractor

# 可选：删除镜像（需要重新构建）
docker rmi mercy719/product-attribute-extractor:latest
```

## 🚀 启动程序

### 快速启动
```bash
# 推荐方式
./docker-manager.sh start

# Docker原生命令
docker start product-extractor
```

### 全新启动（如果容器被删除）
```bash
./docker-manager.sh start
# 或使用完整的docker run命令
```

## 📋 日常管理命令

### 查看状态
```bash
./docker-manager.sh status          # 查看容器状态和资源使用
docker ps                          # 查看运行中的容器
docker ps -a                       # 查看所有容器（包括已停止的）
```

### 查看日志
```bash
./docker-manager.sh logs           # 实时查看日志
docker logs product-extractor       # 查看所有日志
docker logs -f product-extractor    # 实时跟踪日志
```

### 测试功能
```bash
./docker-manager.sh test           # 测试API功能
curl http://localhost:5001/api/health  # 健康检查
```

### 重启服务
```bash
./docker-manager.sh restart        # 重启容器
docker restart product-extractor   # Docker原生重启
```

## 🔄 常用开关场景

### 日常使用场景
```bash
# 上班时启动
./docker-manager.sh start

# 下班时关闭
./docker-manager.sh stop

# 周末完全关闭
./docker-manager.sh clean
```

### 开发调试场景
```bash
# 启动服务
./docker-manager.sh start

# 查看日志
./docker-manager.sh logs

# 重启（修改配置后）
./docker-manager.sh restart

# 停止（清理环境）
./docker-manager.sh stop
```

### 资源管理场景
```bash
# 检查资源使用
./docker-manager.sh status

# 临时关闭（节约CPU）
./docker-manager.sh stop

# 需要时快速启动
./docker-manager.sh start
```

## 💾 数据持久化

**重要说明**：即使停止/删除容器，你的数据也不会丢失！

### 数据存储位置
```
./uploads/     # 上传的Excel/CSV文件
./results/     # 处理后的结果文件
```

### 数据备份建议
```bash
# 备份数据
cp -r uploads/ backup/uploads-$(date +%Y%m%d)/
cp -r results/ backup/results-$(date +%Y%m%d)/

# 恢复数据
cp -r backup/uploads-20250101/* uploads/
cp -r backup/results-20250101/* results/
```

## 🔧 高级管理

### 批量操作脚本
```bash
#!/bin/bash
# 一键关闭所有相关服务
docker stop $(docker ps -q --filter "name=product-extractor")
docker rm $(docker ps -aq --filter "name=product-extractor")

# 一键清理Docker资源
docker system prune -f
```

### 定时任务（可选）
```bash
# 添加到crontab，每天22点自动关闭
# crontab -e
# 0 22 * * * cd /path/to/product-attribute-extractor && ./docker-manager.sh stop
```

## 📱 移动设备访问提醒

### 启动后局域网访问地址
- **主要地址**: http://172.24.212.177:5001
- **备选地址1**: http://10.211.55.2:5001
- **备选地址2**: http://10.37.129.2:5001

### 访问前检查清单
- [ ] 容器已启动 (`./docker-manager.sh status`)
- [ ] 健康检查通过 (`curl http://localhost:5001/api/health`)
- [ ] 防火墙允许5001端口
- [ ] 设备在同一局域网内

## 🎯 最佳实践

### 节约资源的建议
1. **不使用时及时关闭**：`./docker-manager.sh stop`
2. **定期清理Docker资源**：`docker system prune -f`
3. **监控资源使用**：`./docker-manager.sh status`
4. **备份重要数据**：定期备份 `uploads/` 和 `results/` 目录

### 快速开关流程
```bash
# 关闭（节约资源）
./docker-manager.sh stop

# 启动（需要使用时）
./docker-manager.sh start

# 验证启动成功
./docker-manager.sh test
```

---

**更新时间**: 2025-10-22
**适用版本**: Docker容器化部署版本