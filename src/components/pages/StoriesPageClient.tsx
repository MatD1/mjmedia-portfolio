'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { IoNewspaper, IoSearch, IoFilter, IoCalendar } from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Loading from '~/components/ui/Loading';

interface StoryItem {
  id: string | number;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdAt: string | Date;
  createdBy: { name: string | null };
}

interface StoriesPageClientProps {
  stories: StoryItem[];
  searchParams: { search?: string };
}

export default function StoriesPageClient({ stories, searchParams }: StoriesPageClientProps) {
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
            Stories
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Personal stories, experiences, and insights from my journey as a developer 
            and retro gaming enthusiast.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neon-cyan)]" />
                <input
                  type="text"
                  placeholder="Search stories..."
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

        {/* Stories Grid */}
        <Suspense fallback={<Loading text="Loading stories..." />}> 
          {stories.length === 0 ? (
            <div className="text-center py-20">
              <IoNewspaper className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
              <h3 className="pixel-text text-xl text-glow mb-2">No Stories Found</h3>
              <p className="text-[var(--text-secondary)]">
                {searchParams.search 
                  ? 'Try adjusting your search criteria'
                  : 'No stories have been published yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full group">
                    <div className="space-y-4">
                      {story.coverImage && (
                        <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden">
                          <img 
                            src={story.coverImage} 
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <h3 className="pixel-text text-lg text-glow line-clamp-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                          {story.title}
                        </h3>
                        
                        <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                          {story.excerpt || story.content.substring(0, 150) + '...'}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-primary)]">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <IoCalendar />
                              {new Date(story.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span>by {story.createdBy.name}</span>
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
            Load More Stories
          </Button>
        </motion.div>
      </div>
    </main>
  );
}


