import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.js";

export const analyticsRouter = createTRPCRouter({
  // Get analytics data from Umami
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // Check if Umami is configured
      if (!env.UMAMI_API_URL || !env.UMAMI_API_TOKEN || !env.UMAMI_WEBSITE_ID) {
        return {
          pageViews: 0,
          visitors: 0,
          topPages: [],
          referrers: [],
          devices: [],
          error: "Umami analytics not configured"
        };
      }

      try {
        const { startDate, endDate } = input;
        const baseUrl = env.UMAMI_API_URL;
        const token = env.UMAMI_API_TOKEN;
        const websiteId = env.UMAMI_WEBSITE_ID;

        // Default to last 30 days if no dates provided
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const params = new URLSearchParams({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          timezone: 'UTC'
        });

        // Fetch analytics data from Umami API
        const [statsResponse, pagesResponse, referrersResponse, devicesResponse] = await Promise.all([
          fetch(`${baseUrl}/websites/${websiteId}/stats?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${baseUrl}/websites/${websiteId}/pages?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${baseUrl}/websites/${websiteId}/referrers?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${baseUrl}/websites/${websiteId}/devices?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const [stats, pages, referrers, devices] = await Promise.all([
          statsResponse.json(),
          pagesResponse.json(),
          referrersResponse.json(),
          devicesResponse.json()
        ]);

        return {
          pageViews: stats.pageviews || 0,
          visitors: stats.visitors || 0,
          topPages: pages.slice(0, 10) || [],
          referrers: referrers.slice(0, 10) || [],
          devices: devices || [],
          error: null
        };
      } catch (error) {
        console.error('Error fetching Umami analytics:', error);
        return {
          pageViews: 0,
          visitors: 0,
          topPages: [],
          referrers: [],
          devices: [],
          error: "Failed to fetch analytics data"
        };
      }
    }),

  // Get real-time analytics
  getRealtime: protectedProcedure.query(async () => {
    if (!env.UMAMI_API_URL || !env.UMAMI_API_TOKEN || !env.UMAMI_WEBSITE_ID) {
      return {
        activeVisitors: 0,
        error: "Umami analytics not configured"
      };
    }

    try {
      const baseUrl = env.UMAMI_API_URL;
      const token = env.UMAMI_API_TOKEN;
      const websiteId = env.UMAMI_WEBSITE_ID;

      const response = await fetch(`${baseUrl}/websites/${websiteId}/realtime`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      return {
        activeVisitors: data.activeVisitors || 0,
        error: null
      };
    } catch (error) {
      console.error('Error fetching real-time analytics:', error);
      return {
        activeVisitors: 0,
        error: "Failed to fetch real-time data"
      };
    }
  }),
});
