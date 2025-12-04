import { api } from '~/trpc/server';
import AdminProjectsClient from '~/components/pages/AdminProjectsClient';

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string;
    published?: string;
  }>;
}

export default async function AdminProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const projects = await api.project.getAllAdmin({ 
    limit: 20,
    search: resolvedSearchParams.search,
    published: resolvedSearchParams.published === 'true' ? true : resolvedSearchParams.published === 'false' ? false : undefined
  });

  return <AdminProjectsClient projects={projects.items} searchParams={resolvedSearchParams} />;
}
