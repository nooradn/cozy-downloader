import React from 'react';
import { Heart, Download } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-amber-200/50 dark:border-slate-600/50 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 rounded-lg text-white shadow-sm">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900 dark:text-slate-100">Cozy Downloader</h3>
              <p className="text-sm text-amber-700 dark:text-slate-400">Simple. Fast. Reliable.</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-amber-800 dark:text-slate-300 flex items-center gap-1 justify-center md:justify-end">
              © 2025 Cozy Downloader. Made with 
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              for easy downloads.
            </p>
            <p className="text-xs text-amber-600 dark:text-slate-400 mt-1">
              All rights reserved. Download responsibly.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-amber-200/30 dark:border-slate-600/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>✨ Batch downloads</span>
              <span>📦 ZIP packaging</span>
              <span>🔄 Auto retry</span>
              <span>🌙 Dark mode</span>
            </div>
            <div>
              <span>Built with React & TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};