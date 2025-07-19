import React, { useState } from 'react';
import { DownloadItem as DownloadItemType } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Clock, 
  Trash2,
  AlertCircle,
  FileText,
  RotateCcw,
  Zap,
  DownloadCloud,
  ExternalLink,
  Shield,
  Globe
} from 'lucide-react';
import { formatFileSize, formatSpeed, formatDuration, detectFileType } from '../utils/downloadUtils';
import { ProxyInfoDialog } from './ProxyInfoDialog';

interface DownloadItemProps {
  item: DownloadItemType;
  onRemove: (id: string) => void;
  onDownloadFile?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

export const DownloadItem: React.FC<DownloadItemProps> = ({ 
  item, 
  onRemove, 
  onDownloadFile,
  viewMode = 'list' 
}) => {
  const [showProxyInfo, setShowProxyInfo] = useState(false);

  const getStatusIcon = () => {
    switch (item.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return item.retryCount && item.retryCount > 0 ? 
          <RotateCcw className="w-5 h-5 text-orange-600" /> :
          <XCircle className="w-5 h-5 text-red-600" />;
      case 'downloading':
        return <Download className="w-5 h-5 text-amber-600 dark:text-blue-600 animate-bounce" />;
      default:
        return <Clock className="w-5 h-5 text-stone-400 dark:text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'completed':
        return 'border-green-200 dark:border-green-700 bg-green-50/90 dark:bg-green-900/20';
      case 'error':
        return item.retryCount && item.retryCount > 0 ?
          'border-orange-200 dark:border-orange-700 bg-orange-50/90 dark:bg-orange-900/20' :
          'border-red-200 dark:border-red-700 bg-red-50/90 dark:bg-red-900/20';
      case 'downloading':
        return 'border-amber-200 dark:border-blue-700 bg-amber-50/90 dark:bg-blue-900/20';
      default:
        return 'border-amber-200/50 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90';
    }
  };

  const getProgressBarColor = () => {
    switch (item.status) {
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'downloading':
        return 'bg-gradient-to-r from-amber-600 to-orange-700 dark:from-blue-600 dark:to-indigo-700';
      default:
        return 'bg-stone-300 dark:bg-slate-600';
    }
  };

  const getFileTypeIcon = () => {
    const type = detectFileType(item.filename);
    // You could return different icons based on file type
    return <FileText className="w-4 h-4 text-amber-600 dark:text-blue-400" />;
  };

  const calculateSpeed = () => {
    if (item.status === 'downloading' && item.startTime && item.downloadedSize) {
      const elapsed = (Date.now() - item.startTime) / 1000; // seconds
      return item.downloadedSize / elapsed; // bytes per second
    }
    return 0;
  };

  const calculateETA = () => {
    if (item.status === 'downloading' && item.startTime && item.fileSize && item.downloadedSize) {
      const speed = calculateSpeed();
      if (speed > 0) {
        const remaining = item.fileSize - item.downloadedSize;
        return remaining / speed * 1000; // milliseconds
      }
    }
    return 0;
  };

  const isCorsError = item.error?.includes('CORS blocked');
  const isNetworkError = item.error?.includes('Network error') || item.error?.includes('Failed to fetch');

  const openInBrowser = () => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  // Convert HTTP status codes to readable text
  const getStatusText = (httpStatus: number): string => {
    switch (httpStatus) {
      case 200: return 'OK';
      case 201: return 'Created';
      case 202: return 'Accepted';
      case 204: return 'No Content';
      case 301: return 'Moved';
      case 302: return 'Found';
      case 304: return 'Not Modified';
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 429: return 'Rate Limited';
      case 500: return 'Server Error';
      case 502: return 'Bad Gateway';
      case 503: return 'Unavailable';
      case 504: return 'Timeout';
      default: return httpStatus.toString();
    }
  };

  const getProxyBadgeColor = () => {
    if (item.proxyType === 'primary') {
      return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    } else if (item.proxyType === 'secondary') {
      return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300';
    }
    return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
  };

  const getProxyBadgeText = () => {
    return 'Proxy';
  };

  const handleProxyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProxyInfo(true);
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className={`p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${getStatusColor()}`}>
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                {getFileTypeIcon()}
              </div>
              <div className="flex gap-1">
                {item.status === 'completed' && item.blob && onDownloadFile && (
                  <button
                    onClick={() => onDownloadFile(item.id)}
                    className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                    title="Download file"
                  >
                    <DownloadCloud className="w-4 h-4" />
                  </button>
                )}
                {(isCorsError || isNetworkError) && (
                  <button
                    onClick={openInBrowser}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                    title="Open in browser"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 text-stone-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <h3 className="font-semibold text-amber-900 dark:text-slate-100 text-sm truncate">{item.filename}</h3>
              </div>
              
              <p className="text-xs text-amber-800 dark:text-slate-300 truncate">{item.url}</p>
              
              {/* Status Labels - Maximum 2 labels */}
              <div className="flex flex-wrap gap-2 text-xs">
                {/* First label: HTTP Status (if successful) or Retry count (if retrying) */}
                {item.httpStatus && item.httpStatus >= 200 && item.httpStatus < 300 && !item.retryCount ? (
                  <span className="px-2 py-1 rounded-full font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    {getStatusText(item.httpStatus)}
                  </span>
                ) : item.retryCount && item.retryCount > 0 ? (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                    Retry {item.retryCount}
                  </span>
                ) : item.httpStatus && item.httpStatus >= 400 ? (
                  <span className="px-2 py-1 rounded-full font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    {getStatusText(item.httpStatus)}
                  </span>
                ) : null}

                {/* Second label: Proxy (if used) - Clickable */}
                {item.isUsingProxy && (
                  <button
                    onClick={handleProxyClick}
                    className={`px-2 py-1 rounded-full font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer ${getProxyBadgeColor()}`}
                    title="Click to learn why we use proxies"
                  >
                    <Globe className="w-3 h-3" />
                    {getProxyBadgeText()}
                  </button>
                )}
              </div>

              {item.error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs truncate">{item.error}</span>
                </div>
              )}

              {isCorsError && (
                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                  💡 Try opening the file directly in your browser
                </div>
              )}
            </div>

            {/* Progress */}
            {(item.status === 'downloading' || item.status === 'completed') && item.progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-amber-800 dark:text-slate-300">Progress</span>
                  <span className="font-medium text-amber-900 dark:text-slate-100">{Math.round(item.progress)}%</span>
                </div>
                <div className="w-full bg-amber-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 transition-all duration-300 ease-out ${getProgressBarColor()}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                
                {/* Speed and ETA below progress bar */}
                {item.status === 'downloading' && (
                  <div className="flex justify-between text-xs text-amber-700 dark:text-slate-400">
                    {calculateSpeed() > 0 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{formatSpeed(calculateSpeed())}</span>
                      </div>
                    )}
                    {calculateETA() > 0 && (
                      <span>ETA: {formatDuration(calculateETA())}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Proxy Info Dialog */}
        <ProxyInfoDialog 
          isOpen={showProxyInfo} 
          onClose={() => setShowProxyInfo(false)}
          proxyType={item.proxyType}
        />
      </>
    );
  }

  // List view (enhanced)
  return (
    <>
      <div className={`p-4 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${getStatusColor()}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
              {getFileTypeIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon()}
                <h3 className="font-semibold text-amber-900 dark:text-slate-100 truncate">{item.filename}</h3>
                
                {/* Status Labels - Maximum 2 labels */}
                {/* First label: HTTP Status (if successful) or Retry count (if retrying) */}
                {item.httpStatus && item.httpStatus >= 200 && item.httpStatus < 300 && !item.retryCount ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    {getStatusText(item.httpStatus)}
                  </span>
                ) : item.retryCount && item.retryCount > 0 ? (
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                    Retry {item.retryCount}
                  </span>
                ) : item.httpStatus && item.httpStatus >= 400 ? (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    {getStatusText(item.httpStatus)}
                  </span>
                ) : null}

                {/* Second label: Proxy (if used) - Clickable */}
                {item.isUsingProxy && (
                  <button
                    onClick={handleProxyClick}
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer ${getProxyBadgeColor()}`}
                    title="Click to learn why we use proxies"
                  >
                    <Globe className="w-3 h-3" />
                    {getProxyBadgeText()}
                  </button>
                )}
              </div>
              
              <p className="text-sm text-amber-800 dark:text-slate-300 truncate mb-2">{item.url}</p>
              
              {/* File size info */}
              {item.fileSize && item.fileSize > 0 && (
                <div className="text-xs text-amber-700 dark:text-slate-400 mb-2">
                  {item.downloadedSize && item.fileSize && item.status === 'downloading' ? (
                    <span>{formatFileSize(item.downloadedSize)} / {formatFileSize(item.fileSize)}</span>
                  ) : (
                    <span>{formatFileSize(item.fileSize)}</span>
                  )}
                </div>
              )}

              {item.error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.error}</span>
                </div>
              )}

              {isCorsError && (
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  💡 This file is blocked by CORS policy. Try opening it directly in your browser using the button above.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {item.status === 'completed' && item.blob && onDownloadFile && (
              <button
                onClick={() => onDownloadFile(item.id)}
                className="p-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                title="Download file"
              >
                <DownloadCloud className="w-4 h-4" />
              </button>
            )}
            {(isCorsError || isNetworkError) && (
              <button
                onClick={openInBrowser}
                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                title="Open in browser"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-stone-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              title="Remove from queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {(item.status === 'downloading' || item.status === 'completed') && item.progress > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-amber-800 dark:text-slate-300">Progress</span>
              <span className="font-medium text-amber-900 dark:text-slate-100">{Math.round(item.progress)}%</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 transition-all duration-300 ease-out ${getProgressBarColor()}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            
            {/* Speed and ETA below progress bar */}
            {item.status === 'downloading' && (
              <div className="flex justify-between text-xs text-amber-700 dark:text-slate-400 mt-1">
                {calculateSpeed() > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{formatSpeed(calculateSpeed())}</span>
                  </div>
                )}
                {calculateETA() > 0 && (
                  <span>ETA: {formatDuration(calculateETA())}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proxy Info Dialog */}
      <ProxyInfoDialog 
        isOpen={showProxyInfo} 
        onClose={() => setShowProxyInfo(false)}
        proxyType={item.proxyType}
      />
    </>
  );
};