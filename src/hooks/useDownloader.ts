import { useState, useCallback, useRef } from 'react';
import { DownloadItem, DownloadStats, DownloadConfig, ZipConfig, AppError } from '../types';
import { extractFilenameFromUrl, downloadBlob, estimateTimeRemaining } from '../utils/downloadUtils';
import { createZipArchive, downloadZipArchive } from '../utils/zipUtils';

export const useDownloader = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errors, setErrors] = useState<AppError[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [config, setConfig] = useState<DownloadConfig>({
    batchSize: 3,
    intervalMs: 1000,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
    useProxy: true, // Default to enabled for better success rate
  });
  
  const [zipConfig, setZipConfig] = useState<ZipConfig>({
    enabled: false,
    baseName: 'downloads',
  });

  const addError = useCallback((message: string, type: AppError['type'] = 'unknown') => {
    const error: AppError = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: Date.now(),
    };
    setErrors(prev => [...prev, error]);
    
    // Auto-remove error after 10 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== error.id));
    }, 10000);
  }, []);

  // Primary proxy: Cloudflare Workers
  const getPrimaryProxiedUrl = (originalUrl: string): string => {
    return `https://cozy.nandz.workers.dev/?url=${encodeURIComponent(originalUrl)}`;
  };

  // Secondary proxy: Railway
  const getSecondaryProxiedUrl = (originalUrl: string): string => {
    return `https://cozy.up.railway.app/?url=${encodeURIComponent(originalUrl)}`;
  };

  const addUrls = useCallback((urls: string[]) => {
    try {
      const existingUrls = new Set(downloads.map(d => d.url));
      const newUrls = urls.filter(url => !existingUrls.has(url));
      
      if (newUrls.length === 0) {
        addError('All URLs are already in the download queue', 'validation');
        return;
      }

      const newDownloads: DownloadItem[] = newUrls.map(url => ({
        id: crypto.randomUUID(),
        url,
        filename: extractFilenameFromUrl(url),
        status: 'pending',
        progress: 0,
        retryCount: 0,
      }));

      setDownloads(prev => [...prev, ...newDownloads]);
    } catch (error) {
      addError('Failed to add URLs to queue', 'validation');
    }
  }, [downloads, addError]);

  const updateDownload = useCallback((id: string, updates: Partial<DownloadItem>) => {
    setDownloads(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const updateConfig = useCallback((newConfig: DownloadConfig) => {
    setConfig(newConfig);
  }, []);

  const updateZipConfig = useCallback((newZipConfig: ZipConfig) => {
    setZipConfig(newZipConfig);
  }, []);

  const getCorsErrorMessage = (error: Error, url: string): string => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('failed to fetch') || errorMessage.includes('cors')) {
      return `CORS blocked: The server at ${new URL(url).hostname} doesn't allow downloads from this website.`;
    }
    
    if (errorMessage.includes('network')) {
      return `Network error: Check your internet connection and try again.`;
    }
    
    if (errorMessage.includes('timeout')) {
      return `Download timeout: The file took too long to download. Try increasing the timeout setting.`;
    }
    
    return error.message;
  };

  const downloadFile = async (item: DownloadItem, signal: AbortSignal): Promise<void> => {
    const startTime = Date.now();
    const currentRetryCount = item.retryCount || 0;
    
    updateDownload(item.id, { 
      status: 'downloading', 
      progress: 0, 
      startTime,
      error: undefined 
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      // Combine external abort signal with timeout
      signal.addEventListener('abort', () => controller.abort());

      const fetchOptions: RequestInit = {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'User-Agent': 'CozyDownloader/1.0',
        },
        credentials: 'omit',
      };

      let response: Response;
      let usedProxy = false;
      let proxyType: 'primary' | 'secondary' | null = null;
      
      try {
        // First attempt: Try direct download
        response = await fetch(item.url, fetchOptions);
      } catch (corsError) {
        // If CORS fails and proxy is enabled, try with proxies
        if (config.useProxy && corsError instanceof Error && (corsError.message.includes('cors') || corsError.message.includes('Failed to fetch'))) {
          try {
            const primaryProxiedUrl = getPrimaryProxiedUrl(item.url);
            response = await fetch(primaryProxiedUrl, fetchOptions);
            usedProxy = true;
            proxyType = 'primary';
          } catch (primaryProxyError) {
            // If primary proxy fails, try secondary proxy (Railway)
            try {
              const secondaryProxiedUrl = getSecondaryProxiedUrl(item.url);
              response = await fetch(secondaryProxiedUrl, fetchOptions);
              usedProxy = true;
              proxyType = 'secondary';
            } catch (secondaryProxyError) {
              if (config.useProxy) {
                throw new Error(`Direct download failed (CORS), both proxies failed: Primary - ${primaryProxyError instanceof Error ? primaryProxyError.message : 'Unknown error'}, Secondary - ${secondaryProxyError instanceof Error ? secondaryProxyError.message : 'Unknown error'}`);
              } else {
                throw new Error(`Direct download failed (CORS). Enable proxy in settings to bypass this restriction.`);
              }
            }
          }
        } else if (!config.useProxy && corsError instanceof Error && (corsError.message.includes('cors') || corsError.message.includes('Failed to fetch'))) {
          throw new Error(`CORS blocked: Enable proxy in Download Settings to bypass this restriction.`);
        } else {
          throw corsError;
        }
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      updateDownload(item.id, { 
        fileSize: total > 0 ? total : undefined, // Only set fileSize if we have a valid content-length
        httpStatus: response.status,
        // Store proxy usage information
        ...(usedProxy && { 
          isUsingProxy: true,
          proxyType: proxyType 
        })
      });

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let downloadedSize = 0;
      let lastProgressUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (signal.aborted) {
          throw new Error('Download cancelled');
        }
        
        chunks.push(value);
        downloadedSize += value.length;
        
        // Fixed progress calculation
        let progress: number;
        if (total > 0) {
          // We have content-length, calculate accurate progress
          progress = Math.min((downloadedSize / total) * 100, 100);
        } else {
          // No content-length (streaming), show incremental progress
          // Use a logarithmic scale to show progress without going over 90%
          const mbDownloaded = downloadedSize / (1024 * 1024);
          progress = Math.min(Math.log(mbDownloaded + 1) * 20, 90); // Logarithmic scale, max 90%
        }
        
        // Update progress more frequently for better UX
        const now = Date.now();
        if (now - lastProgressUpdate > 100) { // Update every 100ms
          updateDownload(item.id, { 
            progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
            downloadedSize 
          });
          lastProgressUpdate = now;
        }
      }

      const blob = new Blob(chunks);
      const endTime = Date.now();
      
      // Store the blob and mark as completed
      updateDownload(item.id, { 
        status: 'completed',
        progress: 100,
        downloadedSize: blob.size,
        fileSize: blob.size, // Set actual file size from blob
        blob: blob,
        endTime,
        // Keep proxy indicator
        ...(usedProxy && { 
          isUsingProxy: true,
          proxyType: proxyType 
        })
      });

      // If ZIP mode is disabled, download immediately
      if (!zipConfig.enabled) {
        downloadBlob(blob, item.filename);
      }

    } catch (error) {
      if (signal.aborted) {
        updateDownload(item.id, { status: 'pending', progress: 0 });
        return;
      }

      const errorMessage = error instanceof Error ? getCorsErrorMessage(error, item.url) : 'Unknown error';
      
      // Fix: Only set httpStatus if it's a valid HTTP status code (not 0)
      const httpStatusMatch = errorMessage.match(/HTTP (\d+)/);
      const parsedStatus = httpStatusMatch ? parseInt(httpStatusMatch[1]) : 0;
      const httpStatus = parsedStatus > 0 ? parsedStatus : undefined;
      
      // Retry logic for non-permanent errors
      if (currentRetryCount < config.maxRetries && !errorMessage.includes('HTTP 4') && !errorMessage.includes('both proxies failed') && !errorMessage.includes('Enable proxy in settings')) {
        const newRetryCount = currentRetryCount + 1;
        
        updateDownload(item.id, { 
          retryCount: newRetryCount,
          status: 'pending',
          error: `Retry ${newRetryCount}/${config.maxRetries}: ${errorMessage}`
        });
        
        // Schedule retry with exponential backoff
        const retryDelay = Math.min(2000 * Math.pow(2, currentRetryCount), 30000); // Cap at 30 seconds
        
        setTimeout(() => {
          if (!signal.aborted) {
            // Get the updated item from state to ensure we have the latest retry count
            setDownloads(currentDownloads => {
              const updatedItem = currentDownloads.find(d => d.id === item.id);
              if (updatedItem && updatedItem.status === 'pending' && (updatedItem.retryCount || 0) <= config.maxRetries) {
                // Trigger retry by calling downloadFile with updated item
                downloadFile(updatedItem, signal);
              }
              return currentDownloads;
            });
          }
        }, retryDelay);
      } else {
        // Max retries reached or permanent error
        const finalErrorMessage = currentRetryCount >= config.maxRetries ? 
          `Failed after ${config.maxRetries} retries: ${errorMessage}` : 
          errorMessage;
          
        updateDownload(item.id, { 
          status: 'error',
          error: finalErrorMessage,
          httpStatus,
          endTime: Date.now()
        });
        
        // Add error notification for failed downloads
        const errorType = errorMessage.includes('CORS') ? 'network' : 'unknown';
        addError(`Download failed: ${item.filename} - ${errorMessage}`, errorType);
      }
    }
  };

  const downloadAll = useCallback(async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      abortControllerRef.current = new AbortController();
      
      const pendingDownloads = downloads.filter(item => 
        item.status === 'pending' || (item.status === 'error' && (item.retryCount || 0) < config.maxRetries)
      );
      
      if (pendingDownloads.length === 0) {
        // If ZIP mode is enabled and we have completed downloads, create ZIP
        if (zipConfig.enabled) {
          const completedDownloads = downloads.filter(item => item.status === 'completed' && item.blob);
          if (completedDownloads.length > 0) {
            try {
              const archive = await createZipArchive(completedDownloads, zipConfig);
              downloadZipArchive(archive, zipConfig.baseName);
            } catch (error) {
              addError('Failed to create ZIP archive: ' + (error instanceof Error ? error.message : 'Unknown error'), 'unknown');
            }
          } else {
            addError('No completed downloads to ZIP', 'validation');
          }
        } else {
          addError('No files to download', 'validation');
        }
        setIsDownloading(false);
        return;
      }

      // Download files in batches with configurable size and interval
      for (let i = 0; i < pendingDownloads.length; i += config.batchSize) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        const batch = pendingDownloads.slice(i, i + config.batchSize);
        
        // Download current batch concurrently
        await Promise.allSettled(
          batch.map(item => downloadFile(item, abortControllerRef.current!.signal))
        );
        
        // Wait for interval before next batch (if there are more files)
        if (i + config.batchSize < pendingDownloads.length && config.intervalMs > 0) {
          await new Promise(resolve => setTimeout(resolve, config.intervalMs));
        }
      }
      
      // If ZIP mode is enabled, create and download ZIP archive after all downloads complete
      if (zipConfig.enabled && !abortControllerRef.current?.signal.aborted) {
        try {
          const completedDownloads = downloads.filter(item => item.status === 'completed' && item.blob);
          if (completedDownloads.length > 0) {
            const archive = await createZipArchive(completedDownloads, zipConfig);
            downloadZipArchive(archive, zipConfig.baseName);
          }
        } catch (error) {
          addError('Failed to create ZIP archive: ' + (error instanceof Error ? error.message : 'Unknown error'), 'unknown');
        }
      }
      
    } catch (error) {
      addError('Download process failed', 'unknown');
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  }, [downloads, isDownloading, config, zipConfig, downloadFile, addError]);

  const cancelDownloads = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDownloading(false);
  }, []);

  const clearAll = useCallback(() => {
    if (isDownloading) {
      cancelDownloads();
    }
    setDownloads([]);
  }, [isDownloading, cancelDownloads]);

  const removeDownload = useCallback((id: string) => {
    setDownloads(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Add function to download individual completed files
  const downloadIndividualFile = useCallback((id: string) => {
    const item = downloads.find(d => d.id === id);
    if (item && item.blob && item.status === 'completed') {
      downloadBlob(item.blob, item.filename);
    }
  }, [downloads]);

  const stats: DownloadStats = {
    total: downloads.length,
    completed: downloads.filter(item => item.status === 'completed').length,
    failed: downloads.filter(item => item.status === 'error').length,
    inProgress: downloads.filter(item => item.status === 'downloading').length,
    totalSize: downloads.reduce((sum, item) => sum + (item.fileSize || 0), 0),
    downloadedSize: downloads.reduce((sum, item) => sum + (item.downloadedSize || 0), 0),
    averageSpeed: 0, // Calculate based on completed downloads
  };

  // Calculate average speed
  const completedDownloads = downloads.filter(item => 
    item.status === 'completed' && item.startTime && item.endTime && item.downloadedSize
  );
  
  if (completedDownloads.length > 0) {
    const totalSpeed = completedDownloads.reduce((sum, item) => {
      const duration = (item.endTime! - item.startTime!) / 1000; // seconds
      const speed = item.downloadedSize! / duration; // bytes per second
      return sum + speed;
    }, 0);
    stats.averageSpeed = totalSpeed / completedDownloads.length;
  }

  return {
    downloads,
    isDownloading,
    stats,
    config,
    zipConfig,
    errors,
    addUrls,
    downloadAll,
    cancelDownloads,
    clearAll,
    removeDownload,
    updateConfig,
    updateZipConfig,
    clearErrors,
    downloadIndividualFile,
  };
};