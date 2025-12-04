'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
	IoArrowBack,
	IoCalendar,
	IoCodeSlash,
	IoGlobe,
	IoLogoGithub,
	IoPerson,
} from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { RouterOutputs } from '~/trpc/react';
import Badge from '~/components/ui/Badge';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

type Project = NonNullable<RouterOutputs['project']['getById']>;

interface ProjectDetailPageClientProps {
	project: Project;
}

export default function ProjectDetailPageClient({
	project,
}: ProjectDetailPageClientProps) {
	return (
		<main className="min-h-screen py-20">
			<div className="container mx-auto px-4">
				{/* Back Button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8"
				>
					<Link href="/projects">
						<Button variant="ghost" className="flex items-center gap-2">
							<IoArrowBack />
							Back to Projects
						</Button>
					</Link>
				</motion.div>

				{/* Project Header */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-12"
				>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* Project Images */}
						<div className="space-y-4">
							{project.images.length > 0 ? (
								<div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden">
									<Image
										src={project.images[0]!}
										alt={project.title}
										width={800}
										height={450}
										className="w-full h-full object-cover"
									/>
								</div>
							) : (
								<div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] flex items-center justify-center">
									<IoCodeSlash className="text-6xl text-[var(--neon-cyan)] opacity-50" />
								</div>
							)}

							{/* Additional Images */}
							{project.images.length > 1 && (
								<div className="grid grid-cols-2 gap-4">
									{project.images.slice(1, 5).map((image, index) => (
										<div
											key={`${image}-${index}`}
											className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden"
										>
											<Image
												src={image}
												alt={`${project.title} screenshot ${index + 2}`}
												width={400}
												height={225}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Project Info */}
						<div className="space-y-6">
							<div>
								<div className="flex items-start justify-between mb-4">
									<h1 className="pixel-text text-3xl sm:text-4xl text-glow">
										{project.title}
									</h1>
									{project.featured && (
										<Badge variant="success">Featured</Badge>
									)}
								</div>

								<p className="text-lg text-[var(--text-secondary)] leading-relaxed">
									{project.description}
								</p>
							</div>

							{/* Tech Stack */}
							<div>
								<h3 className="pixel-text text-lg text-glow mb-3">Tech Stack</h3>
								<div className="flex flex-wrap gap-2">
									{project.techStack.map((tech) => (
										<Badge key={tech} variant="info">
											{tech}
										</Badge>
									))}
								</div>
							</div>

							{/* Project Links */}
							<div className="flex flex-col sm:flex-row gap-4">
								{project.liveUrl && (
									<Link
										href={project.liveUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-1"
									>
										<Button size="lg" className="flex items-center gap-2 w-full">
											<IoGlobe />
											View Live Demo
										</Button>
									</Link>
								)}
								{project.githubUrl && (
									<Link
										href={project.githubUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex-1"
									>
										<Button
											variant="secondary"
											size="lg"
											className="flex items-center gap-2 w-full"
										>
											<IoLogoGithub />
											View Source
										</Button>
									</Link>
								)}
							</div>

							{/* Project Meta */}
							<Card className="p-4">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="flex items-center gap-2">
										<IoCalendar className="text-[var(--neon-cyan)]" />
										<span className="text-[var(--text-secondary)]">
											{new Date(project.createdAt).toLocaleDateString()}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<IoPerson className="text-[var(--neon-pink)]" />
										<span className="text-[var(--text-secondary)]">
											{project.createdBy.name}
										</span>
									</div>
								</div>
							</Card>
						</div>
					</div>
				</motion.div>

				{/* Project Content */}
				{project.content && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="mb-12"
					>
						<Card className="p-8">
							<h2 className="pixel-text text-2xl text-glow mb-6">Project Details</h2>
							<div className="prose prose-invert max-w-none">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										h1: ({ children }) => (
											<h1 className="pixel-text text-xl text-glow mb-4">{children}</h1>
										),
										h2: ({ children }) => (
											<h2 className="pixel-text text-lg text-glow mb-3">{children}</h2>
										),
										h3: ({ children }) => (
											<h3 className="pixel-text text-base text-glow mb-2">{children}</h3>
										),
										p: ({ children }) => (
											<p className="mb-4 text-[var(--text-secondary)]">{children}</p>
										),
										code: ({ children }) => (
											<code className="bg-[var(--bg-tertiary)] px-2 py-1 rounded text-[var(--neon-cyan)] text-sm">
												{children}
											</code>
										),
										pre: ({ children }) => (
											<pre className="bg-[var(--bg-tertiary)] p-4 rounded border border-[var(--border-primary)] overflow-x-auto mb-4">
												{children}
											</pre>
										),
										ul: ({ children }) => (
											<ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
										),
										ol: ({ children }) => (
											<ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
										),
										li: ({ children }) => (
											<li className="text-[var(--text-secondary)]">{children}</li>
										),
										a: ({ href, children }) => (
											<a
												href={href ?? '#'}
												className="text-[var(--neon-cyan)] hover:text-[var(--neon-pink)] transition-colors"
												target="_blank"
												rel="noopener noreferrer"
											>
												{children}
											</a>
										),
									}}
								>
									{project.content}
								</ReactMarkdown>
							</div>
						</Card>
					</motion.div>
				)}

				{/* Related Projects */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<h2 className="pixel-text text-2xl text-glow mb-8 text-center">
						More Projects
					</h2>
					<div className="text-center">
						<Link href="/projects">
							<Button size="lg">
								<IoCodeSlash className="mr-2" />
								View All Projects
							</Button>
						</Link>
					</div>
				</motion.div>
			</div>
		</main>
	);
}

