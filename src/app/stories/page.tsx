import { api } from '~/trpc/server';
import StoriesPageClient from '~/components/pages/StoriesPageClient';

interface StoriesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const stories = await api.story.getAll({ 
    limit: 12
  });

  return (
    <StoriesPageClient 
      stories={stories.items}
      searchParams={resolvedSearchParams}
    />
  );
}
