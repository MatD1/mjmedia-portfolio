import type { DefaultSession, NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { db, withRetry } from "~/server/db";
import { env } from "~/env.js";
import { ResilientPrismaAdapter } from "./resilient-adapter";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			role: "VIEWER" | "ADMIN";
		} & DefaultSession["user"];
	}

	interface User {
		role: "VIEWER" | "ADMIN";
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		GitHubProvider({
			clientId: env.AUTH_GITHUB_ID,
			clientSecret: env.AUTH_GITHUB_SECRET,
		}),
	],
	// Use resilient adapter that retries on connection errors
	adapter: ResilientPrismaAdapter(db),
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				role: user.role,
			},
		}),
		signIn: async ({ user }) => {
			// Check if user email is in admin list
			if (user.email && env.ADMIN_EMAILS) {
				const adminEmails = env.ADMIN_EMAILS.split(",").map((email) =>
					email.trim(),
				);
				if (adminEmails.includes(user.email)) {
					// Update user role to ADMIN with retry
					await withRetry(() =>
						db.user.update({
							where: { email: user.email! },
							data: { role: "ADMIN" },
						}),
					);
				}
			}
			return true;
		},
	},
} satisfies NextAuthConfig;
