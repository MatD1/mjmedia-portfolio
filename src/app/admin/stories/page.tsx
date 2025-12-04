import AdminStoriesClient from "~/components/pages/AdminStoriesClient";
import { HydrateClient, api } from "~/trpc/server";

interface StoriesPageProps {
	searchParams: Promise<{
		search?: string;
		published?: string;
	}>;
}

export default async function AdminStoriesPage({ searchParams }: StoriesPageProps) {
	const resolvedSearchParams = await searchParams;
	const publishedFilter =
		resolvedSearchParams.published === "true"
			? true
			: resolvedSearchParams.published === "false"
				? false
				: undefined;

	const stories = await api.story.getAllAdmin({
		limit: 20,
		search: resolvedSearchParams.search,
		published: publishedFilter,
	});

	return (
		<HydrateClient>
			<AdminStoriesClient stories={stories} searchParams={resolvedSearchParams} />
		</HydrateClient>
	);
}
