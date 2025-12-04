'use client';

import { motion } from 'framer-motion';
import {
	IoAnalytics,
	IoDesktop,
	IoEye,
	IoGlobe,
	IoPeople,
	IoPhonePortrait,
	IoTabletPortrait,
	IoTrendingUp,
} from 'react-icons/io5';

import type { RouterOutputs } from '~/trpc/react';
import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

type AnalyticsStats = RouterOutputs['analytics']['getStats'];
type RealtimeStats = RouterOutputs['analytics']['getRealtime'];
type TopPage = AnalyticsStats['topPages'][number];
type ReferrerItem = AnalyticsStats['referrers'][number];
type DeviceItem = AnalyticsStats['devices'][number];

interface AdminAnalyticsClientProps {
	stats: AnalyticsStats;
	realtime: RealtimeStats;
}

export default function AdminAnalyticsClient({
	stats,
	realtime,
}: AdminAnalyticsClientProps) {
	const renderContent = () => {
		if (stats.error) {
			return (
				<Card className="p-8 text-center">
					<IoAnalytics className="text-6xl text-[var(--neon-cyan)] mx-auto mb-4 opacity-50" />
					<h3 className="pixel-text text-xl text-glow mb-2">Analytics Not Configured</h3>
					<p className="text-[var(--text-secondary)] mb-6">{stats.error}</p>
					<Button variant="secondary">Configure Umami</Button>
				</Card>
			);
		}

		return (
			<>
				{/* Main Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<Card className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-[var(--neon-cyan)]/20 rounded">
									<IoEye className="text-2xl text-[var(--neon-cyan)]" />
								</div>
								<div>
									<h3 className="pixel-text text-lg text-glow">Page Views</h3>
									<p className="text-3xl font-bold text-[var(--text-primary)]">
										{stats.pageViews.toLocaleString()}
									</p>
								</div>
							</div>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<Card className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-[var(--neon-green)]/20 rounded">
									<IoPeople className="text-2xl text-[var(--neon-green)]" />
								</div>
								<div>
									<h3 className="pixel-text text-lg text-glow">Visitors</h3>
									<p className="text-3xl font-bold text-[var(--text-primary)]">
										{stats.visitors.toLocaleString()}
									</p>
								</div>
							</div>
						</Card>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<Card className="p-6">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-[var(--neon-pink)]/20 rounded">
									<IoTrendingUp className="text-2xl text-[var(--neon-pink)]" />
								</div>
								<div>
									<h3 className="pixel-text text-lg text-glow">Active Now</h3>
									<p className="text-3xl font-bold text-[var(--text-primary)]">
										{realtime.activeVisitors}
									</p>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>

				{/* Top Pages */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					<Card className="p-6">
						<h3 className="pixel-text text-lg text-glow mb-4">Top Pages</h3>
						<div className="space-y-3">
								{stats.topPages.length > 0 ? (
									stats.topPages.map((page: TopPage, index: number) => (
									<div
										key={page.page}
										className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)]"
									>
										<div className="flex items-center gap-3">
											<span className="pixel-text text-sm text-[var(--neon-cyan)] w-6">
												{index + 1}
											</span>
											<span className="text-[var(--text-primary)] truncate">{page.page}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-[var(--text-secondary)] text-sm">
												{page.views} views
											</span>
											<div className="w-16 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
												<div
													className="h-full bg-[var(--neon-cyan)] rounded-full"
													style={{
														width: `${Math.min(
															(page.views / (stats.topPages[0]?.views || 1)) * 100,
															100,
														)}%`,
													}}
												/>
											</div>
										</div>
									</div>
								))
							) : (
								<p className="text-[var(--text-secondary)] text-center py-8">
									No page data available
								</p>
							)}
						</div>
					</Card>
				</motion.div>

				{/* Referrers and Devices */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Referrers */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<Card className="p-6">
							<h3 className="pixel-text text-lg text-glow mb-4">Top Referrers</h3>
							<div className="space-y-3">
								{stats.referrers.length > 0 ? (
									stats.referrers.map((referrer: ReferrerItem) => (
										<div
											key={referrer.referrer || "direct"}
											className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)]"
										>
											<div className="flex items-center gap-3">
												<IoGlobe className="text-[var(--neon-green)]" />
												<span className="text-[var(--text-primary)] truncate">
													{referrer.referrer || "Direct"}
												</span>
											</div>
											<span className="text-[var(--text-secondary)] text-sm">
												{referrer.views} views
											</span>
										</div>
									))
								) : (
									<p className="text-[var(--text-secondary)] text-center py-8">
										No referrer data available
									</p>
								)}
							</div>
						</Card>
					</motion.div>

					{/* Devices */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						<Card className="p-6">
							<h3 className="pixel-text text-lg text-glow mb-4">Device Types</h3>
							<div className="space-y-3">
								{stats.devices.length > 0 ? (
									stats.devices.map((device: DeviceItem) => {
										const normalized = device.device.toLowerCase();
										const DeviceIcon = normalized.includes("mobile")
											? IoPhonePortrait
											: normalized.includes("tablet")
												? IoTabletPortrait
												: IoDesktop;

										return (
											<div
												key={device.device}
												className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)]"
											>
												<div className="flex items-center gap-3">
													<DeviceIcon className="text-[var(--neon-pink)]" />
													<span className="text-[var(--text-primary)]">{device.device}</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-[var(--text-secondary)] text-sm">
														{device.views} views
													</span>
													<div className="w-16 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
														<div
															className="h-full bg-[var(--neon-pink)] rounded-full"
															style={{
																width: `${Math.min(
																	(device.views / (stats.devices[0]?.views || 1)) *
																		100,
																	100,
																)}%`,
															}}
														/>
													</div>
												</div>
											</div>
										);
									})
								) : (
									<p className="text-[var(--text-secondary)] text-center py-8">
										No device data available
									</p>
								)}
							</div>
						</Card>
					</motion.div>
				</div>
			</>
		);
	};

	return (
		<div className="space-y-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
			>
				<h1 className="pixel-text text-3xl text-glow mb-2">Analytics</h1>
				<p className="text-[var(--text-secondary)]">
					Track your website performance and visitor insights.
				</p>
			</motion.div>
			{renderContent()}
		</div>
	);
}