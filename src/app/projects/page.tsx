import { api } from '~/trpc/server';
import ProjectsPageClient from '~/components/pages/ProjectsPageClient';

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string;
    tech?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const projects = await api.project.getAll({ 
    limit: 12,
    ...(resolvedSearchParams.tech && { tech: resolvedSearchParams.tech })
  });

  return (
    <ProjectsPageClient 
      projects={projects.items}
      searchParams={resolvedSearchParams}
    />
  );
}
