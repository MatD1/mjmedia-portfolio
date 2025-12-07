import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		AUTH_SECRET:
			process.env.NODE_ENV === "production"
				? z.string()
				: z.string().optional(),
		AUTH_GITHUB_ID: z.string(),
		AUTH_GITHUB_SECRET: z.string(),
		DATABASE_URL: z.string().url(),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		UMAMI_API_URL: z.string().url().optional(),
		UMAMI_API_TOKEN: z.string().optional(),
		UMAMI_WEBSITE_ID: z.string().optional(),
		ADMIN_EMAILS: z.string().optional(), // comma-separated list of admin emails
		// Minio/S3 storage (using MINIMO_ prefix as per .env file)
		MINIMO_URL: z.string().optional(),
		MINIMO_ACCESS_KEY: z.string().optional(),
		MINIMO_ACCESS_SECRET: z.string().optional(),
		MINIMO_STORAGE_BUCKET: z.string().optional(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		AUTH_SECRET: authSecret,
		AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
		AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		UMAMI_API_URL: process.env.UMAMI_API_URL,
		UMAMI_API_TOKEN: process.env.UMAMI_API_TOKEN,
		UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
		ADMIN_EMAILS: process.env.ADMIN_EMAILS,
		MINIMO_URL: process.env.MINIMO_URL,
		MINIMO_ACCESS_KEY: process.env.MINIMO_ACCESS_KEY,
		MINIMO_ACCESS_SECRET: process.env.MINIMO_ACCESS_SECRET,
		MINIMO_STORAGE_BUCKET: process.env.MINIMO_STORAGE_BUCKET,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
