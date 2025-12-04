import { api } from '~/trpc/server';
import AdminProjectsClient from '~/components/pages/AdminProjectsClient';

interface ProjectsPageProps {
  searchParams: {
    search?: string;
    published?: string;
  };
}

export default async function AdminProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = await api.project.getAllAdmin({ 
    limit: 20,
    search: searchParams.search,
    published: searchParams.published === 'true' ? true : searchParams.published === 'false' ? false : undefined
  });

  return <AdminProjectsClient projects={projects.items} searchParams={searchParams} />;
}
