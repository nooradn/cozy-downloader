import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-amber-600 to-orange-700 dark:from-blue-500 dark:to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-orange-800 dark:hover:from-blue-600 dark:hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 z-50 group"
      title="Back to top"
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
    </button>
  );
};