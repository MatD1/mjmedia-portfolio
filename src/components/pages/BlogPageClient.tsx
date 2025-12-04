'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { IoBook, IoSearch, IoFilter, IoCalendar, IoEye } from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import Loading from '~/components/ui/Loading';

interface BlogItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string[];
  views: number;
  createdAt: string | Date;
  createdBy: { name: string };
}

interface BlogPageClientProps {
  blogs: BlogItem[];
  tags: string[];
  searchParams: { search?: string; tag?: string };
}

export default function BlogPageClient({ blogs, tags, searchParams }: BlogPageClientProps) {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="pixel-text text-4xl sm:text-5xl text-glow mb-4">
            Blog
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Thoughts on web development, retro gaming, and the intersection 
            of technology and creativity.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neon-cyan)]" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                  defaultValue={searchParams.search || ''}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="secondary" className="flex items-center gap-2">
                  <IoFilter />
                  Filter
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h3 className="pixel-text text-lg text-glow mb-4">Popular Tags</h3>
            <Suspense fallback={<Loading size="sm" text="Loading tags..." />}>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="info" size="sm" className="cursor-pointer hover:bg-[var(--neon-pink)] hover:text-[var(--bg-primary)] transition-colors">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Suspense>
          </Card>
        </motion.div>

        {/* Blog Posts Grid */}
        <Suspense fallback={<Loading text="Loading blog posts..." />}>
          {blogs.length === 0 ? (
            <div className="text-center py-20">
              <IoBook className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
              <h3 className="pixel-text text-xl text-glow mb-2">No Blog Posts Found</h3>
              <p className="text-[var(--text-secondary)]">
                {searchParams.search || searchParams.tag 
                  ? 'Try adjusting your search criteria'
                  : 'No blog posts have been published yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full group">
                    <div className="space-y-4">
                      {blog.coverImage && (
                        <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden">
                          <img 
                            src={blog.coverImage} 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <h3 className="pixel-text text-lg text-glow line-clamp-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                          {blog.title}
                        </h3>
                        
                        <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                          {blog.excerpt || blog.content.substring(0, 150) + '...'}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="info" size="sm">
                              +{blog.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-primary)]">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <IoEye />
                              {blog.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <IoCalendar />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span>by {blog.createdBy.name}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Suspense>

        {/* Load More Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button size="lg">
            Load More Posts
          </Button>
        </motion.div>
      </div>
    </main>
  );
}


