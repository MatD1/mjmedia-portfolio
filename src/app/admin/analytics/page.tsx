import AdminAnalyticsClient from "~/components/pages/AdminAnalyticsClient";
import { HydrateClient, api } from "~/trpc/server";

export default async function AnalyticsPage() {
	const [stats, realtime] = await Promise.all([
		api.analytics.getStats({}),
		api.analytics.getRealtime(),
	]);

	return (
		<HydrateClient>
			<AdminAnalyticsClient stats={stats} realtime={realtime} />
		</HydrateClient>
	);
}
