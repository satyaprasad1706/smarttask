import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function Button({ title, onPress, variant = 'primary', className = '' }: ButtonProps) {
  const baseClasses = "w-full py-3.5 px-4 rounded-xl font-semibold text-center transition-colors flex items-center justify-center text-base";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {title}
    </motion.button>
  );
}
