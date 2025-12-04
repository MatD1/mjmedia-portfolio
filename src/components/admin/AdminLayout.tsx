'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  IoHome, 
  IoCodeSlash, 
  IoBook, 
  IoNewspaper, 
  IoDocumentText,
  IoAnalytics,
  IoMenu,
  IoClose,
  IoLogOut,
  IoPerson
} from 'react-icons/io5';

import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: IoHome },
  { name: 'Projects', href: '/admin/projects', icon: IoCodeSlash },
  { name: 'Blog Posts', href: '/admin/blogs', icon: IoBook },
  { name: 'Stories', href: '/admin/stories', icon: IoNewspaper },
  { name: 'Posts', href: '/admin/posts', icon: IoDocumentText },
  { name: 'Analytics', href: '/admin/analytics', icon: IoAnalytics },
  { name: 'Users', href: '/admin/users', icon: IoPerson },
  { name: 'Media', href: '/admin/media', icon: IoDocumentText },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
            <div className="flex items-center gap-2">
              <IoCodeSlash className="text-2xl text-[var(--neon-cyan)]" />
              <span className="pixel-text text-lg text-glow">Admin Panel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] rounded transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded transition-colors
                    ${isActive 
                      ? 'bg-[var(--neon-cyan)] text-[var(--bg-primary)]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span className="pixel-text text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-[var(--border-primary)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--neon-cyan)] rounded-full flex items-center justify-center">
                <IoPerson size={16} className="text-[var(--bg-primary)]" />
              </div>
              <div>
                <p className="pixel-text text-sm text-[var(--text-primary)]">Admin User</p>
                <p className="text-xs text-[var(--text-muted)]">Administrator</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => window.location.href = '/api/auth/signout'}
            >
              <IoLogOut className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] rounded transition-colors"
            >
              <IoMenu size={24} />
            </button>
            
            <div className="flex items-center gap-4">
              <Link href="/" className="pixel-text text-sm hover:text-[var(--neon-cyan)] transition-colors">
                View Site
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
