import { api } from '~/trpc/server';
import AdminDashboardClient from '~/components/pages/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Run queries sequentially to reduce connection pressure on sleeping DB
  let projectCounts, blogCounts, storyCounts, postCounts, recentProjects, recentBlogs, recentStories;
  
  try {
    projectCounts = await api.project.getCounts();
    blogCounts = await api.blog.getCounts();
    storyCounts = await api.story.getCounts();
    postCounts = await api.post.getCounts();
    recentProjects = await api.project.getAllAdmin({ limit: 3 });
    recentBlogs = await api.blog.getAllAdmin({ limit: 3 });
    recentStories = await api.story.getAllAdmin({ limit: 3 });
  } catch (error) {
    console.error('[Admin Dashboard] Failed to fetch data:', error);
    // Return a fallback with empty data
    return (
      <AdminDashboardClient 
        projectCounts={{ total: 0, published: 0, featured: 0 }}
        blogCounts={{ total: 0, published: 0 }}
        storyCounts={{ total: 0, published: 0 }}
        postCounts={{ total: 0, published: 0 }}
        recent={[]}
      />
    );
  }

  const recent = [
    ...recentProjects.items.map(item => ({ id: item.id.toString(), title: item.title, published: item.published, createdAt: item.createdAt, type: 'project' as const })),
    ...recentBlogs.items.map(item => ({ id: item.id.toString(), title: item.title, published: item.published, createdAt: item.createdAt, type: 'blog' as const })),
    ...recentStories.items.map(item => ({ id: item.id.toString(), title: item.title, published: item.published, createdAt: item.createdAt, type: 'story' as const })),
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
