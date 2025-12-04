import AdminPostsClient from "~/components/pages/AdminPostsClient";
import { HydrateClient, api } from "~/trpc/server";

interface PostsPageProps {
	searchParams: Promise<{
		search?: string;
		published?: string;
	}>;
}

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
	const resolvedSearchParams = await searchParams;
	const publishedFilter =
		resolvedSearchParams.published === "true"
			? true
			: resolvedSearchParams.published === "false"
				? false
				: undefined;

	const posts = await api.post.getAllAdmin({
		limit: 20,
		search: resolvedSearchParams.search,
		published: publishedFilter,
	});

	return (
		<HydrateClient>
			<AdminPostsClient posts={posts} searchParams={resolvedSearchParams} />
		</HydrateClient>
	);
}
