#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, jsonify, send_file, session
import pandas as pd
import os
import uuid
import json
import threading
import time
import logging
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

from openai import OpenAI
from config import config

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """应用工厂函数"""
    app = Flask(__name__)

    # 加载配置
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app.config.from_object(config[config_name])

    # 创建必要的文件夹
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

    # 全局变量
    processing_tasks = {}

    def allowed_file(filename):
        """检查文件类型是否允许上传"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

    def load_tasks():
        """从文件加载任务状态"""
        nonlocal processing_tasks
        if os.path.exists(app.config['TASKS_FILE']):
            try:
                with open(app.config['TASKS_FILE'], 'r', encoding='utf-8') as f:
                    processing_tasks = json.load(f)
                logger.info(f"成功加载 {len(processing_tasks)} 个任务状态")
            except Exception as e:
                logger.error(f"加载任务状态失败: {str(e)}")
                processing_tasks = {}

    def save_tasks():
        """保存任务状态到文件"""
        try:
            with open(app.config['TASKS_FILE'], 'w', encoding='utf-8') as f:
                json.dump(processing_tasks, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"保存任务状态失败: {str(e)}")

    def save_tasks_periodically():
        """定期保存任务状态"""
        while True:
            time.sleep(30)  # 每30秒保存一次
            save_tasks()

    def update_task_status(task_id, status, progress=None, output_file=None, error=None):
        """更新任务状态并保存"""
        if task_id in processing_tasks:
            processing_tasks[task_id]['status'] = status
            if progress is not None:
                processing_tasks[task_id]['progress'] = progress
            if output_file is not None:
                processing_tasks[task_id]['output_file'] = output_file
            if error is not None:
                processing_tasks[task_id]['error'] = error
            processing_tasks[task_id]['last_update'] = datetime.now().isoformat()
            save_tasks()

    def create_llm_client(api_key=None, provider="deepseek"):
        """创建LLM客户端"""
        if not api_key:
            if provider == "deepseek":
                api_key = app.config['DEEPSEEK_API_KEY']
            else:
                api_key = app.config['OPENAI_API_KEY']

        if not api_key:
            raise ValueError(f"未找到{provider}的API密钥")

        if provider == "deepseek":
            return OpenAI(
                api_key=api_key,
                base_url="https://api.deepseek.com/v1",
            )
        else:
            return OpenAI(api_key=api_key)

    def extract_attributes_with_llm(product_info, attributes_to_extract, llm_client, provider="deepseek", custom_prompts=None):
        """使用LLM提取产品属性"""
        # 构建属性提取提示
        attributes_text = ""
        for i, attr in enumerate(attributes_to_extract):
            attributes_text += f"{i+1}. {attr}"
            if custom_prompts and attr in custom_prompts and custom_prompts[attr]:
                attributes_text += f"（{custom_prompts[attr]}）"
            attributes_text += "\n"

        prompt = f"""请你作为产品数据分析专家，从以下产品信息中提取关键属性。只需提取确定存在的属性，不确定的请留空。

产品信息:
{product_info}

请提取以下属性并以JSON格式输出:
{attributes_text}

输出要求:
1. 请统一使用中文输出结果，无论原始数据是德语、日语还是英语
2. 请使用统一的计量单位，例如：
   - 容量：统一使用"L"（升）为单位
   - 重量：统一使用"kg"（千克）为单位
   - 功率：统一使用"W"（瓦特）为单位
   - 长度：统一使用"cm"（厘米）为单位
   - 温度：统一使用"°C"（摄氏度）为单位
3. 请将数值与单位之间不要有空格，如"1.5L"而不是"1.5 L"
4. 请保持数值的精确性，但小数点后最多保留1位
5. 颜色统一使用中文表达，例如将"black"、"schwarz"、"noir"、"黒"(日文黑色)等统一转换为"黑色"

必须以下面的JSON格式回答:
{{"""

        for attr in attributes_to_extract:
            prompt += f'  "{attr}": "对应的值",\n'

        prompt = prompt.rstrip(",\n")
        prompt += """
}}

只能填入你确定的信息，不确定的属性必须留空(null)。不要添加任何额外解释，直接输出JSON。"""

        for attempt in range(app.config['MAX_RETRIES']):
            try:
                messages = [{"role": "user", "content": []}]
                messages[0]["content"].append({
                    "type": "text",
                    "text": prompt
                })

                model = "deepseek-chat" if provider == "deepseek" else "gpt-4o"

                response = llm_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )

                result = response.choices[0].message.content

                try:
                    attributes = json.loads(result)
                    return attributes
                except json.JSONDecodeError:
                    import re
                    match = re.search(r'({.*})', result.replace('\n', ''), re.DOTALL)
                    if match:
                        try:
                            attributes = json.loads(match.group(1))
                            return attributes
                        except:
                            pass

                    if attempt < app.config['MAX_RETRIES'] - 1:
                        time.sleep(app.config['RETRY_DELAY'])
                        continue
                    else:
                        return {}

            except Exception as e:
                logger.error(f"LLM API请求出错: {str(e)}")
                if attempt < app.config['MAX_RETRIES'] - 1:
                    time.sleep(app.config['RETRY_DELAY'])
                else:
                    return {}

        return {}

    def process_file(file_path, text_columns, attributes_to_extract, api_key, provider, task_id, custom_prompts=None):
        """处理文件并提取属性"""
        try:
            update_task_status(task_id, '正在处理', progress=0)

            llm_client = create_llm_client(api_key, provider)

            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)

            total_rows = len(df)

            for attr in attributes_to_extract:
                if attr not in df.columns:
                    df[attr] = None

            checkpoint_file = os.path.join(app.config['RESULT_FOLDER'], f"{task_id}_checkpoint.json")
            processed_rows = set()

            if os.path.exists(checkpoint_file):
                try:
                    with open(checkpoint_file, 'r', encoding='utf-8') as f:
                        checkpoint_data = json.load(f)
                        processed_rows = set(checkpoint_data.get('processed_rows', []))

                        for row_data in checkpoint_data.get('row_data', []):
                            idx = row_data['index']
                            for attr, value in row_data['attributes'].items():
                                if attr in df.columns:
                                    df.at[idx, attr] = value

                    logger.info(f"从检查点恢复，已处理 {len(processed_rows)} 行")
                except Exception as e:
                    logger.error(f"读取检查点失败: {str(e)}")

            from concurrent.futures import ThreadPoolExecutor
            import threading

            lock = threading.Lock()

            def process_row(idx, row):
                if idx in processed_rows:
                    return

                text_to_extract = ""
                for field in text_columns:
                    if field in df.columns and pd.notna(row[field]):
                        text_to_extract += f"{field}: {row[field]}\n\n"

                if text_to_extract:
                    attributes = extract_attributes_with_llm(
                        text_to_extract,
                        attributes_to_extract,
                        llm_client,
                        provider,
                        custom_prompts
                    )

                    with lock:
                        for attr, value in attributes.items():
                            if attr in df.columns and value is not None and value != "null":
                                df.at[idx, attr] = value

                        processed_rows.add(idx)
                        progress = int(len(processed_rows) / total_rows * 100)
                        update_task_status(task_id, '正在处理', progress=progress)

                        checkpoint_data = {
                            'processed_rows': list(processed_rows),
                            'row_data': [{
                                'index': idx,
                                'attributes': attributes
                            }]
                        }
                        with open(checkpoint_file, 'w', encoding='utf-8') as f:
                            json.dump(checkpoint_data, f, ensure_ascii=False)

            with ThreadPoolExecutor(max_workers=app.config['MAX_WORKERS']) as executor:
                futures = []
                for idx, row in df.iterrows():
                    if idx not in processed_rows:
                        futures.append(executor.submit(process_row, idx, row))

                for future in futures:
                    try:
                        future.result()
                    except Exception as e:
                        logger.error(f"处理行时出错: {str(e)}")

            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_file = os.path.join(
                app.config['RESULT_FOLDER'],
                f"{os.path.splitext(os.path.basename(file_path))[0]}_enhanced_{timestamp}.xlsx"
            )

            df.to_excel(output_file, index=False)

            update_task_status(task_id, '已完成', progress=100, output_file=output_file)

            if os.path.exists(checkpoint_file):
                os.remove(checkpoint_file)

        except Exception as e:
            update_task_status(task_id, '出错', error=str(e))
            logger.error(f"处理文件时出错: {str(e)}")

    # 启动时加载任务状态
    load_tasks()

    # 启动定期保存任务状态的线程
    save_thread = threading.Thread(target=save_tasks_periodically, daemon=True)
    save_thread.start()

    # 路由定义
    @app.route('/')
    def index():
        """首页路由"""
        return render_template('index.html')

    @app.route('/upload', methods=['POST'])
    def upload_file():
        """文件上传处理"""
        if 'file' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            task_id = str(uuid.uuid4())
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{task_id}_{filename}")
            file.save(file_path)

            data = request.form.to_dict()
            text_columns = json.loads(data.get('textColumns', '[]'))
            attributes_to_extract = json.loads(data.get('attributesToExtract', '[]'))
            api_key = data.get('apiKey')
            provider = data.get('provider', 'deepseek')

            custom_prompts = None
            if 'customPrompts' in data and data.get('customPrompts'):
                try:
                    custom_prompts = json.loads(data.get('customPrompts', '{}'))
                except json.JSONDecodeError:
                    logger.error("解析自定义提示时出错，将使用默认提示")

            processing_tasks[task_id] = {
                'id': task_id,
                'filename': filename,
                'file_path': file_path,
                'status': '等待处理',
                'progress': 0,
                'start_time': datetime.now().isoformat(),
                'text_columns': text_columns,
                'attributes_to_extract': attributes_to_extract,
                'custom_prompts': custom_prompts,
                'provider': provider
            }

            save_tasks()

            thread = threading.Thread(
                target=process_file,
                args=(file_path, text_columns, attributes_to_extract, api_key, provider, task_id, custom_prompts)
            )
            thread.daemon = True
            thread.start()

            return jsonify({
                'task_id': task_id,
                'message': '文件已上传，正在处理'
            })

        return jsonify({'error': '不支持的文件类型'}), 400

    @app.route('/task/<task_id>', methods=['GET'])
    def get_task_status(task_id):
        """获取任务状态"""
        if task_id not in processing_tasks:
            return jsonify({'error': '任务不存在'}), 404

        task = processing_tasks[task_id]

        response = {
            'id': task['id'],
            'filename': task['filename'],
            'status': task['status'],
            'progress': task['progress'],
            'start_time': task['start_time']
        }

        if 'output_file' in task:
            response['output_file'] = os.path.basename(task['output_file'])

        if 'error' in task:
            response['error'] = task['error']

        return jsonify(response)

    @app.route('/download/<filename>', methods=['GET'])
    def download_file(filename):
        """下载处理结果文件"""
        file_path = os.path.join(app.config['RESULT_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': '文件不存在'}), 404

    @app.route('/tasks', methods=['GET'])
    def list_tasks():
        """列出所有任务"""
        tasks_list = []
        for task_id, task in processing_tasks.items():
            task_info = {
                'id': task['id'],
                'filename': task['filename'],
                'status': task['status'],
                'progress': task['progress'],
                'start_time': task['start_time']
            }

            if 'output_file' in task:
                task_info['output_file'] = os.path.basename(task['output_file'])

            if 'error' in task:
                task_info['error'] = task['error']

            tasks_list.append(task_info)

        return jsonify(tasks_list)

    @app.route('/preview', methods=['POST'])
    def preview_file():
        """预览上传的文件内容"""
        if 'file' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400

        file = request.files['file']
        logger.info(f"预览文件: {file.filename}")

        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400

        if file and allowed_file(file.filename):
            try:
                if file.filename.endswith('.csv'):
                    df = pd.read_csv(file)
                else:
                    df = pd.read_excel(file)

                df = df.fillna("")

                columns = df.columns.tolist()
                preview_data = df.head(5).to_dict('records')

                logger.info(f"成功读取文件，列数: {len(columns)}, 预览行数: {len(preview_data)}")

                return jsonify({
                    'columns': columns,
                    'preview': preview_data
                })
            except Exception as e:
                logger.error(f"预览文件出错: {str(e)}")
                return jsonify({'error': f'读取文件出错: {str(e)}'}), 500

        return jsonify({'error': '不支持的文件类型'}), 400

    @app.route('/health', methods=['GET'])
    def health_check():
        """健康检查端点"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        })

    @app.route('/stats', methods=['GET'])
    def get_stats():
        """获取系统统计信息"""
        total_tasks = len(processing_tasks)
        completed_tasks = sum(1 for task in processing_tasks.values() if task['status'] == '已完成')
        processing_tasks_count = sum(1 for task in processing_tasks.values() if task['status'] in ['正在处理', '等待处理'])
        error_tasks = sum(1 for task in processing_tasks.values() if task['status'] == '出错')

        return jsonify({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'processing_tasks': processing_tasks_count,
            'error_tasks': error_tasks,
            'uptime': datetime.now().isoformat()
        })

    return app

# 创建应用实例
app = create_app()

if __name__ == '__main__':
    # 生产环境配置
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') != 'production'
    host = os.environ.get('HOST', '0.0.0.0')

    logger.info(f"Starting app on {host}:{port}, debug={debug}")
    app.run(debug=debug, host=host, port=port)