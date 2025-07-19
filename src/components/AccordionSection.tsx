import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/50 dark:border-slate-600 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-slate-700/50 transition-colors duration-200 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 rounded-lg text-white">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-slate-100">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-amber-700 dark:text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-amber-700 dark:text-slate-400" />
          )}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          <div className="border-t border-amber-200/50 dark:border-slate-600 pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};