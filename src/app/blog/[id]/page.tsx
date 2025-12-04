import { notFound } from "next/navigation";

import BlogPostPageClient from "~/components/pages/BlogPostPageClient";
import { HydrateClient, api } from "~/trpc/server";

interface BlogPostPageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
	const resolvedParams = await params;
	const blog = await api.blog.getById({ id: Number(resolvedParams.id) });

	if (!blog) {
		return {
			title: "Blog Post Not Found",
		};
	}

	return {
		title: `${blog.title} - MJ Media Blog`,
		description: blog.excerpt || blog.content.substring(0, 160),
		openGraph: {
			title: blog.title,
			description: blog.excerpt || blog.content.substring(0, 160),
			images: blog.coverImage ? [blog.coverImage] : [],
		},
	};
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const resolvedParams = await params;
	const blog = await api.blog.getById({ id: Number(resolvedParams.id) });

	if (!blog) {
		notFound();
	}

	return (
		<HydrateClient>
			<BlogPostPageClient blog={blog} />
		</HydrateClient>
	);
}
