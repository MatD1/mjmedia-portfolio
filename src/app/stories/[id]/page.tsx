import { notFound } from "next/navigation";

import StoryDetailPageClient from "~/components/pages/StoryDetailPageClient";
import { HydrateClient, api } from "~/trpc/server";

interface StoryPageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({ params }: StoryPageProps) {
	const resolvedParams = await params;
	const story = await api.story.getById({ id: Number(resolvedParams.id) });

	if (!story) {
		return {
			title: "Story Not Found",
		};
	}

	return {
		title: `${story.title} - MJ Media Stories`,
		description: story.excerpt || story.content.substring(0, 160),
		openGraph: {
			title: story.title,
			description: story.excerpt || story.content.substring(0, 160),
			images: story.coverImage ? [story.coverImage] : [],
		},
	};
}

export default async function StoryPage({ params }: StoryPageProps) {
	const resolvedParams = await params;
	const story = await api.story.getById({ id: Number(resolvedParams.id) });

	if (!story) {
		notFound();
	}

	return (
		<HydrateClient>
			<StoryDetailPageClient story={story} />
		</HydrateClient>
	);
}
