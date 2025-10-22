#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """基础配置类"""
    # 应用基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(32)

    # 文件上传配置
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    RESULT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # 支持的文件类型
    ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

    # LLM配置
    DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

    # 任务管理配置
    TASKS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tasks.json')

    # 任务处理配置
    MAX_RETRIES = 3
    RETRY_DELAY = 2

    # 并发处理配置
    MAX_WORKERS = int(os.environ.get('MAX_WORKERS', 5))

    # 清理配置（小时）
    CLEANUP_INTERVAL = int(os.environ.get('CLEANUP_INTERVAL', 24))
    MAX_FILE_AGE = int(os.environ.get('MAX_FILE_AGE', 72))

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    FLASK_ENV = 'production'

    # 生产环境安全配置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}