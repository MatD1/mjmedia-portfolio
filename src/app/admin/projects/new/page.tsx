'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  IoArrowBack, 
  IoCodeSlash, 
  IoGlobe, 
  IoLogoGithub,
  IoStar,
  IoImage,
  IoAdd,
  IoTrash
} from 'react-icons/io5';
import { toast } from 'sonner';

import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import { api } from '~/trpc/react';

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  content: z.string().optional(),
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.number().min(0).default(0),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      featured: false,
      published: false,
      order: 0,
    }
  });

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      toast.success('Project created successfully!');
      router.push('/admin/projects');
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProject.mutate({
      ...data,
      techStack,
      images,
    });
  };

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const addImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (image: string) => {
    setImages(images.filter(img => img !== image));
  };

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
            <h1 className="pixel-text text-3xl text-glow">Create New Project</h1>
            <p className="text-[var(--text-secondary)]">
              Add a new project to your portfolio.
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
              <h2 className="pixel-text text-lg text-glow mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Project Title *
                  </label>
                  <input
                    {...register('title')}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Describe your project"
                  />
                  {errors.description && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Content (Markdown)
                  </label>
                  <textarea
                    {...register('content')}
                    rows={8}
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20 font-mono text-sm"
                    placeholder="Write detailed project content in Markdown..."
                  />
                </div>
              </div>
            </Card>

            {/* Tech Stack */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Tech Stack</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Add technology (e.g., React, TypeScript)"
                  />
                  <Button type="button" onClick={addTech}>
                    <IoAdd />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge key={tech} variant="info" className="flex items-center gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-[var(--neon-red)] transition-colors"
                      >
                        <IoTrash size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Project Images</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="Add image URL"
                  />
                  <Button type="button" onClick={addImage}>
                    <IoImage />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border border-[var(--border-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-1 right-1 p-1 bg-[var(--neon-red)] text-[var(--bg-primary)] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IoTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* URLs */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Project Links</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <IoGlobe className="inline mr-2" />
                    Live URL
                  </label>
                  <input
                    {...register('liveUrl')}
                    type="url"
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="https://example.com"
                  />
                  {errors.liveUrl && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.liveUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <IoLogoGithub className="inline mr-2" />
                    GitHub URL
                  </label>
                  <input
                    {...register('githubUrl')}
                    type="url"
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                    placeholder="https://github.com/username/repo"
                  />
                  {errors.githubUrl && (
                    <p className="text-[var(--neon-red)] text-sm mt-1">{errors.githubUrl.message}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Settings */}
            <Card className="p-6">
              <h2 className="pixel-text text-lg text-glow mb-4">Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Display Order
                  </label>
                  <input
                    {...register('order', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      className="w-4 h-4 text-[var(--neon-cyan)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--neon-cyan)]"
                    />
                    <span className="text-[var(--text-primary)] flex items-center gap-2">
                      <IoStar />
                      Featured Project
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      {...register('published')}
                      type="checkbox"
                      className="w-4 h-4 text-[var(--neon-green)] bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded focus:ring-[var(--neon-green)]"
                    />
                    <span className="text-[var(--text-primary)]">Published</span>
                  </label>
                </div>
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
                  <IoCodeSlash className="mr-2" />
                  Create Project
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
