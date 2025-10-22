#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, send_from_directory, jsonify
from api_app import app as api_app
import os

# 创建Flask应用
app = Flask(__name__, static_folder='static', static_url_path='')

# 将API路由注册到应用
app.register_blueprint(api_app)

@app.route('/')
def index():
    """服务前端主页"""
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """服务静态文件"""
    if os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    else:
        # 如果是React Router的路由，返回index.html
        return send_from_directory('static', 'index.html')

@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "message": "产品属性提取助手生产环境运行正常",
        "version": "2.0"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    host = os.environ.get('HOST', '0.0.0.0')

    print(f"Starting production server on {host}:{port}, debug={debug}")
    app.run(debug=debug, host=host, port=port)