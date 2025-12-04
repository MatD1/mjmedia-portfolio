import { notFound } from "next/navigation";

import ProjectDetailPageClient from "~/components/pages/ProjectDetailPageClient";
import { HydrateClient, api } from "~/trpc/server";

interface ProjectPageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
	const resolvedParams = await params;
	const project = await api.project.getById({ id: Number(resolvedParams.id) });

	if (!project) {
		return {
			title: "Project Not Found",
		};
	}

	return {
		title: `${project.title} - MJ Media`,
		description: project.description,
		openGraph: {
			title: project.title,
			description: project.description,
			images: project.images[0] ? [project.images[0]] : [],
		},
	};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
	const resolvedParams = await params;
	const project = await api.project.getById({ id: Number(resolvedParams.id) });

	if (!project) {
		notFound();
	}

	return (
		<HydrateClient>
			<ProjectDetailPageClient project={project} />
		</HydrateClient>
	);
}
