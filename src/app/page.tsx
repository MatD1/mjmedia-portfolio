import { HydrateClient, api } from "~/trpc/server";
import HomePageClient from "~/components/pages/HomePageClient";

export default async function Home() {
	// Fetch featured content
	const [featuredProjects, latestBlogs] = await Promise.all([
		api.project.getAll({ limit: 3, featured: true }),
		api.blog.getAll({ limit: 3 }),
	]);

	return (
		<HydrateClient>
			<HomePageClient 
				featuredProjects={featuredProjects.items}
				latestBlogs={latestBlogs.items}
			/>
		</HydrateClient>
	);
}