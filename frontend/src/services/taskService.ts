import { Task, ProcessingConfig, FileData, ProcessingResult } from '@/types';

// API 基础URL（局域网友好）
// 开发环境：使用当前页面的主机名 + 5001 端口，避免其他设备访问时指向自身 localhost
// 生产环境：使用相对路径，由反向代理/同域部署提供 /api 前缀
const isProd = typeof import.meta !== 'undefined' ? import.meta.env.PROD : process.env.NODE_ENV === 'production';
const apiOrigin = `${window.location.protocol}//${window.location.hostname}:5001`;
const API_BASE_URL = isProd ? '/api' : `${apiOrigin}/api`;

// 预览文件
export const previewFile = async (file: File): Promise<FileData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/preview`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '预览文件失败');
  }

  const data = await response.json();
  return {
    columns: data.columns,
    rows: data.rows,
    filename: data.filename
  };
};

// 创建任务
export const createTask = async (file: File, config: ProcessingConfig): Promise<Task> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('textColumns', JSON.stringify(config.textColumns));
  formData.append('attributes', JSON.stringify(config.attributes));
  formData.append('customPrompts', JSON.stringify(config.customPrompts));
  formData.append('apiKey', config.apiKey);
  formData.append('provider', config.provider);

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '创建任务失败');
  }

  const data = await response.json();
  return {
    id: data.id,
    filename: data.filename,
    status: data.status as Task['status'],
    progress: data.progress,
    config,
    createdAt: new Date(data.createdAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    errorMessage: data.errorMessage,
    downloadUrl: data.downloadUrl,
  };
};

// 获取任务状态
export const getTask = async (taskId: string): Promise<Task | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      const error = await response.json();
      throw new Error(error.error || '获取任务失败');
    }

    const data = await response.json();
    return {
      id: data.id,
      filename: data.filename,
      status: data.status as Task['status'],
      progress: data.progress,
      config: data.config,
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      errorMessage: data.errorMessage,
      downloadUrl: data.downloadUrl,
    };
  } catch (error) {
    console.error('获取任务状态失败:', error);
    return undefined;
  }
};

// 获取所有任务
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取任务列表失败');
    }

    const data = await response.json();
    return data.map((task: any) => ({
      id: task.id,
      filename: task.filename,
      status: task.status as Task['status'],
      progress: task.progress,
      config: task.config || {},
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      errorMessage: task.errorMessage,
      downloadUrl: task.downloadUrl,
    }));
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return [];
  }
};

// 下载结果文件
export const downloadResult = async (taskId: string): Promise<void> => {
  const task = await getTask(taskId);
  if (!task || task.status !== 'completed') {
    throw new Error('任务未完成或不存在');
  }

  const downloadUrl = task.downloadUrl;
  if (!downloadUrl) {
    throw new Error('下载链接不存在');
  }

  // 生成正确的绝对URL
  let href = downloadUrl;
  if (!downloadUrl.startsWith('http')) {
    const origin = apiOrigin; // 与API_BASE_URL同源
    href = `${origin}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = task.filename.replace(/\.[^/.]+$/, '_enhanced.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 轮询任务状态
export const pollTaskStatus = (
  taskId: string,
  onUpdate: (task: Task) => void,
  interval: number = 2000
): () => void => {
  let isPolling = true;
  let timeoutId: NodeJS.Timeout;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const task = await getTask(taskId);
      if (task) {
        onUpdate(task);
        
        // 如果任务已完成或出错，停止轮询
        if (task.status === 'completed' || task.status === 'error') {
          isPolling = false;
          return;
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }

    if (isPolling) {
      timeoutId = setTimeout(poll, interval);
    }
  };

  // 开始轮询
  poll();

  // 返回停止轮询的函数
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};

// API健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// 兼容旧版本的函数
export const processFileAsync = async (
  taskId: string,
  fileData: FileData,
  config: ProcessingConfig
): Promise<ProcessingResult> => {
  // 这个函数现在通过 createTask 和轮询来实现
  throw new Error('请使用 createTask 和 pollTaskStatus 函数');
};

export const updateTaskStatus = (
  taskId: string, 
  status: Task['status'], 
  progress?: number,
  errorMessage?: string
) => {
  // 这个函数现在由后端API管理
  console.warn('updateTaskStatus 现在由后端API管理，无需手动调用');
};