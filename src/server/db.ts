import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const MAX_DB_CONNECT_ATTEMPTS = Number(
	process.env.DB_CONNECT_MAX_ATTEMPTS ?? 10,
);
const BASE_RETRY_DELAY_MS = Number(
	process.env.DB_CONNECT_BASE_DELAY_MS ?? 1_000,
);
const MAX_RETRY_DELAY_MS = Number(
	process.env.DB_CONNECT_MAX_DELAY_MS ?? 15_000,
);
const SKIP_DB_CONNECT = process.env.SKIP_DB_CONNECT === "1";

const wait = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const createPrismaClient = () =>
	new PrismaClient({
		log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
	});

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const db = globalForPrisma.prisma ?? createPrismaClient();
const shouldWarmConnection = !globalForPrisma.prisma && !SKIP_DB_CONNECT;

if (env.NODE_ENV !== "production") {
	globalForPrisma.prisma = db;
}

const connectWithRetry = async (
	client: PrismaClient,
	maxAttempts = MAX_DB_CONNECT_ATTEMPTS,
) => {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			await client.$connect();
			if (attempt > 1) {
				console.info(
					`Prisma connected after ${attempt} attempts (railway wake-up)`,
				);
			}
			return;
		} catch (error) {
			lastError = error;
			if (attempt === maxAttempts) {
				break;
			}

			const backoffDelay = Math.min(
				BASE_RETRY_DELAY_MS * 2 ** (attempt - 1),
				MAX_RETRY_DELAY_MS,
			);
			const jitter = backoffDelay * (0.75 + Math.random() * 0.5);
			const retryDelay = Math.round(jitter);

			console.warn(
				`Prisma connection failed (attempt ${attempt}/${maxAttempts}). Retrying in ${retryDelay}ms...`,
			);
			await wait(retryDelay);
		}
	}

	throw lastError;
};

/**
 * Helper to wrap database operations with retry logic for sleeping databases.
 * Use this in tRPC procedures or other server code when you need explicit retry control.
 */
async function withRetry<T>(
	operation: () => Promise<T>,
	maxAttempts = 5,
	baseDelay = 1000,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			const isPrismaConnectionError =
				error instanceof Error &&
				(error.message.includes("Can't reach database server") ||
					error.message.includes("Connection refused") ||
					error.message.includes("Connection timed out") ||
					error.message.includes("ECONNREFUSED") ||
					error.message.includes("P1001") ||
					error.message.includes("P1002") ||
					error.message.includes("P1008") ||
					error.message.includes("P1017"));

			if (!isPrismaConnectionError || attempt === maxAttempts) {
				throw error;
			}

			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.warn(
				`DB operation failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`,
			);
			await wait(delay);
		}
	}

	throw lastError;
}

if (shouldWarmConnection) {
	await connectWithRetry(db);
}

export { db, withRetry };
