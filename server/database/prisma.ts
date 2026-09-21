import type { Contract } from "#server/database/prisma8/contract";
import { PrismaClient } from "#server/database/generated/client";
import contractJson from "#server/database/prisma8/contract.json" with { type: "json" };
import { PrismaPg } from "@prisma/adapter-pg";
import postgres from "@prisma/orm-postgres/runtime";

interface GetDbParams {
	connectionString: string;
}

function getDb({ connectionString }: GetDbParams) {
	const pool = new PrismaPg({ connectionString });

	const prisma = new PrismaClient({ adapter: pool });

	return prisma;
}

const databaseUrl = process.env.DATABASE_URL;
const connectionString = databaseUrl!;

/**
 * Prisma ORM 7 client, kept for `server/utils/audit/postgres-drain.ts` alone.
 *
 * The drain opens its transaction at `Serializable` and retries the
 * serialization failures that isolation produces, which is what keeps the audit
 * hash chain from forking under concurrent writes. The ORM 8 façade's
 * `db.transaction()` takes no isolation level and surfaces no equivalent typed
 * error, so that one consumer stays here until it does.
 */
const prisma = getDb({ connectionString });

/**
 * Prisma ORM 8 client, running against the same database as {@link prisma}.
 * Every other consumer reads and writes through this one; see the upgrade guide
 * at https://www.prisma.io/docs/guides/upgrade-prisma-orm/postgresql.
 */
// @ts-expect-error -- the emitted `ContractWithTypeMaps` does not satisfy the
// façade's `Contract<SqlStorage<string>>` bound in @prisma/orm-postgres
// 8.0.0-rc.10. Only this constraint check fails: `db.orm` types correctly at
// every call site. Dropping the type argument and letting it infer is worse —
// the contract then resolves to its defaults and every field reads as possibly
// undefined. Remove the directive once a release accepts the emitted type; an
// unused one fails the build, so it cannot outlive the fix.
export const db = postgres<Contract>({ url: connectionString, contractJson });

export { prisma };
export default prisma;
