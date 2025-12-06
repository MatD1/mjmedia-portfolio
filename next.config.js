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

	// Optimize images - allow external image sources
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24, // 24 hours
		remotePatterns: [
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.githubusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "cdn.discordapp.com",
				pathname: "/**",
			},
			// Minio/S3 storage - allow any hostname for flexibility
			{
				protocol: "https",
				hostname: "**",
				pathname: "/**",
			},
			{
				protocol: "http",
				hostname: "**",
				pathname: "/**",
			},
		],
	},

	// Improve cold start times
	experimental: {
		optimizePackageImports: [
			"react-icons",
			"framer-motion",
			"@tanstack/react-query",
		],
	},

	// Security and caching headers
	async headers() {
		return [
			{
				// Security headers for all routes
				source: "/(.*)",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
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
