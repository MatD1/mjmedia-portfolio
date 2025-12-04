import { api } from '~/trpc/server';
import AdminDashboardClient from '~/components/pages/AdminDashboardClient';

export default async function AdminDashboard() {
  const [projectCounts, blogCounts, storyCounts, postCounts, recentProjects, recentBlogs, recentStories] = await Promise.all([
    api.project.getCounts(),
    api.blog.getCounts(),
    api.story.getCounts(),
    api.post.getCounts(),
    api.project.getAllAdmin({ limit: 3 }),
    api.blog.getAllAdmin({ limit: 3 }),
    api.story.getAllAdmin({ limit: 3 }),
  ]);

  const recent = [
    ...recentProjects.items.map(item => ({ id: item.id, title: item.title, published: item.published, createdAt: item.createdAt, type: 'project' as const })),
    ...recentBlogs.items.map(item => ({ id: item.id, title: item.title, published: item.published, createdAt: item.createdAt, type: 'blog' as const })),
    ...recentStories.items.map(item => ({ id: item.id, title: item.title, published: item.published, createdAt: item.createdAt, type: 'story' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <AdminDashboardClient 
      projectCounts={projectCounts}
      blogCounts={blogCounts}
      storyCounts={storyCounts}
      postCounts={postCounts}
      recent={recent}
    />
  );
}
