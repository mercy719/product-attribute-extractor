import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TaskStatus } from '@/components/TaskStatus';
import { getTask, pollTaskStatus, downloadResult } from '@/services/taskService';
import { Task } from '@/types';

export const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (taskId) {
      // 初始加载任务数据
      const loadTask = async () => {
        const taskData = await getTask(taskId);
        setTask(taskData || null);
      };
      loadTask();
      
      // 开始轮询任务状态
      const stopPolling = pollTaskStatus(taskId, (updatedTask) => {
        setTask(updatedTask);
      });

      return stopPolling;
    }
  }, [taskId]);

  const handleDownload = async () => {
    if (!taskId) return;
    
    try {
      await downloadResult(taskId);
    } catch (error) {
      alert(error instanceof Error ? error.message : '下载失败');
    }
  };

  const handleRestart = () => {
    navigate('/');
  };

  if (!task) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">任务不存在</h1>
          <Button onClick={() => navigate('/tasks')}>
            返回任务列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/tasks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回任务列表
        </Button>
        <h1 className="text-3xl font-bold">任务详情</h1>
      </div>

      <div className="max-w-2xl">
        <TaskStatus
          task={task}
          onDownload={handleDownload}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
};