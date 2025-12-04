'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  IoAdd, 
  IoSearch, 
  IoFilter, 
  IoEye, 
  IoCreate, 
  IoTrash, 
  IoCodeSlash,
  IoGlobe,
  IoLogoGithub,
  IoStar
} from 'react-icons/io5';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import Loading from '~/components/ui/Loading';

interface ProjectItem {
  id: number | string;
  title: string;
  description: string;
  images: string[];
  techStack: string[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  liveUrl?: string | null;
  githubUrl?: string | null;
}

export default function AdminProjectsClient({ projects, searchParams }: { projects: ProjectItem[]; searchParams: { search?: string; published?: string } }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="pixel-text text-3xl text-glow mb-2">Projects</h1>
            <p className="text-[var(--text-secondary)]">
              Manage your portfolio projects and showcase your work.
            </p>
          </div>
          <Link href="/admin/projects/new">
            <Button size="lg">
              <IoAdd className="mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
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
              <select 
                className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)]"
                defaultValue={searchParams.published || 'all'}
              >
                <option value="all">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
              
              <Button variant="secondary" className="flex items-center gap-2">
                <IoFilter />
                Filter
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Projects List */}
      <Suspense fallback={<Loading text="Loading projects..." />}>
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <IoCodeSlash className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
            <h3 className="pixel-text text-xl text-glow mb-2">No Projects Found</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              {searchParams.search 
                ? 'Try adjusting your search criteria'
                : 'No projects have been created yet'}
            </p>
            <Link href="/admin/projects/new">
              <Button size="lg">
                <IoAdd className="mr-2" />
                Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {project.images[0] && (
                          <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden flex-shrink-0">
                            <img 
                              src={project.images[0]} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="pixel-text text-lg text-glow truncate">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2 ml-4">
                              {project.featured && (
                                <Badge variant="success" size="sm">
                                  <IoStar className="mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge 
                                variant={project.published ? "success" : "warning"} 
                                size="sm"
                              >
                                {project.published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
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
                          
                          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                            <span>Order: {project.order}</span>
                            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {project.liveUrl && (
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors text-sm"
                          >
                            <IoGlobe />
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[var(--neon-green)] hover:text-[var(--neon-pink)] transition-colors text-sm"
                          >
                            <IoLogoGithub />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <IoEye />
                        </Button>
                      </Link>
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          <IoCreate />
                        </Button>
                      </Link>
                      <Button variant="danger" size="sm">
                        <IoTrash />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}


