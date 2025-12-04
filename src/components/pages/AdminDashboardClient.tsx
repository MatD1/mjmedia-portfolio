'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  IoCodeSlash, 
  IoBook, 
  IoNewspaper, 
  IoDocumentText,
  IoTrendingUp,
  IoAnalytics
} from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Loading from '~/components/ui/Loading';

interface CountSummary {
  total: number;
  published: number;
  featured?: number;
  totalViews?: number;
}

interface RecentItemBase {
  id: string;
  title: string;
  published: boolean;
  createdAt: string | Date;
}

type RecentItem = (RecentItemBase & { type: 'project' | 'blog' | 'story' });

interface AdminDashboardClientProps {
  projectCounts: CountSummary;
  blogCounts: CountSummary;
  storyCounts: CountSummary;
  postCounts: CountSummary;
  recent: RecentItem[];
}

export default function AdminDashboardClient({ projectCounts, blogCounts, storyCounts, postCounts, recent }: AdminDashboardClientProps) {
  const stats = [
    {
      title: 'Projects',
      total: projectCounts.total,
      published: projectCounts.published,
      featured: projectCounts.featured,
      icon: IoCodeSlash,
      color: 'var(--neon-cyan)',
      href: '/admin/projects'
    },
    {
      title: 'Blog Posts',
      total: blogCounts.total,
      published: blogCounts.published,
      views: blogCounts.totalViews,
      icon: IoBook,
      color: 'var(--neon-green)',
      href: '/admin/blogs'
    },
    {
      title: 'Stories',
      total: storyCounts.total,
      published: storyCounts.published,
      icon: IoNewspaper,
      color: 'var(--neon-pink)',
      href: '/admin/stories'
    },
    {
      title: 'Posts',
      total: postCounts.total,
      published: postCounts.published,
      icon: IoDocumentText,
      color: 'var(--neon-yellow)',
      href: '/admin/posts'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="pixel-text text-3xl text-glow mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Welcome to your admin dashboard. Manage your content and view analytics.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <stat.icon 
                  className="text-3xl" 
                  style={{ color: stat.color }}
                />
                <Button variant="ghost" size="sm" className="p-1">
                  View All
                </Button>
              </div>
              
              <h3 className="pixel-text text-lg text-glow mb-2">{stat.title}</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Total:</span>
                  <span className="text-[var(--text-primary)] font-bold">{stat.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Published:</span>
                  <span className="text-[var(--neon-green)] font-bold">{stat.published}</span>
                </div>
                {stat.featured !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Featured:</span>
                    <span className="text-[var(--neon-cyan)] font-bold">{stat.featured}</span>
                  </div>
                )}
                {'views' in stat && stat.views !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Views:</span>
                    <span className="text-[var(--neon-yellow)] font-bold">{(stat as any).views.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="pixel-text text-lg text-glow mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recent.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="pixel-text text-sm text-[var(--text-primary)] truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    item.published 
                      ? 'bg-[var(--neon-green)] text-[var(--bg-primary)]' 
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-primary)]'
                  }`}>
                    {item.published ? 'Published' : 'Draft'}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h3 className="pixel-text text-lg text-glow mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'New Project', href: '/admin/projects/new', icon: IoCodeSlash, color: 'var(--neon-cyan)' },
                { title: 'New Blog Post', href: '/admin/blogs/new', icon: IoBook, color: 'var(--neon-green)' },
                { title: 'New Story', href: '/admin/stories/new', icon: IoNewspaper, color: 'var(--neon-pink)' },
                { title: 'New Post', href: '/admin/posts/new', icon: IoDocumentText, color: 'var(--neon-yellow)' },
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-[var(--bg-tertiary)]"
                  >
                    <action.icon 
                      size={24} 
                      style={{ color: action.color }}
                    />
                    <span className="pixel-text text-xs">{action.title}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="pixel-text text-lg text-glow">Analytics</h3>
            <Button variant="secondary" size="sm">
              <IoAnalytics className="mr-2" />
              View Full Analytics
            </Button>
          </div>
          <div className="text-center py-12">
            <IoTrendingUp className="text-4xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)]">
              Analytics integration coming soon. Connect Umami to view detailed metrics.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}


