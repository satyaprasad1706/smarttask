import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, onBack, rightElement }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center">
        {onBack && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
          >
            <ChevronLeft size={24} />
          </motion.button>
        )}
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
      {rightElement && (
        <div className="flex items-center">{rightElement}</div>
      )}
    </div>
  );
}
