import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "@auth/core/adapters";
import type { PrismaClient } from "@prisma/client";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if an error is a Prisma connection error that should be retried
 */
function isConnectionError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	const message = error.message;
	return (
		message.includes("Can't reach database server") ||
		message.includes("Connection refused") ||
		message.includes("Connection timed out") ||
		message.includes("ECONNREFUSED") ||
		message.includes("ETIMEDOUT") ||
		message.includes("ENOTFOUND") ||
		message.includes("P1001") ||
		message.includes("P1002") ||
		message.includes("P1008") ||
		message.includes("P1017") ||
		message.includes("connection pool") ||
		message.includes("Server has closed the connection")
	);
}

/**
 * Wrap an async function with retry logic for connection errors
 */
async function withRetry<T>(
	operation: () => T | Promise<T>,
	operationName: string,
	maxAttempts = 3,
	baseDelay = 500,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			if (!isConnectionError(error) || attempt === maxAttempts) {
				throw error;
			}

			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.warn(
				`[Auth Adapter] ${operationName} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`,
			);
			await wait(delay);
		}
	}

	throw lastError;
}

/**
 * Wrap an adapter method with retry logic, handling optional methods
 */
function wrapMethod<T extends (...args: never[]) => unknown>(
	method: T | undefined,
	name: string,
): T | undefined {
	if (!method) return undefined;
	return ((...args: Parameters<T>) =>
		withRetry(() => method(...args), name)) as T;
}

/**
 * Creates a resilient PrismaAdapter that retries on connection errors.
 * This is essential for Railway deployments where the database may be
 * temporarily unreachable due to internal networking issues.
 */
export function ResilientPrismaAdapter(prisma: PrismaClient): Adapter {
	const base = PrismaAdapter(prisma);

	return {
		createUser: wrapMethod(base.createUser, "createUser"),
		getUser: wrapMethod(base.getUser, "getUser"),
		getUserByEmail: wrapMethod(base.getUserByEmail, "getUserByEmail"),
		getUserByAccount: wrapMethod(base.getUserByAccount, "getUserByAccount"),
		updateUser: wrapMethod(base.updateUser, "updateUser"),
		deleteUser: wrapMethod(base.deleteUser, "deleteUser"),
		linkAccount: wrapMethod(base.linkAccount, "linkAccount"),
		unlinkAccount: wrapMethod(base.unlinkAccount, "unlinkAccount"),
		createSession: wrapMethod(base.createSession, "createSession"),
		getSessionAndUser: wrapMethod(base.getSessionAndUser, "getSessionAndUser"),
		updateSession: wrapMethod(base.updateSession, "updateSession"),
		deleteSession: wrapMethod(base.deleteSession, "deleteSession"),
		createVerificationToken: wrapMethod(base.createVerificationToken, "createVerificationToken"),
		useVerificationToken: wrapMethod(base.useVerificationToken, "useVerificationToken"),
	} as Adapter;
}

