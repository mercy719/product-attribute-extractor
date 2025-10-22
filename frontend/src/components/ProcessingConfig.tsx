import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, ChevronDown, ChevronRight, Play, Check, Wand2, Loader2 } from 'lucide-react';
import { FileData, ProcessingConfig as Config } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ProcessingConfigProps {
  fileData: FileData;
  onStartProcessing: (config: Config) => void;
}

const defaultAttributes = `品牌
颜色
容量
功率
重量
材质`;

const defaultCustomPrompts = `{
  "颜色": "请提取产品的主要颜色，统一使用中文表达",
  "容量": "请提取容量信息，统一使用L（升）为单位",
  "功率": "请提取功率信息，统一使用W（瓦特）为单位"
}`;

export const ProcessingConfig = ({ fileData, onStartProcessing }: ProcessingConfigProps) => {
  const { toast } = useToast();
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [attributes, setAttributes] = useState(defaultAttributes);
  const [confirmedAttributes, setConfirmedAttributes] = useState<string[]>([]);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [productType, setProductType] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('deepseek');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [attributesConfirmed, setAttributesConfirmed] = useState(false);

  const handleColumnToggle = (column: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns(prev => [...prev, column]);
    } else {
      setSelectedColumns(prev => prev.filter(col => col !== column));
    }
  };

  const handleConfirmAttributes = () => {
    const attributeList = attributes.split('\n').filter(attr => attr.trim());
    if (attributeList.length === 0) {
      toast({
        title: "错误",
        description: "请先输入要提取的属性",
        variant: "destructive",
      });
      return;
    }
    
    setConfirmedAttributes(attributeList);
    setAttributesConfirmed(true);
    setShowAdvanced(true);
    
    // 初始化空的自定义提示
    const initialPrompts: Record<string, string> = {};
    attributeList.forEach(attr => {
      initialPrompts[attr] = '';
    });
    setCustomPrompts(initialPrompts);
    
    toast({
      title: "属性已确认",
      description: `已确认 ${attributeList.length} 个属性，可以在高级选项中自定义提示`,
    });
  };

  const handleGeneratePrompts = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "错误",
        description: "请先输入 API 密钥",
        variant: "destructive",
      });
      return;
    }
    
    if (!productType.trim()) {
      toast({
        title: "错误", 
        description: "请先输入产品类型",
        variant: "destructive",
      });
      return;
    }
    
    if (confirmedAttributes.length === 0) {
      toast({
        title: "错误",
        description: "请先确认要提取的属性",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompts(true);
    
    // 显示开始生成的提示
    toast({
      title: "开始生成",
      description: `正在为 ${confirmedAttributes.length} 个属性生成自定义提示词...`,
    });
    
    try {
      // 构建AI提示词
      const systemPrompt = `你是一位顶级的"提示词工程师"（Prompt Engineer），擅长将复杂的信息提取任务分解成一系列精确、高效、结构化的子任务提示词。

你的核心任务是：根据用户提供的"产品类型"和"属性列表"，为每一个属性生成一个独立的、用于AI信息提取的Prompt。

你生成的每一个Prompt都必须严格遵循以下【六大设计原则】：

### 【六大设计原则】

1. **原子性原则 (Atomicity):**
   - 一个Prompt只负责提取一个属性，确保任务单一、专注、准确。
2. **角色定义原则 (Role Definition):**
   - 每个Prompt的开头都应为AI设定一个清晰的角色，例如"你是一个严谨的产品信息提取助手"，以引导其行为模式。
3. **格式锁定原则 (Strict Formatting):**
   - 必须明确规定输出的格式，并提供一个清晰的例如：...。
   - 对于数值，要规定格式，如 [数值]X 或 ±[数值] 码。
   - 对于文本，要规定分隔符，如 "黑色, 银色"。
4. **单位标准化原则 (Unit Standardization):**
   - 对于包含单位的属性（如重量、尺寸、距离），必须指定一个标准输出单位。
   - 如果原文中出现其他单位，Prompt中必须包含换算指令（例如，米换算成码）。
5. **缺省值处理原则 (Handling Null Values):**
   - 对于描述性信息（如颜色、材质、范围）：如果原文未提及，必须严格要求AI回答一个统一的标识符，如 "未提及"。
   - 对于功能性有无（如旗杆锁定、震动提示）：如果原文未提及，应视为"不具备"，严格要求AI回答 "是" 或 "否"。这比回答"未提及"更有利于直接判断。
6. **模板化原则 (Templating):**
   - 每个生成的Prompt末尾都要包含一个清晰的占位符 [此处插入产品描述]，方便用户直接复制使用。

请为以下产品类型和属性生成提示词，输出格式为JSON：{"属性名": "提示词内容"}`;

      const userPrompt = `产品类型：${productType}\n属性列表：\n${confirmedAttributes.map(attr => `- ${attr}`).join('\n')}`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI响应为空');
      }
      
      // 添加调试信息
      console.log('AI原始响应:', content);
      console.log('要生成的属性:', confirmedAttributes);

      // 尝试解析JSON响应
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const generatedPrompts = JSON.parse(jsonMatch[0]);
          
          // 只更新AI返回的属性，保留已填写的其他属性
          setCustomPrompts(prev => {
            const updated = { ...prev };
            const successfullyGenerated = [];
            
            Object.keys(generatedPrompts).forEach(attr => {
              if (generatedPrompts[attr] && generatedPrompts[attr].trim()) {
                updated[attr] = generatedPrompts[attr];
                successfullyGenerated.push(attr);
              }
            });
            
            console.log('成功生成的属性:', successfullyGenerated);
            console.log('生成的提示词内容:', generatedPrompts);
            
            return updated;
          });
          
          const updatedCount = Object.keys(generatedPrompts).filter(attr => 
            generatedPrompts[attr] && generatedPrompts[attr].trim()
          ).length;
          
          // 检查是否有未生成的属性
          const missingAttributes = confirmedAttributes.filter(attr => 
            !generatedPrompts[attr] || !generatedPrompts[attr].trim()
          );
          
          if (updatedCount > 0) {
            toast({
              title: "生成成功",
              description: `AI已自动生成 ${updatedCount} 个属性的自定义提示词${
                missingAttributes.length > 0 ? `，${missingAttributes.length} 个属性需要手动填写` : ''
              }`,
            });
          } else {
            toast({
              title: "生成失败",
              description: "AI未能生成有效的提示词，请手动填写",
              variant: "destructive",
            });
          }
        } else {
          throw new Error('无法解析AI响应');
        }
      } catch (parseError) {
        console.error('解析错误:', parseError);
        toast({
          title: "解析错误",
          description: "AI响应格式异常，请手动填写提示词",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('生成提示词失败:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const validateConfig = (): string | null => {
    if (selectedColumns.length === 0) {
      return '请至少选择一个文本列进行分析';
    }
    
    if (!attributesConfirmed) {
      return '请先确认要提取的属性';
    }
    
    if (!apiKey.trim()) {
      return '请输入 API 密钥';
    }

    return null;
  };

  const handleStartProcessing = () => {
    const error = validateConfig();
    if (error) {
      toast({
        title: "验证失败",
        description: error,
        variant: "destructive",
      });
      return;
    }

    const config: Config = {
      textColumns: selectedColumns,
      attributes: confirmedAttributes,
      customPrompts: customPrompts,
      apiKey,
      provider
    };

    onStartProcessing(config);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          处理配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 选择文本列 */}
        <div>
          <Label className="text-base font-medium">选择要分析的文本列</Label>
          <p className="text-sm text-muted-foreground mb-3">
            选择包含产品描述信息的列，可以选择多个
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fileData.columns.map((column, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${index}`}
                  checked={selectedColumns.includes(column)}
                  onCheckedChange={(checked) => 
                    handleColumnToggle(column, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`column-${index}`}
                  className="text-sm truncate cursor-pointer"
                  title={column}
                >
                  {column || `列${index + 1}`}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 要提取的属性 */}
        <div>
          <Label htmlFor="attributes" className="text-base font-medium">
            要提取的属性
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            每行输入一个属性名称
          </p>
          <Textarea
            id="attributes"
            value={attributes}
            onChange={(e) => {
              setAttributes(e.target.value);
              setAttributesConfirmed(false);
            }}
            rows={6}
            placeholder="品牌&#10;颜色&#10;容量&#10;功率&#10;重量&#10;材质"
            disabled={attributesConfirmed}
          />
          <div className="mt-3">
            <Button 
              onClick={handleConfirmAttributes}
              variant={attributesConfirmed ? "secondary" : "default"}
              disabled={attributesConfirmed}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              {attributesConfirmed ? '属性已确认' : '确认属性'}
            </Button>
          </div>
          {attributesConfirmed && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-2">已确认的属性：</p>
              <div className="flex flex-wrap gap-2">
                {confirmedAttributes.map((attr, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded">
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 高级选项 */}
        {attributesConfirmed && (
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0">
                {showAdvanced ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                显示高级选项
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* 产品类型输入 */}
              <div>
                <Label htmlFor="productType" className="text-base font-medium">
                  产品类型
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  请输入产品类型，用于AI自动生成提示词
                </p>
                <Input
                  id="productType"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="例如：智能手机、无人机、家用电器等"
                />
              </div>

              {/* AI生成按钮 */}
              <div>
                <Button 
                  onClick={handleGeneratePrompts}
                  disabled={isGeneratingPrompts || !apiKey.trim() || !productType.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingPrompts ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isGeneratingPrompts ? 'AI生成中...' : '帮我填写'}
                </Button>
              </div>

              {/* 自定义提示 */}
              <div>
                <Label className="text-base font-medium">
                  自定义提示（可选）
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  为每个属性自定义提取说明
                </p>
                <div className="space-y-3">
                  {confirmedAttributes.map((attr, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`prompt-${index}`} className="text-sm font-medium">
                        {attr}
                      </Label>
                      <Textarea
                        id={`prompt-${index}`}
                        value={customPrompts[attr] || ''}
                        onChange={(e) => setCustomPrompts(prev => ({
                          ...prev,
                          [attr]: e.target.value
                        }))}
                        rows={3}
                        placeholder={`为 "${attr}" 属性编写提取提示词...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* API 配置 */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">API 配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider">服务提供商</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="apiKey">API 密钥</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入 API 密钥"
              />
            </div>
          </div>
        </div>

        {/* 开始处理按钮 */}
        <div className="pt-4">
          <Button 
            onClick={handleStartProcessing}
            disabled={isValidating}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isValidating ? '验证中...' : '开始处理'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};