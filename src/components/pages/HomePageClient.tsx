'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  IoCodeSlash, 
  IoGameController, 
  IoRocket, 
  IoStar,
  IoArrowForward,
  IoCodeWorking,
  IoBook,
  IoNewspaper,
  IoPerson,
  IoCalendar,
  IoEye
} from "react-icons/io5";

import Card from "~/components/ui/Card";
import Button from "~/components/ui/Button";
import Badge from "~/components/ui/Badge";

interface FeaturedProject {
  id: string | number;
  title: string;
  description: string;
  images: string[];
  techStack: string[];
}

interface LatestBlog {
  id: string | number;
  title: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  tags: string[];
  createdAt: string | Date;
  createdBy: { name: string | null };
  views: number;
}

interface HomePageClientProps {
  featuredProjects: FeaturedProject[];
  latestBlogs: LatestBlog[];
}

export default function HomePageClient({ featuredProjects, latestBlogs }: HomePageClientProps) {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Main Title */}
            <motion.h1 
              className="pixel-text text-5xl sm:text-6xl lg:text-7xl text-glow mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-[var(--neon-cyan)]">MJ</span>{" "}
              <span className="text-[var(--neon-pink)]">MEDIA</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Full-Stack Developer & Retro Gaming Enthusiast
            </motion.p>

            {/* Tagline */}
            <motion.div 
              className="pixel-text text-lg text-[var(--neon-green)] mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="blink">█</span> Building the future with pixel-perfect precision <span className="blink">█</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/projects">
                <Button size="lg" className="group">
                  <IoCodeSlash className="mr-2 group-hover:rotate-12 transition-transform" />
                  View My Work
                  <IoArrowForward className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/about">
                <Button variant="secondary" size="lg" className="group">
                  <IoPerson className="mr-2 group-hover:scale-110 transition-transform" />
                  About Me
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 text-[var(--neon-cyan)] opacity-30"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <IoCodeWorking size={24} />
          </motion.div>
          
          <motion.div
            className="absolute top-32 right-16 text-[var(--neon-pink)] opacity-30"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <IoGameController size={20} />
          </motion.div>
          
          <motion.div
            className="absolute bottom-32 left-20 text-[var(--neon-green)] opacity-30"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <IoRocket size={18} />
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="pixel-text text-4xl sm:text-5xl text-glow mb-4">
              Featured <span className="text-[var(--neon-cyan)]">Projects</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              A showcase of my latest work, blending modern web technologies with nostalgic retro aesthetics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group">
                  <Link href={`/projects/${project.id}`} className="block">
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
                        <h3 className="pixel-text text-lg text-glow group-hover:text-[var(--neon-cyan)] transition-colors">
                          {project.title}
                        </h3>

                        <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.techStack.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="info" size="sm">
                              {tech}
                            </Badge>
                          ))}
                          {project.techStack.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{project.techStack.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="pt-2">
                          <Button size="sm" className="w-full">
                            View Project
                            <IoArrowForward className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/projects">
              <Button variant="secondary" size="lg">
                View All Projects
                <IoArrowForward className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="pixel-text text-4xl sm:text-5xl text-glow mb-4">
              Latest <span className="text-[var(--neon-pink)]">Blog Posts</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Thoughts on web development, retro gaming, and the intersection of technology and creativity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group">
                  <Link href={`/blog/${blog.id}`} className="block">
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
                        <h3 className="pixel-text text-lg text-glow group-hover:text-[var(--neon-pink)] transition-colors line-clamp-2">
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
                            <Badge variant="default" size="sm">
                              +{blog.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2">
                          <span className="flex items-center gap-1">
                            <IoEye />
                            {blog.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <IoCalendar />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/blog">
              <Button variant="secondary" size="lg">
                Read All Posts
                <IoArrowForward className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="pixel-text text-4xl sm:text-5xl text-glow mb-8">
              About <span className="text-[var(--neon-green)]">Me</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--neon-cyan)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoCodeSlash className="text-2xl text-[var(--bg-primary)]" />
                </div>
                <h3 className="pixel-text text-lg text-glow mb-2">Full-Stack Developer</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Building modern web applications with React, Next.js, and TypeScript
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--neon-pink)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoGameController className="text-2xl text-[var(--bg-primary)]" />
                </div>
                <h3 className="pixel-text text-lg text-glow mb-2">Retro Gaming Fan</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Passionate about pixel art, 8-bit aesthetics, and classic gaming
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[var(--neon-green)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <IoRocket className="text-2xl text-[var(--bg-primary)]" />
                </div>
                <h3 className="pixel-text text-lg text-glow mb-2">Innovation Seeker</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Always exploring new technologies and creative solutions
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link href="/about">
                <Button size="lg">
                  Learn More About Me
                  <IoArrowForward className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
