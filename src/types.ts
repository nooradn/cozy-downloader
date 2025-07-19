export interface DownloadItem {
  id: string;
  url: string;
  filename: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  error?: string;
  httpStatus?: number;
  fileSize?: number;
  downloadedSize?: number;
  blob?: Blob;
  startTime?: number;
  endTime?: number;
  retryCount?: number;
  isUsingProxy?: boolean;
  proxyType?: 'primary' | 'secondary';
}

export interface DownloadStats {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  totalSize: number;
  downloadedSize: number;
  averageSpeed: number;
}

export interface DownloadConfig {
  batchSize: number;
  intervalMs: number;
  maxRetries: number;
  timeout: number;
  useProxy: boolean; // New proxy setting
}

export interface ZipConfig {
  enabled: boolean;
  baseName: string;
}

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'storage' | 'unknown';
  timestamp: number;
}