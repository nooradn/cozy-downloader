import React, { useState } from 'react';
import { Link, Plus, Clipboard } from 'lucide-react';
import { parseUrls } from '../utils/downloadUtils';

interface UrlInputProps {
  onAddUrls: (urls: string[]) => void;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onAddUrls, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const urls = parseUrls(input);
    if (urls.length > 0) {
      onAddUrls(urls);
      setInput('');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(prev => prev ? `${prev}\n${text}` : text);
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const urlCount = parseUrls(input).length;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200/50 dark:border-slate-600">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 rounded-xl text-white shadow-lg">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-slate-100">Add Download URLs</h2>
            <p className="text-amber-800 dark:text-slate-300">Paste file URLs, one per line</p>
          </div>
        </div>
        
        <button
          onClick={handlePaste}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-amber-100/80 dark:bg-slate-700/80 text-amber-800 dark:text-slate-300 rounded-lg hover:bg-amber-200 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-amber-200/50 dark:border-slate-600/50 hover:scale-105 hover:shadow-md"
          title="Paste from clipboard"
        >
          <Clipboard className="w-4 h-4" />
          <span className="text-sm font-medium">Paste</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/file1.pdf&#10;https://example.com/image.jpg&#10;https://example.com/document.zip"
            className="w-full h-32 p-4 border-2 border-amber-200/60 dark:border-slate-600/60 rounded-xl resize-none focus:ring-2 focus:ring-amber-500/50 dark:focus:ring-blue-400/50 focus:border-amber-400 dark:focus:border-blue-400 transition-all duration-300 bg-amber-50/60 dark:bg-slate-700/60 dark:text-slate-100 font-mono text-sm placeholder-amber-600/70 dark:placeholder-slate-400/70 backdrop-blur-sm"
            disabled={disabled}
          />

          {urlCount > 0 && (
            <div className="absolute top-2 right-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 dark:from-blue-500 dark:to-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                {urlCount} URL{urlCount !== 1 ? 's' : ''} detected
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || disabled || urlCount === 0}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-700 hover:to-orange-800 dark:hover:from-blue-600 dark:hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>Add {urlCount > 0 ? `${urlCount} ` : ''}URL{urlCount !== 1 ? 's' : ''} to Queue</span>
        </button>
      </form>
    </div>
  );
};