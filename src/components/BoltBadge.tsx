import React from 'react';
import { Theme } from '../hooks/useTheme';

interface BoltBadgeProps {
  theme: Theme;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ theme }) => {
  const handleClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  // Fixed: Use dark badge on light background, light badge on dark background
  const badgeUrl = theme === 'light' 
    ? 'https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/3f09b71855feb7d3c02ed170ccae764b842cf4ce/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.svg'
    : 'https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/3f09b71855feb7d3c02ed170ccae764b842cf4ce/src/public/bolt-badge/white_circle_360x360/white_circle_360x360.svg';

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 group bg-transparent border-0 p-0"
      title="Built with Bolt.new"
      aria-label="Built with Bolt.new - Click to visit"
      type="button"
    >
      <img
        src={badgeUrl}
        alt="Built with Bolt.new"
        className="w-full h-full rounded-full transition-transform duration-300 group-hover:rotate-12"
        loading="lazy"
      />
    </button>
  );
};