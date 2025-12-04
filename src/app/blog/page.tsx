import { api } from '~/trpc/server';
import BlogPageClient from '~/components/pages/BlogPageClient';

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const [blogs, tags] = await Promise.all([
    api.blog.getAll({ 
      limit: 12,
      ...(resolvedSearchParams.tag && { tag: resolvedSearchParams.tag })
    }),
    api.blog.getTags(),
  ]);

  return (
    <BlogPageClient 
      blogs={blogs.items}
      tags={tags}
      searchParams={resolvedSearchParams}
    />
  );
}
