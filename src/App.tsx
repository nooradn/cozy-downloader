import React, { useState } from 'react';
import { Download, Trash2, Play, Settings, Archive, Grid3X3, List, StopCircle } from 'lucide-react';
import { useDownloader } from './hooks/useDownloader';
import { useTheme } from './hooks/useTheme';
import { UrlInput } from './components/UrlInput';
import { DownloadItem } from './components/DownloadItem';
import { DownloadStats } from './components/DownloadStats';
import { DownloadConfig } from './components/DownloadConfig';
import { ThemeToggle } from './components/ThemeToggle';
import { AccordionSection } from './components/AccordionSection';
import { ErrorNotifications } from './components/ErrorNotifications';
import { BackToTopButton } from './components/BackToTopButton';
import { Footer } from './components/Footer';
import { BoltBadge } from './components/BoltBadge';

function App() {
  const {
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
  } = useDownloader();

  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getDownloadButtonText = () => {
    if (isDownloading) return 'Downloading...';
    if (zipConfig.enabled) return 'Download & ZIP';
    return 'Download All';
  };

  const clearError = (id: string) => {
    // Individual error clearing would need to be implemented in useDownloader
    clearErrors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Simple Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 200 Q200 150 400 200 T800 200 Q1000 150 1200 200" stroke="currentColor" strokeWidth="2" className="text-amber-700 dark:text-blue-400"/>
          <path d="M0 400 Q150 350 300 400 T600 400 Q750 350 900 400 T1200 400" stroke="currentColor" strokeWidth="1" className="text-orange-700 dark:text-indigo-400"/>
          <circle cx="150" cy="150" r="6" fill="currentColor" className="text-amber-600 dark:text-blue-400" opacity="0.3"/>
          <circle cx="350" cy="250" r="4" fill="currentColor" className="text-orange-600 dark:text-indigo-400" opacity="0.3"/>
          <circle cx="550" cy="180" r="8" fill="currentColor" className="text-red-600 dark:text-slate-400" opacity="0.3"/>
        </svg>
      </div>

      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <BoltBadge theme={theme} />
      <ErrorNotifications 
        errors={errors} 
        onClearError={clearError} 
        onClearAll={clearErrors} 
      />
      <BackToTopButton />
      
      <div className="container mx-auto px-4 pt-16 pb-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
              <img 
                src={theme === 'light' ? '/logo-light.png' : '/logo-dark.png'}
                alt="Cozy Downloader Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-red-900 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Cozy Downloader
            </h1>
          </div>
          <div className="mt-8">
            <p className="text-xl text-amber-800 dark:text-slate-300 max-w-2xl mx-auto">
              Download multiple files at once, the easy way
            </p>
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-8">
          <UrlInput onAddUrls={addUrls} disabled={isDownloading} />
        </div>

        {/* Configuration Sections */}
        {downloads.length > 0 && (
          <div className="space-y-6 mb-8">
            <AccordionSection
              title="Download Settings"
              icon={<Settings className="w-5 h-5" />}
              defaultExpanded={false}
            >
              <DownloadConfig 
                config={config}
                zipConfig={zipConfig}
                onConfigChange={updateConfig}
                onZipConfigChange={updateZipConfig}
                disabled={isDownloading}
              />
            </AccordionSection>
          </div>
        )}

        {/* Statistics */}
        {stats.total > 0 && (
          <div className="mb-8">
            <DownloadStats stats={stats} />
          </div>
        )}

        {/* Download Controls */}
        {downloads.length > 0 && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50 dark:border-slate-600 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 rounded-lg text-white">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900 dark:text-slate-100">Download Queue</h3>
                  <p className="text-sm text-amber-800 dark:text-slate-300">
                    {stats.total} file{stats.total !== 1 ? 's' : ''} ready for download
                    {zipConfig.enabled && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-200 rounded-full text-xs font-medium">
                        ZIP Mode
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                {/* View Mode Toggle */}
                <div className="flex bg-amber-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-amber-600 dark:bg-blue-500 text-white shadow-sm'
                        : 'text-amber-700 dark:text-slate-300 hover:bg-amber-200 dark:hover:bg-slate-600'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-amber-600 dark:bg-blue-500 text-white shadow-sm'
                        : 'text-amber-700 dark:text-slate-300 hover:bg-amber-200 dark:hover:bg-slate-600'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {isDownloading ? (
                  <button
                    onClick={cancelDownloads}
                    className="bg-red-600 dark:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <StopCircle className="w-5 h-5" />
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={downloadAll}
                    disabled={stats.total === 0}
                    className="bg-gradient-to-r from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-700 hover:to-orange-800 dark:hover:from-blue-600 dark:hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    {zipConfig.enabled ? <Archive className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    {getDownloadButtonText()}
                  </button>
                )}

                <button
                  onClick={clearAll}
                  disabled={isDownloading}
                  className="bg-stone-600 dark:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 dark:hover:bg-slate-500 transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Items */}
        {downloads.length > 0 && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {downloads.map(item => (
              <DownloadItem
                key={item.id}
                item={item}
                onRemove={removeDownload}
                onDownloadFile={downloadIndividualFile}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {downloads.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Download className="w-12 h-12 text-amber-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-amber-900 dark:text-slate-200 mb-2">No downloads yet</h3>
            <p className="text-amber-800 dark:text-slate-400 max-w-md mx-auto">
              Add some file URLs above to get started. You can paste multiple URLs at once, one per line.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;