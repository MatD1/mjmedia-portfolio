import { api } from '~/trpc/server';
import ProjectsPageClient from '~/components/pages/ProjectsPageClient';

interface ProjectsPageProps {
  searchParams: {
    search?: string;
    tech?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const projects = await api.project.getAll({ 
    limit: 12,
    ...(searchParams.tech && { tech: searchParams.tech })
  });

  return (
    <ProjectsPageClient 
      projects={projects.items}
      searchParams={searchParams}
    />
  );
}
