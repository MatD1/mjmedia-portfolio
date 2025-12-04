'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  IoArrowBack, 
  IoNewspaper, 
  IoImage
} from 'react-icons/io5';
import { toast } from 'sonner';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Loading from '~/components/ui/Loading';
import { api } from '~/trpc/react';

const storySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  published: z.boolean().default(false),
});

type StoryFormData = z.infer<typeof storySchema>;

interface EditStoryPageProps {
  params: {
    id: string;
  };
}

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const router = useRouter();
  const storyId = parseInt(params.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
  });

  const { data: story, isLoading } = api.story.getById.useQuery(
    { id: storyId },
    { enabled: !!storyId }
  );

  const updateStory = api.story.update.useMutation({
    onSuccess: () => {
      toast.success('Story updated successfully!');
      router.push('/admin/stories');
    },
    onError: (error) => {
      toast.error(`Failed to update story: ${error.message}`);
    },
  });

  // Load story data when it's available
  useEffect(() => {
    if (story) {
      reset({
        title: story.title,
        content: story.content,
        excerpt: story.excerpt || '',
        coverImage: story.coverImage || '',
        published: story.published,
      });
    }
  }, [story, reset]);

  const onSubmit = (data: StoryFormData) => {
    updateStory.mutate({
      id: storyId,
      ...data,
    });
  };

  const content = watch('content');

  if (isLoading) {
    return <Loading text="Loading story..." />;
  }

  if (!story) {
    return (
      <div className="text-center py-20">
        <h3 className="pixel-text text-xl text-glow mb-2">Story Not Found</h3>
        <p className="text-[var(--text-secondary)] mb-6">
          The story you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push('/admin/stories')}>
          Back to Stories
        </Button>
      </div>
    );
  }

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
            <h1 className="pixel-text text-3xl text-glow">Edit Story</h1>
            <p className="text-[var(--text-secondary)]">
              Update story content and settings.
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
              <h2 className="pixel-text text-lg text-glow mb-4">Story Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Title *
                  </label>
                  <input
                    {...register('title')}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Enter story title"
                  />
                  {errors.title && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.title.message}</p>
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
                    placeholder="Brief description of the story (optional)"
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
              <h2 className="pixel-text text-lg text-glow mb-4">Story Content</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Story Content (Markdown) *
                  </label>
                  <textarea
                    {...register('content')}
                    rows={12}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20 font-mono text-sm"
                    placeholder="Write your story content in Markdown..."
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
                    {watch('title') || 'Story Title'}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {watch('excerpt') || 'Story excerpt will appear here...'}
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
                  <IoNewspaper className="mr-2" />
                  Update Story
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
