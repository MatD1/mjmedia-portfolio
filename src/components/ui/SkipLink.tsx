import React from 'react';
import Link from 'next/link';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[var(--neon-cyan)] text-[var(--bg-primary)] px-4 py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-[var(--neon-yellow)]"
    >
      {children}
    </Link>
  );
};

export default SkipLink;
