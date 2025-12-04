'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  IoArrowBack, 
  IoDocumentText, 
  IoImage
} from 'react-icons/io5';
import { toast } from 'sonner';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import { api } from '~/trpc/react';

const postSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  content: z.string().optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
});

type PostFormData = z.input<typeof postSchema>;

export default function NewPostPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
    }
  });

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      toast.success('Post created successfully!');
      router.push('/admin/posts');
    },
    onError: (error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });

  const onSubmit = (data: PostFormData) => {
    createPost.mutate(data);
  };

  const content = watch('content');

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <IoArrowBack />
            Back
          </Button>
          <div>
            <h1 className="pixel-text text-3xl text-glow">Create New Post</h1>
            <p className="text-[var(--text-secondary)]">
              Create a new general post or announcement.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Post Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Post Name *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Enter post name"
                  />
                  {errors.name && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Excerpt
                  </label>
                  <textarea
                    {...register('excerpt')}
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Brief description of the post (optional)"
                  />
                  {errors.excerpt && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.excerpt.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Cover Image URL
                  </label>
                  <input
                    {...register('coverImage')}
                    type="url"
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.coverImage && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.coverImage.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Content */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Post Content (Markdown)
                  </label>
                  <textarea
                    {...register('content')}
                    rows={12}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20 font-mono text-sm"
                    placeholder="Write your post content in Markdown..."
                  />
                  {errors.content && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Preview</h2>
              
              <div className="space-y-4">
                <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] flex items-center justify-center">
                  {watch('coverImage') ? (
                    <img 
                      src={watch('coverImage')} 
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <IoImage className="text-4xl text-[var(--neon-cyan)] opacity-50" />
                  )}
                </div>
                
                <div>
                  <h3 className="pixel-text text-lg text-glow mb-2">
                    {watch('name') || 'Post Name'}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {watch('excerpt') || 'Post excerpt will appear here...'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    {...register('published')}
                    type="checkbox"
                    className="w-4 h-4 text-[var(--neon-green)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--neon-green)]"
                  />
                  <span className="text-[var(--text-primary)]">Published</span>
                </label>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <div className="space-y-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  <IoDocumentText className="mr-2" />
                  Create Post
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
