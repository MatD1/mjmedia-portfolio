import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const MAX_DB_CONNECT_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1_000;

const wait = (ms: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, ms);
	});

const createPrismaClient = () =>
	new PrismaClient({
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const db = globalForPrisma.prisma ?? createPrismaClient();
const shouldWarmConnection = !globalForPrisma.prisma;

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

			const retryDelay = BASE_RETRY_DELAY_MS * attempt;
			console.warn(
				`Prisma connection failed (attempt ${attempt}/${maxAttempts}). Retrying in ${retryDelay}ms...`,
			);
			await wait(retryDelay);
		}
	}

	throw lastError;
};

if (shouldWarmConnection) {
	await connectWithRetry(db);
}

export { db };
