import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = 'pixel-badge inline-block';
  
  const variantClasses = {
    default: 'bg-[var(--neon-green)] text-[var(--bg-primary)]',
    success: 'bg-[var(--neon-green)] text-[var(--bg-primary)]',
    warning: 'bg-[var(--neon-yellow)] text-[var(--bg-primary)]',
    danger: 'bg-[var(--neon-red)] text-[var(--bg-primary)]',
    info: 'bg-[var(--neon-cyan)] text-[var(--bg-primary)]'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
