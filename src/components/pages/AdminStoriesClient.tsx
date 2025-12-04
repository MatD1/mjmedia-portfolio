'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	IoAdd,
	IoCalendar,
	IoCreate,
	IoEye,
	IoFilter,
	IoNewspaper,
	IoSearch,
	IoTrash,
} from 'react-icons/io5';

import type { RouterOutputs } from '~/trpc/react';
import Badge from '~/components/ui/Badge';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

type StoriesResponse = RouterOutputs['story']['getAllAdmin'];

interface AdminStoriesClientProps {
	stories: StoriesResponse;
	searchParams: {
		search?: string;
		published?: string;
	};
}

export default function AdminStoriesClient({
	stories,
	searchParams,
}: AdminStoriesClientProps) {
	const showEmptyState = stories.items.length === 0;

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
						<h1 className="pixel-text text-3xl text-glow mb-2">Stories</h1>
						<p className="text-[var(--text-secondary)]">
							Manage your personal stories and experiences.
						</p>
					</div>
					<Link href="/admin/stories/new">
						<Button size="lg">
							<IoAdd className="mr-2" />
							New Story
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
								placeholder="Search stories..."
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

			{/* Stories List */}
			{showEmptyState ? (
				<div className="text-center py-20">
					<IoNewspaper className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
					<h3 className="pixel-text text-xl text-glow mb-2">No Stories Found</h3>
					<p className="text-[var(--text-secondary)] mb-6">
						{searchParams.search
							? "Try adjusting your search criteria"
							: "No stories have been created yet"}
					</p>
					<Link href="/admin/stories/new">
						<Button size="lg">
							<IoAdd className="mr-2" />
							Create First Story
						</Button>
					</Link>
				</div>
			) : (
				<div className="space-y-4">
					{stories.items.map((story, index) => (
						<motion.div
							key={story.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
						>
							<Card className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-start gap-4 mb-4">
											{story.coverImage && (
												<div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden flex-shrink-0">
													<img
														src={story.coverImage}
														alt={story.title}
														className="w-full h-full object-cover"
													/>
												</div>
											)}

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between mb-2">
													<h3 className="pixel-text text-lg text-glow truncate">
														{story.title}
													</h3>
													<div className="flex items-center gap-2 ml-4">
														<Badge
															variant={story.published ? "success" : "warning"}
															size="sm"
														>
															{story.published ? "Published" : "Draft"}
														</Badge>
													</div>
												</div>

												<p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">
													{story.excerpt || `${story.content.substring(0, 150)}...`}
												</p>

												<div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
													<span className="flex items-center gap-1">
														<IoCalendar />
														{new Date(story.createdAt).toLocaleDateString()}
													</span>
													<span>by {story.createdBy.name}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 ml-4">
										<Link href={`/stories/${story.id}`}>
											<Button variant="ghost" size="sm">
												<IoEye />
											</Button>
										</Link>
										<Link href={`/admin/stories/${story.id}/edit`}>
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

