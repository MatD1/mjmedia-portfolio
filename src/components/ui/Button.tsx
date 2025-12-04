'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    className = '', 
    isLoading = false,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'game-button relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] transition-all duration-200';
    
    const variantClasses = {
      primary: 'border-[var(--border-primary)] hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] focus:ring-[var(--neon-cyan)]',
      secondary: 'border-[var(--border-secondary)] hover:bg-[var(--neon-pink)] hover:text-[var(--bg-primary)] focus:ring-[var(--neon-pink)]',
      danger: 'border-[var(--neon-red)] hover:bg-[var(--neon-red)] hover:text-[var(--bg-primary)] focus:ring-[var(--neon-red)]',
      ghost: 'border-transparent hover:border-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-[var(--bg-primary)] focus:ring-[var(--neon-green)]'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    };

    const isDisabled = disabled || isLoading;
    
    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.05 }}
        whileTap={isDisabled ? {} : { scale: 0.95 }}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="retro-spinner w-4 h-4" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
