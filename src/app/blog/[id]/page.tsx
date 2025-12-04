'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  IoArrowBack, 
  IoBook, 
  IoCalendar,
  IoPerson,
  IoEye,
  IoTime
} from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { HydrateClient, api } from '~/trpc/server';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const blog = await api.blog.getById({ id: parseInt(params.id) });
  
  if (!blog) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: `${blog.title} - MJ Media Blog`,
    description: blog.excerpt || blog.content.substring(0, 160),
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.content.substring(0, 160),
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const blog = await api.blog.getById({ id: parseInt(params.id) });

  if (!blog) {
    notFound();
  }

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = blog.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <HydrateClient>
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/blog">
              <Button variant="ghost" className="flex items-center gap-2">
                <IoArrowBack />
                Back to Blog
              </Button>
            </Link>
          </motion.div>

          {/* Blog Post Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Card className="p-8">
              {/* Cover Image */}
              {blog.coverImage && (
                <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden mb-8">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="pixel-text text-3xl sm:text-4xl lg:text-5xl text-glow mb-6">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <p className="text-xl text-[var(--text-secondary)] mb-8 leading-relaxed">
                  {blog.excerpt}
                </p>
              )}

              {/* Tags */}
              {blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="info">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--text-muted)] pt-6 border-t border-[var(--border-primary)]">
                <div className="flex items-center gap-2">
                  <IoPerson className="text-[var(--neon-cyan)]" />
                  <span>{blog.createdBy.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoCalendar className="text-[var(--neon-pink)]" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoTime className="text-[var(--neon-green)]" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoEye className="text-[var(--neon-yellow)]" />
                  <span>{blog.views} views</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Blog Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="p-8">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="text-[var(--text-secondary)] leading-relaxed"
                  components={{
                    h1: ({ children }) => (
                      <h1 className="pixel-text text-2xl text-glow mb-6 mt-8 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="pixel-text text-xl text-glow mb-4 mt-6">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="pixel-text text-lg text-glow mb-3 mt-5">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="pixel-text text-base text-glow mb-2 mt-4">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-6 text-[var(--text-secondary)] leading-relaxed">{children}</p>
                    ),
                    code: ({ children }) => (
                      <code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--neon-cyan)] text-sm font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-[var(--bg-tertiary)] p-6 rounded border border-[var(--border-primary)] overflow-x-auto mb-6 font-mono text-sm">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-6 space-y-2 ml-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-6 space-y-2 ml-4">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-[var(--text-secondary)] leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[var(--neon-cyan)] pl-6 my-6 italic text-[var(--text-secondary)]">
                        {children}
                      </blockquote>
                    ),
                    img: ({ src, alt }) => (
                      <div className="my-8">
                        <img 
                          src={src} 
                          alt={alt} 
                          className="w-full rounded border border-[var(--border-primary)]"
                        />
                      </div>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-[var(--border-primary)]">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-[var(--border-primary)] px-4 py-2 bg-[var(--bg-tertiary)] pixel-text text-sm">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-[var(--border-primary)] px-4 py-2 text-sm">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            </Card>
          </motion.div>

          {/* Author Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <Card className="p-6">
              <div className="flex items-start gap-4">
                {blog.createdBy.image && (
                  <Image
                    src={blog.createdBy.image}
                    alt={blog.createdBy.name || 'Author'}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-[var(--border-primary)]"
                  />
                )}
                <div className="flex-1">
                  <h3 className="pixel-text text-lg text-glow mb-2">
                    About {blog.createdBy.name}
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-4">
                    Full-stack developer passionate about creating digital experiences 
                    that blend modern web technologies with retro gaming aesthetics.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm">
                      Follow
                    </Button>
                    <Button variant="secondary" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Related Posts */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="pixel-text text-2xl text-glow mb-8 text-center">
              More Blog Posts
            </h2>
            <div className="text-center">
              <Link href="/blog">
                <Button size="lg">
                  <IoBook className="mr-2" />
                  View All Posts
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </HydrateClient>
  );
}
