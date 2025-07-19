import React from 'react';
import { DownloadStats as StatsType } from '../types';
import { CheckCircle, XCircle, Download, BarChart3, Zap, HardDrive } from 'lucide-react';
import { formatFileSize, formatSpeed } from '../utils/downloadUtils';

interface DownloadStatsProps {
  stats: StatsType;
}

export const DownloadStats: React.FC<DownloadStatsProps> = ({ stats }) => {
  if (stats.total === 0) return null;

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  // Fixed: Only calculate data progress if we have meaningful total size
  // Avoid division by zero and handle streaming downloads without content-length
  const downloadProgress = stats.totalSize > 0 && stats.downloadedSize > 0 ? 
    Math.min((stats.downloadedSize / stats.totalSize) * 100, 100) : 0;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-slate-600">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 rounded-lg text-white">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-amber-900 dark:text-slate-100">Download Statistics</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-amber-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Download className="w-4 h-4 text-amber-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-amber-800 dark:text-blue-300">{stats.total}</span>
          </div>
          <span className="text-sm text-amber-700 dark:text-slate-300 font-medium">Total</span>
        </div>

        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.completed}</span>
          </div>
          <span className="text-sm text-green-600 dark:text-green-300 font-medium">Completed</span>
        </div>

        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.failed}</span>
          </div>
          <span className="text-sm text-red-600 dark:text-red-300 font-medium">Failed</span>
        </div>

        <div className="text-center p-3 bg-orange-50 dark:bg-amber-900/20 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Download className="w-4 h-4 text-orange-600 dark:text-amber-600 animate-bounce" />
            <span className="text-2xl font-bold text-orange-700 dark:text-amber-300">{stats.inProgress}</span>
          </div>
          <span className="text-sm text-orange-600 dark:text-amber-300 font-medium">In Progress</span>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-blue-900/20 rounded-xl">
          <HardDrive className="w-5 h-5 text-amber-600 dark:text-blue-400" />
          <div>
            <div className="text-sm font-medium text-amber-800 dark:text-blue-200">Total Size</div>
            <div className="text-lg font-bold text-amber-700 dark:text-blue-300">
              {stats.totalSize > 0 ? formatFileSize(stats.totalSize) : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-purple-900/20 rounded-xl">
          <Download className="w-5 h-5 text-orange-600 dark:text-purple-400" />
          <div>
            <div className="text-sm font-medium text-orange-800 dark:text-purple-200">Downloaded</div>
            <div className="text-lg font-bold text-orange-700 dark:text-purple-300">
              {formatFileSize(stats.downloadedSize)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-indigo-900/20 rounded-xl">
          <Zap className="w-5 h-5 text-red-600 dark:text-indigo-400" />
          <div>
            <div className="text-sm font-medium text-red-800 dark:text-indigo-200">Avg Speed</div>
            <div className="text-lg font-bold text-red-700 dark:text-indigo-300">
              {stats.averageSpeed > 0 ? formatSpeed(stats.averageSpeed) : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-amber-800 dark:text-slate-300">File Completion</span>
            <span className="font-medium text-amber-900 dark:text-slate-100">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-amber-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 bg-gradient-to-r from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Only show data progress if we have meaningful total size */}
        {stats.totalSize > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-amber-800 dark:text-slate-300">Data Progress</span>
              <span className="font-medium text-amber-900 dark:text-slate-100">{Math.round(downloadProgress)}%</span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 bg-gradient-to-r from-amber-600 to-red-700 dark:from-blue-500 dark:to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(downloadProgress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};