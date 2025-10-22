import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  AlertCircle, 
  Download, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { Task } from '@/types';

interface TaskStatusProps {
  task: Task;
  onDownload?: () => void;
  onRestart?: () => void;
}

const StatusIcon = ({ status }: { status: Task['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Play className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'error':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const StatusBadge = ({ status }: { status: Task['status'] }) => {
  const variants = {
    pending: 'secondary' as const,
    processing: 'default' as const,
    completed: 'outline' as const,
    error: 'destructive' as const
  };

  const labels = {
    pending: '等待处理',
    processing: '正在处理',
    completed: '已完成',
    error: '出错'
  };

  return (
    <Badge variant={variants[status]} className="flex items-center gap-1">
      <StatusIcon status={status} />
      {labels[status]}
    </Badge>
  );
};

export const TaskStatus = ({ task, onDownload, onRestart }: TaskStatusProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || currentTime;
    const diff = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          任务状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">任务 ID</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {task.id}
            </code>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">文件名</span>
            <span className="text-sm">{task.filename}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">状态</span>
            <StatusBadge status={task.status} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">创建时间</span>
            <span className="text-sm">
              {task.createdAt.toLocaleString('zh-CN')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">运行时间</span>
            <span className="text-sm">
              {formatDuration(task.createdAt, task.completedAt)}
            </span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">处理进度</span>
            <span className="text-sm">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="w-full" />
        </div>

        {/* 配置信息 */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">配置信息</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">分析列：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.config.textColumns.map((column, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {column}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <span className="font-medium">提取属性：</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.config.attributes.map((attr, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <span className="font-medium">API 提供商：</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {task.config.provider}
              </Badge>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {task.status === 'error' && task.errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{task.errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {task.status === 'completed' && onDownload && (
            <Button onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              下载结果
            </Button>
          )}
          
          {(task.status === 'error' || task.status === 'completed') && onRestart && (
            <Button onClick={onRestart} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              重新处理
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};