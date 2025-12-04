'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = true, glow = false, onClick, ...props }, ref) => {
    const baseClasses = 'retro-card';
    const hoverClasses = hover ? 'cursor-pointer' : '';
    const glowClasses = glow ? 'pulse-neon' : '';

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${hoverClasses} ${glowClasses} ${className}`}
        onClick={onClick}
        whileHover={hover ? { y: -5 } : {}}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
