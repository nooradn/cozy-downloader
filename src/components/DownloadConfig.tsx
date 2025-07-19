import React from 'react';
import { Clock, Users, Archive, Shield, Timer, Globe, Lock } from 'lucide-react';
import { DownloadConfig as ConfigType, ZipConfig } from '../types';

interface DownloadConfigProps {
  config: ConfigType;
  zipConfig: ZipConfig;
  onConfigChange: (config: ConfigType) => void;
  onZipConfigChange: (config: ZipConfig) => void;
  disabled?: boolean;
}

export const DownloadConfig: React.FC<DownloadConfigProps> = ({ 
  config, 
  zipConfig,
  onConfigChange, 
  onZipConfigChange,
  disabled 
}) => {
  const handleBatchSizeChange = (value: number) => {
    onConfigChange({ ...config, batchSize: Math.max(1, Math.min(25, value)) });
  };

  const handleIntervalChange = (value: number) => {
    onConfigChange({ ...config, intervalMs: Math.max(0, Math.min(10000, value)) });
  };

  const handleMaxRetriesChange = (value: number) => {
    onConfigChange({ ...config, maxRetries: Math.max(0, Math.min(10, value)) });
  };

  const handleTimeoutChange = (value: number) => {
    onConfigChange({ ...config, timeout: Math.max(5000, Math.min(120000, value)) });
  };

  const handleProxyToggle = (enabled: boolean) => {
    onConfigChange({ ...config, useProxy: enabled });
  };

  const handleZipChange = (updates: Partial<ZipConfig>) => {
    onZipConfigChange({ ...zipConfig, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Download Settings */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-amber-900 dark:text-slate-100 flex items-center gap-2 border-b border-amber-200 dark:border-slate-600 pb-2">
            <Users className="w-5 h-5 text-amber-600 dark:text-blue-400" />
            Download Configuration
          </h4>

          {/* Batch Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-slate-300">
              <Users className="w-4 h-4 text-amber-600 dark:text-blue-400" />
              Concurrent Downloads
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="25"
                value={config.batchSize}
                onChange={(e) => handleBatchSizeChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-amber-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={config.batchSize}
                  onChange={(e) => handleBatchSizeChange(parseInt(e.target.value) || 1)}
                  disabled={disabled}
                  className="w-16 px-2 py-1 text-sm border border-amber-200 dark:border-slate-600 rounded-lg bg-amber-50/50 dark:bg-slate-700 text-amber-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <span className="text-sm text-amber-700 dark:text-slate-400">files</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-slate-400">
              Files to download at once (1–25). Higher = faster, but uses more resources.
            </p>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-slate-300">
              <Clock className="w-4 h-4 text-amber-600 dark:text-blue-400" />
              Batch Interval
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={config.intervalMs}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-amber-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="500"
                  value={config.intervalMs}
                  onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-20 px-2 py-1 text-sm border border-amber-200 dark:border-slate-600 rounded-lg bg-amber-50/50 dark:bg-slate-700 text-amber-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <span className="text-sm text-amber-700 dark:text-slate-400">ms</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-slate-400">
              Delay between download batches (0-10000ms). Useful for rate limiting.
            </p>
          </div>

          {/* Max Retries */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-slate-300">
              <Shield className="w-4 h-4 text-amber-600 dark:text-blue-400" />
              Max Retries
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="10"
                value={config.maxRetries}
                onChange={(e) => handleMaxRetriesChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-amber-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.maxRetries}
                  onChange={(e) => handleMaxRetriesChange(parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  className="w-16 px-2 py-1 text-sm border border-amber-200 dark:border-slate-600 rounded-lg bg-amber-50/50 dark:bg-slate-700 text-amber-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <span className="text-sm text-amber-700 dark:text-slate-400">times</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-slate-400">
              Number of retry attempts for failed downloads (0-10). Uses exponential backoff.
            </p>
          </div>

          {/* Timeout */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-slate-300">
              <Timer className="w-4 h-4 text-amber-600 dark:text-blue-400" />
              Request Timeout
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5000"
                max="120000"
                step="5000"
                value={config.timeout}
                onChange={(e) => handleTimeoutChange(parseInt(e.target.value))}
                disabled={disabled}
                className="flex-1 h-2 bg-amber-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5000"
                  max="120000"
                  step="5000"
                  value={config.timeout}
                  onChange={(e) => handleTimeoutChange(parseInt(e.target.value) || 30000)}
                  disabled={disabled}
                  className="w-20 px-2 py-1 text-sm border border-amber-200 dark:border-slate-600 rounded-lg bg-amber-50/50 dark:bg-slate-700 text-amber-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
                <span className="text-sm text-amber-700 dark:text-slate-400">ms</span>
              </div>
            </div>
            <p className="text-xs text-amber-700 dark:text-slate-400">
              Maximum time to wait for each download (5-120 seconds).
            </p>
          </div>
        </div>

        {/* Right Column - ZIP Settings */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-amber-900 dark:text-slate-100 flex items-center gap-2 border-b border-amber-200 dark:border-slate-600 pb-2">
            <Archive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ZIP Configuration
          </h4>

          {/* ZIP Mode Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50 gap-8">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg text-white">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-purple-800 dark:text-purple-200">ZIP Mode</h5>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    Package into a single ZIP file
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={zipConfig.enabled}
                  onChange={(e) => handleZipChange({ enabled: e.target.checked })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-amber-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* ZIP Base Name - Only show when enabled */}
            {zipConfig.enabled && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-slate-300">
                  <Archive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ZIP File Name
                </label>
                <input
                  type="text"
                  value={zipConfig.baseName}
                  onChange={(e) => handleZipChange({ baseName: e.target.value })}
                  disabled={disabled}
                  placeholder="downloads"
                  className="w-full px-3 py-2 text-sm border border-purple-200 dark:border-purple-700 rounded-lg bg-purple-50/50 dark:bg-purple-900/20 text-amber-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-amber-700 dark:text-slate-400">
                  Base name for the ZIP file (timestamp will be added automatically)
                </p>
              </div>
            )}
          </div>

          {/* Performance Tips */}
          <div className="p-4 bg-orange-50 dark:bg-blue-900/20 rounded-xl border border-orange-200 dark:border-blue-800/50">
            <h5 className="font-medium text-orange-800 dark:text-blue-200 mb-2">💡 Performance Tips</h5>
            <ul className="text-sm text-orange-700 dark:text-blue-300 space-y-1">
              <li>• Lower concurrent downloads for slower connections</li>
              <li>• Increase timeout for large files or slow servers</li>
              <li>• Use batch intervals to avoid overwhelming servers</li>
              <li>• Enable retries for unreliable connections</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Settings Section - Separate Containers */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-amber-900 dark:text-slate-100 flex items-center gap-2 border-b border-amber-200 dark:border-slate-600 pb-2">
          <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
          Privacy Settings
        </h4>

        {/* Two separate containers side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Container - Toggle Control */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg text-white">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200">Proxy Helper</h5>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {config.useProxy ? 'Enabled – CORS proxy if needed' : 'Direct only – max privacy, may fail'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.useProxy}
                  onChange={(e) => handleProxyToggle(e.target.checked)}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-amber-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Right Container - Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="space-y-2">
              <h6 className="font-medium text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                How it works:
              </h6>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {config.useProxy 
                  ? 'Tries direct download first. If blocked by CORS, uses our secure proxy servers to fetch files. Files pass through temporarily but are not stored.'
                  : 'Only attempts direct downloads. Your data never touches our servers, but some websites may block downloads due to CORS restrictions.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="p-4 bg-amber-50 dark:bg-slate-800/50 rounded-lg border border-amber-200 dark:border-slate-700">
        <h5 className="font-medium text-amber-900 dark:text-slate-200 mb-2">Current Configuration</h5>
        <div className="text-sm text-amber-800 dark:text-slate-300">
          <strong>Downloads:</strong> {config.batchSize} concurrent, {config.intervalMs}ms interval, {config.maxRetries} retries, {config.timeout/1000}s timeout
          <span> • <strong>Proxy:</strong> {config.useProxy ? 'Enabled' : 'Disabled'}</span>
          {zipConfig.enabled && (
            <span> • <strong>ZIP:</strong> Enabled ("{zipConfig.baseName}")</span>
          )}
        </div>
      </div>
    </div>
  );
};