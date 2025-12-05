/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	// Output standalone build for Docker deployments
	output: "standalone",

	// Reduce bundle size by not including source maps in production
	productionBrowserSourceMaps: false,

	// Compress responses
	compress: true,

	// Optimize images
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24, // 24 hours
	},

	// Improve cold start times
	experimental: {
		// Enable PPR for faster page loads (if available)
		optimizePackageImports: [
			"react-icons",
			"framer-motion",
			"@tanstack/react-query",
		],
	},

	// Headers for caching static assets
	async headers() {
		return [
			{
				source: "/fonts/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/:path*.svg",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
};

export default config;
