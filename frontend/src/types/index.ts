export interface FileData {
  columns: string[];
  rows: any[][];
  filename: string;
}

export interface ProcessingConfig {
  textColumns: string[];
  attributes: string[];
  customPrompts: Record<string, string>;
  apiKey: string;
  provider: string;
}

export interface Task {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  config: ProcessingConfig;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  downloadUrl?: string;
}

export interface ProcessingResult {
  taskId: string;
  originalData: any[];
  enhancedData: any[];
  downloadUrl?: string;
}