'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	IoAdd,
	IoBook,
	IoCalendar,
	IoCreate,
	IoEye,
	IoFilter,
	IoSearch,
	IoTrash,
	IoEye as IoViews,
} from 'react-icons/io5';

import type { RouterOutputs } from '~/trpc/react';
import Badge from '~/components/ui/Badge';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

type BlogListResponse = RouterOutputs['blog']['getAllAdmin'];

interface AdminBlogsClientProps {
	blogs: BlogListResponse;
	searchParams: {
		search?: string;
		published?: string;
		tag?: string;
	};
}

export default function AdminBlogsClient({
	blogs,
	searchParams,
}: AdminBlogsClientProps) {
	const showEmptyState = blogs.items.length === 0;

	return (
		<div className="space-y-8">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="pixel-text text-3xl text-glow mb-2">Blog Posts</h1>
						<p className="text-[var(--text-secondary)]">
							Manage your blog posts and share your thoughts.
						</p>
					</div>
					<Link href="/admin/blogs/new">
						<Button size="lg">
							<IoAdd className="mr-2" />
							New Blog Post
						</Button>
					</Link>
				</div>
			</motion.div>

			{/* Search and Filter Bar */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.1 }}
			>
				<Card className="p-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neon-cyan)]" />
							<input
								type="text"
								placeholder="Search blog posts..."
								className="w-full pl-10 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
								defaultValue={searchParams.search || ''}
							/>
						</div>

						<div className="flex gap-2">
							<select
								className="px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)]"
								defaultValue={searchParams.published || 'all'}
							>
								<option value="all">All Status</option>
								<option value="true">Published</option>
								<option value="false">Draft</option>
							</select>

							<Button variant="secondary" className="flex items-center gap-2">
								<IoFilter />
								Filter
							</Button>
						</div>
					</div>
				</Card>
			</motion.div>

			{/* Blogs List */}
			{showEmptyState ? (
				<div className="text-center py-20">
					<IoBook className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
					<h3 className="pixel-text text-xl text-glow mb-2">No Blog Posts Found</h3>
					<p className="text-[var(--text-secondary)] mb-6">
						{searchParams.search || searchParams.tag
							? 'Try adjusting your search criteria'
							: 'No blog posts have been created yet'}
					</p>
					<Link href="/admin/blogs/new">
						<Button size="lg">
							<IoAdd className="mr-2" />
							Create First Blog Post
						</Button>
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{blogs.items.map((blog, index) => (
						<motion.div
							key={blog.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
						>
							<Card className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-start gap-4 mb-4">
											{blog.coverImage && (
												<div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden flex-shrink-0">
													<img
														src={blog.coverImage}
														alt={blog.title}
														className="w-full h-full object-cover"
													/>
												</div>
											)}

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between mb-2">
													<h3 className="pixel-text text-lg text-glow truncate">
														{blog.title}
													</h3>
													<div className="flex items-center gap-2 ml-4">
														<Badge
															variant={blog.published ? "success" : "warning"}
															size="sm"
														>
															{blog.published ? "Published" : "Draft"}
														</Badge>
													</div>
												</div>

												<p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
													{blog.excerpt || `${blog.content.substring(0, 150)}...`}
												</p>

												<div className="flex flex-wrap gap-2 mb-3">
													{blog.tags.slice(0, 4).map((tag) => (
														<Badge key={tag} variant="default" size="sm">
															{tag}
														</Badge>
													))}
													{blog.tags.length > 4 && (
														<Badge variant="info" size="sm">
															+{blog.tags.length - 4}
														</Badge>
													)}
												</div>

												<div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
													<span className="flex items-center gap-1">
														<IoViews />
														{blog.views} views
													</span>
													<span className="flex items-center gap-1">
														<IoCalendar />
														{new Date(blog.createdAt).toLocaleDateString()}
													</span>
													<span>by {blog.createdBy.name}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 ml-4">
										<Link href={`/blog/${blog.id}`}>
											<Button variant="ghost" size="sm">
												<IoEye />
											</Button>
										</Link>
										<Link href={`/admin/blogs/${blog.id}/edit`}>
											<Button variant="secondary" size="sm">
												<IoCreate />
											</Button>
										</Link>
										<Button variant="danger" size="sm">
											<IoTrash />
										</Button>
									</div>
								</div>
							</Card>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
}

