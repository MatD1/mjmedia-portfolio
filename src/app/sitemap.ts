import type { MetadataRoute } from 'next';
import { api } from '~/trpc/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  try {
    // Dynamic pages - projects
    const projects = await api.project.getAll({ limit: 100 });
    const projectPages = projects.items.map((project) => ({
      url: `${baseUrl}/projects/${project.id}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // Dynamic pages - blog posts
    const blogs = await api.blog.getAll({ limit: 100 });
    const blogPages = blogs.items.map((blog) => ({
      url: `${baseUrl}/blog/${blog.id}`,
      lastModified: new Date(blog.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    // Dynamic pages - stories
    const stories = await api.story.getAll({ limit: 100 });
    const storyPages = stories.items.map((story) => ({
      url: `${baseUrl}/stories/${story.id}`,
      lastModified: new Date(story.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...projectPages, ...blogPages, ...storyPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
