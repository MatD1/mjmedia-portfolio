import AdminBlogsClient from "~/components/pages/AdminBlogsClient";
import { HydrateClient, api } from "~/trpc/server";

interface BlogsPageProps {
	searchParams: Promise<{
		search?: string;
		published?: string;
		tag?: string;
	}>;
}

export default async function AdminBlogsPage({ searchParams }: BlogsPageProps) {
	const resolvedSearchParams = await searchParams;
	const publishedFilter =
		resolvedSearchParams.published === "true"
			? true
			: resolvedSearchParams.published === "false"
				? false
				: undefined;

	const blogs = await api.blog.getAllAdmin({
		limit: 20,
		search: resolvedSearchParams.search,
		published: publishedFilter,
		tag: resolvedSearchParams.tag,
	});

	return (
		<HydrateClient>
			<AdminBlogsClient blogs={blogs} searchParams={resolvedSearchParams} />
		</HydrateClient>
	);
}
