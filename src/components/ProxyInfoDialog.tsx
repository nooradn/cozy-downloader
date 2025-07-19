import React from 'react';
import { X, Globe, Shield, Zap, AlertTriangle } from 'lucide-react';

interface ProxyInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proxyType?: 'primary' | 'secondary';
}

export const ProxyInfoDialog: React.FC<ProxyInfoDialogProps> = ({ 
  isOpen, 
  onClose, 
  proxyType = 'primary' 
}) => {
  if (!isOpen) return null;

  const getProxyName = () => {
    return proxyType === 'primary' ? 'Cloudflare Workers' : 'Railway';
  };

  const getProxyDescription = () => {
    return proxyType === 'primary' 
      ? 'Our primary proxy service running on Cloudflare\'s global edge network'
      : 'Our backup proxy service for additional reliability';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg text-white">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Why Use a Proxy?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What is CORS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-gray-900 dark:text-slate-100">The CORS Problem</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              <strong>CORS (Cross-Origin Resource Sharing)</strong> is a browser security feature that blocks websites from downloading files from other domains. This prevents malicious sites from accessing your data, but it also blocks legitimate downloads.
            </p>
          </div>

          {/* Why Proxy Needed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold text-gray-900 dark:text-slate-100">Why We Need Proxies</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              When a server doesn't allow direct downloads from our website, we use a <strong>proxy server</strong> as a "middleman" to fetch the file for you. The proxy downloads the file from the original server, then sends it to your browser.
            </p>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900 dark:text-slate-100">How It Works</h4>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Your browser tries to download directly</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Server blocks the request (CORS error)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Our proxy fetches the file for you</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Proxy sends the file to your browser</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Proxy Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-gray-900 dark:text-slate-100">Current Proxy</h4>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="space-y-2">
                <div className="font-medium text-purple-800 dark:text-purple-200">
                  {getProxyName()}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  {getProxyDescription()}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Note */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-green-800 dark:text-green-200 text-sm">
                  Safe & Secure
                </div>
                <div className="text-xs text-green-600 dark:text-green-300">
                  Our proxies don't store or modify your files. They simply act as a secure bridge between you and the original server.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-600">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};