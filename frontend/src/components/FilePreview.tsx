import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileData } from '@/types';
import { FileText, Database } from 'lucide-react';

interface FilePreviewProps {
  fileData: FileData;
}

export const FilePreview = ({ fileData }: FilePreviewProps) => {
  const previewRows = fileData.rows.slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          文件预览
        </CardTitle>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {fileData.columns.length} 列
          </Badge>
          <Badge variant="secondary">
            {fileData.rows.length} 行数据
          </Badge>
          <Badge variant="outline">
            {fileData.filename}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">列名列表</h4>
            <div className="flex flex-wrap gap-2">
              {fileData.columns.map((column, index) => (
                <Badge key={index} variant="outline">
                  {column || `列${index + 1}`}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">数据预览（前 5 行）</h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fileData.columns.map((column, index) => (
                      <TableHead key={index} className="min-w-[120px]">
                        {column || `列${index + 1}`}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="max-w-[200px] truncate">
                          {cell || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};