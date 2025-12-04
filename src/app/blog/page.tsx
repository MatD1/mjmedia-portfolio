import { api } from '~/trpc/server';
import BlogPageClient from '~/components/pages/BlogPageClient';

interface BlogPageProps {
  searchParams: {
    search?: string;
    tag?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const [blogs, tags] = await Promise.all([
    api.blog.getAll({ 
      limit: 12,
      ...(searchParams.tag && { tag: searchParams.tag })
    }),
    api.blog.getTags(),
  ]);

  return (
    <BlogPageClient 
      blogs={blogs.items}
      tags={tags}
      searchParams={searchParams}
    />
  );
}
