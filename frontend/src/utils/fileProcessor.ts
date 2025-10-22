import * as XLSX from 'xlsx';
import { FileData } from '@/types';

export const parseFile = async (file: File): Promise<FileData> => {
  const filename = file.name;
  
  if (file.type === 'text/csv' || filename.endsWith('.csv')) {
    return await parseCSV(file, filename);
  } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
    return await parseExcel(file, filename);
  } else {
    throw new Error('不支持的文件格式。请上传 .xlsx、.xls 或 .csv 文件。');
  }
};

const parseCSV = async (file: File, filename: string): Promise<FileData> => {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('文件为空');
  }
  
  const columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );
  
  return { columns, rows, filename };
};

const parseExcel = async (file: File, filename: string): Promise<FileData> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length === 0) {
    throw new Error('工作表为空');
  }
  
  const columns = (jsonData[0] as any[]).map(col => String(col || '').trim());
  const rows = jsonData.slice(1).map(row => 
    (row as any[]).map(cell => String(cell || '').trim())
  );
  
  return { columns, rows, filename };
};

export const validateFile = (file: File): string | null => {
  if (file.size > 16 * 1024 * 1024) {
    return '文件大小不能超过 16MB';
  }
  
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return '请上传 Excel (.xlsx, .xls) 或 CSV 文件';
  }
  
  return null;
};