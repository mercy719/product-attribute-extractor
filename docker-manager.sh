#!/bin/bash

# 产品属性提取助手 - Docker管理脚本
# 作者: Claude AI Assistant
# 版本: 1.0

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
CONTAINER_NAME="product-extractor"
IMAGE_NAME="mercy719/product-attribute-extractor:latest"
PORT="5001"
DEEPSEEK_API_KEY="sk-0306bfe4b4974f8f93cc21cd18164167"
SECRET_KEY="dev-secret-key-for-local-testing"

# 显示帮助信息
show_help() {
    echo -e "${BLUE}产品属性提取助手 - Docker管理脚本${NC}"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  start     启动容器"
    echo "  stop      停止容器"
    echo "  restart   重启容器"
    echo "  status    查看状态"
    echo "  logs      查看日志"
    echo "  test      测试API"
    echo "  clean     清理容器"
    echo "  help      显示帮助"
    echo ""
    echo "访问地址: http://localhost:$PORT"
}

# 启动容器
start_container() {
    echo -e "${BLUE}🚀 启动产品属性提取器...${NC}"

    # 检查容器是否已存在
    if docker ps -a | grep -q $CONTAINER_NAME; then
        echo -e "${YELLOW}⚠️  容器已存在，正在重启...${NC}"
        docker restart $CONTAINER_NAME
    else
        echo -e "${GREEN}📦 创建新容器...${NC}"
        docker run -d --name $CONTAINER_NAME \
            -e DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY \
            -e SECRET_KEY=$SECRET_KEY \
            -e FLASK_ENV=development \
            -e PORT=$PORT \
            -p $PORT:$PORT \
            -v $(pwd)/uploads:/app/uploads \
            -v $(pwd)/results:/app/results \
            $IMAGE_NAME
    fi

    # 等待容器启动
    echo -e "${YELLOW}⏳ 等待容器启动...${NC}"
    sleep 5

    # 检查容器状态
    if docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}✅ 容器启动成功！${NC}"
        echo -e "${BLUE}🌐 访问地址: http://localhost:$PORT${NC}"
        echo -e "${BLUE}📊 健康检查: http://localhost:$PORT/api/health${NC}"
    else
        echo -e "${RED}❌ 容器启动失败${NC}"
        echo -e "${YELLOW}查看日志: $0 logs${NC}"
    fi
}

# 停止容器
stop_container() {
    echo -e "${BLUE}🛑 停止产品属性提取器...${NC}"

    if docker ps | grep -q $CONTAINER_NAME; then
        docker stop $CONTAINER_NAME
        echo -e "${GREEN}✅ 容器已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  容器未在运行${NC}"
    fi
}

# 重启容器
restart_container() {
    echo -e "${BLUE}🔄 重启产品属性提取器...${NC}"
    stop_container
    sleep 2
    start_container
}

# 查看状态
show_status() {
    echo -e "${BLUE}📊 容器状态信息${NC}"
    echo ""

    if docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}✅ 容器正在运行${NC}"
        docker ps | grep $CONTAINER_NAME
        echo ""
        echo -e "${BLUE}📋 资源使用情况:${NC}"
        docker stats --no-stream $CONTAINER_NAME
    else
        echo -e "${RED}❌ 容器未运行${NC}"
        if docker ps -a | grep -q $CONTAINER_NAME; then
            echo -e "${YELLOW}⚠️  容器存在但已停止${NC}"
            echo -e "${YELLOW}启动命令: $0 start${NC}"
        else
            echo -e "${YELLOW}⚠️  容器不存在${NC}"
            echo -e "${YELLOW}创建命令: $0 start${NC}"
        fi
    fi
}

# 查看日志
show_logs() {
    echo -e "${BLUE}📝 容器日志 (按Ctrl+C退出)${NC}"
    echo ""
    docker logs -f $CONTAINER_NAME
}

# 测试API
test_api() {
    echo -e "${BLUE}🧪 测试API端点${NC}"
    echo ""

    # 测试健康检查
    echo -e "${YELLOW}测试健康检查...${NC}"
    if curl -s http://localhost:$PORT/api/health > /dev/null; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
        curl -s http://localhost:$PORT/api/health | python3 -m json.tool
    else
        echo -e "${RED}❌ 健康检查失败${NC}"
        echo -e "${YELLOW}请确保容器正在运行${NC}"
        return 1
    fi

    echo ""

    # 测试根端点
    echo -e "${YELLOW}测试API信息...${NC}"
    curl -s http://localhost:$PORT/ | python3 -m json.tool

    echo ""
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    echo -e "${BLUE}🌐 在浏览器中访问: http://localhost:$PORT${NC}"
}

# 清理容器
clean_container() {
    echo -e "${BLUE}🧹 清理容器和镜像${NC}"

    # 停止并删除容器
    if docker ps -a | grep -q $CONTAINER_NAME; then
        docker stop $CONTAINER_NAME 2>/dev/null
        docker rm $CONTAINER_NAME
        echo -e "${GREEN}✅ 容器已删除${NC}"
    fi

    # 询问是否删除镜像
    read -p "是否删除Docker镜像? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker rmi $IMAGE_NAME 2>/dev/null
        echo -e "${GREEN}✅ 镜像已删除${NC}"
    fi
}

# 主程序
case "$1" in
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    test)
        test_api
        ;;
    clean)
        clean_container
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac