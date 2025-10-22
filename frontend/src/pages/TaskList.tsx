import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Plus, RefreshCw } from 'lucide-react';
import { getAllTasks } from '@/services/taskService';
import { Task } from '@/types';

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  const loadTasks = async () => {
    const taskList = await getAllTasks();
    setTasks(taskList);
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 2000); // 每2秒刷新
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: Task['status']) => {
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
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">任务管理</h1>
        <div className="flex gap-2">
          <Button onClick={loadTasks} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => navigate('/')}>
            <Plus className="h-4 w-4 mr-2" />
            新建任务
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>所有任务</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无任务记录
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务 ID</TableHead>
                  <TableHead>文件名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-xs">
                      {task.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{task.filename}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{task.progress}%</TableCell>
                    <TableCell>
                      {task.createdAt.toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/task/${task.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};