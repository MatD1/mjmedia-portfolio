'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoCodeSlash, IoFilter, IoSearch } from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import Loading from '~/components/ui/Loading';

interface ProjectItem {
  id: string | number;
  title: string;
  description: string;
  images: string[];
  techStack: string[];
  featured?: boolean;
  liveUrl?: string | null;
  githubUrl?: string | null;
}

interface ProjectsPageClientProps {
  projects: ProjectItem[];
  searchParams: { search?: string; tech?: string };
}

export default function ProjectsPageClient({ projects, searchParams }: ProjectsPageClientProps) {
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
            My Projects
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            A collection of web applications, games, and tools I've built using 
            modern technologies with retro gaming aesthetics.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
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
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                  defaultValue={searchParams.search || ''}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="secondary" className="flex items-center gap-2">
                  <IoFilter />
                  Filter
                </Button>
                <Button className="flex items-center gap-2">
                  <IoCodeSlash />
                  All Tech
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Projects Grid */}
        <Suspense fallback={<Loading text="Loading projects..." />}> 
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <IoCodeSlash className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
              <h3 className="pixel-text text-xl text-glow mb-2">No Projects Found</h3>
              <p className="text-[var(--text-secondary)]">
                {searchParams.search || searchParams.tech 
                  ? 'Try adjusting your search criteria'
                  : 'No projects have been published yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/projects/${project.id}`} className="block h-full">
                    <Card className="h-full group cursor-pointer hover:border-[var(--neon-cyan)] transition-colors">
                      <div className="space-y-4">
                        {project.images[0] && (
                          <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden">
                            <img 
                              src={project.images[0]} 
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="pixel-text text-lg text-glow line-clamp-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                              {project.title}
                            </h3>
                            {project.featured && (
                              <Badge variant="success" size="sm">Featured</Badge>
                            )}
                          </div>
                          
                          <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                            {project.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {project.techStack.slice(0, 4).map((tech) => (
                              <Badge key={tech} variant="info" size="sm">
                                {tech}
                              </Badge>
                            ))}
                            {project.techStack.length > 4 && (
                              <Badge variant="default" size="sm">
                                +{project.techStack.length - 4}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            {project.liveUrl && (
                              <Button size="sm" className="flex-1">
                                Live Demo
                              </Button>
                            )}
                            {project.githubUrl && (
                              <Button variant="secondary" size="sm" className="flex-1">
                                GitHub
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
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
            Load More Projects
          </Button>
        </motion.div>
      </div>
    </main>
  );
}


