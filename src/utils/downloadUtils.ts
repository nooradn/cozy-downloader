import { DownloadItem } from '../types';

export const extractFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let filename = pathname.split('/').pop() || 'download';
    
    // Remove query parameters from filename
    filename = filename.split('?')[0];
    
    // If no extension, try to get from URL or default to .bin
    if (!filename.includes('.')) {
      return `${filename}.bin`;
    }
    
    // Sanitize filename for cross-platform compatibility
    return sanitizeFilename(filename);
  } catch {
    return `download-${Date.now()}.bin`;
  }
};

export const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters for file systems
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const parseUrls = (input: string): string[] => {
  return input
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && validateUrl(url))
    .filter((url, index, array) => array.indexOf(url) === index); // Remove duplicates
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatFileSize(bytesPerSecond)}/s`;
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeFilename(filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL after a delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const estimateTimeRemaining = (
  downloadedSize: number,
  totalSize: number,
  startTime: number
): number => {
  if (downloadedSize === 0 || totalSize === 0) return 0;
  
  const elapsed = Date.now() - startTime;
  const speed = downloadedSize / elapsed; // bytes per ms
  const remaining = totalSize - downloadedSize;
  
  return remaining / speed;
};

export const detectFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const types = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'],
    document: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
    spreadsheet: ['xls', 'xlsx', 'csv', 'ods', 'numbers'],
    presentation: ['ppt', 'pptx', 'odp', 'key'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
    audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'],
    archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'],
    executable: ['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'appimage']
  };

  for (const [type, extensions] of Object.entries(types)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }
  
  return 'other';
};