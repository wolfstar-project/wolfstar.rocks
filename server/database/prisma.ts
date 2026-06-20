import { PrismaClient } from "#server/database/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { isDevelopment } from "std-env";

interface PrismaGlobal {
	prisma?: PrismaClient;
}

const globalForPrisma = globalThis as PrismaGlobal;

function resolvePoolMax(): number {
	const fromEnv = process.env.DATABASE_POOL_MAX;
	if (fromEnv !== undefined) {
		const parsed = Number.parseInt(fromEnv, 10);
		if (Number.isFinite(parsed) && parsed > 0) {
			return parsed;
		}
	}

	// Serverless invocations should hold at most one connection per warm instance.
	return isDevelopment ? 10 : 1;
}

function createPrismaClient(connectionString: string): PrismaClient {
	const adapter = new PrismaPg({
		connectionString,
		max: resolvePoolMax(),
		idleTimeoutMillis: 5_000,
		connectionTimeoutMillis: 5_000,
	});

	return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
	if (!globalForPrisma.prisma) {
		const connectionString = process.env.DATABASE_URL;
		if (!connectionString) {
			throw new Error("DATABASE_URL is not set");
		}

		globalForPrisma.prisma = createPrismaClient(connectionString);
	}

	return globalForPrisma.prisma;
}

const prisma = new Proxy({} as PrismaClient, {
	get(_target, property, receiver) {
		const client = getPrismaClient();
		const value = Reflect.get(client, property, receiver);
		return typeof value === "function" ? value.bind(client) : value;
	},
});

export default prisma;
