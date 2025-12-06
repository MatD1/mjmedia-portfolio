'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { IoMenu, IoClose, IoGameController, IoCodeSlash, IoBook, IoNewspaper, IoPerson } from 'react-icons/io5';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    { name: 'Home', href: '/', icon: IoGameController },
    { name: 'Projects', href: '/projects', icon: IoCodeSlash },
    { name: 'Blog', href: '/blog', icon: IoBook },
    { name: 'Stories', href: '/stories', icon: IoNewspaper },
    { name: 'About', href: '/about', icon: IoPerson },
  ];

  return (
    <header id="navigation" className="sticky top-0 z-40 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-primary)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="text-2xl pixel-text text-glow"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              MJ
            </motion.div>
            <motion.div
              className="hidden sm:block text-sm pixel-text text-[var(--text-secondary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              MEDIA
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="pixel-text text-sm hover:text-[var(--neon-cyan)] transition-colors duration-200 flex items-center gap-2"
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="game-button text-xs"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/api/auth/signout"
                  className="pixel-text text-sm hover:text-[var(--neon-red)] transition-colors"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="game-button text-xs"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] rounded transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.nav
          className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-2 border-t border-[var(--border-primary)]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 pixel-text text-sm hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            ))}
          </div>
        </motion.nav>
      </div>
    </header>
  );
};

export default Header;
