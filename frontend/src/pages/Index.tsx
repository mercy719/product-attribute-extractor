import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '@/components/FileUpload';
import { FilePreview } from '@/components/FilePreview';
import { ProcessingConfig } from '@/components/ProcessingConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { FileData, ProcessingConfig as Config } from '@/types';
import { createTask } from '@/services/taskService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelected = (data: FileData, file: File) => {
    setFileData(data);
    setSelectedFile(file);
    toast({
      title: "文件上传成功",
      description: `已加载 ${data.filename}，包含 ${data.rows.length} 行数据`
    });
  };

  const handleStartProcessing = async (config: Config) => {
    if (!fileData || !selectedFile) return;

    try {
      const task = await createTask(selectedFile, config);
      
      toast({
        title: "任务已创建",
        description: `任务 ID: ${task.id.slice(0, 8)}...`
      });
      
      // 跳转到任务详情页
      navigate(`/task/${task.id}`);
    } catch (error) {
      toast({
        title: "任务创建失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">产品属性增强工具</h1>
            <p className="text-lg text-muted-foreground">
              基于AI的智能产品属性提取与标准化系统
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/tasks')}
          >
            <History className="h-4 w-4 mr-2" />
            任务历史
          </Button>
        </div>

        {/* 功能特性 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="secondary">Excel/CSV 文件支持</Badge>
          <Badge variant="secondary">AI 智能提取</Badge>
          <Badge variant="secondary">中文统一输出</Badge>
          <Badge variant="secondary">多线程处理</Badge>
          <Badge variant="secondary">实时进度监控</Badge>
        </div>

        {/* 主要内容 */}
        <div className="space-y-8">
          {/* 步骤1: 文件上传 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h2 className="text-2xl font-semibold">文件上传</h2>
            </div>
            <FileUpload onFileSelected={handleFileSelected} />
          </div>

          {/* 步骤2: 文件预览 */}
          {fileData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-2xl font-semibold">文件预览</h2>
              </div>
              <FilePreview fileData={fileData} />
            </div>
          )}

          {/* 步骤3: 处理配置 */}
          {fileData && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="text-2xl font-semibold">处理配置</h2>
              </div>
              <ProcessingConfig 
                fileData={fileData}
                onStartProcessing={handleStartProcessing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
