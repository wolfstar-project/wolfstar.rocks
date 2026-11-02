import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ALL_ENV_VARS = ["NODE_ENV", "WORKERS_CI_BRANCH"];

describe("isCanary", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	beforeEach(() => {
		for (const envVar of ALL_ENV_VARS) {
			vi.stubEnv(envVar, undefined);
		}
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('returns true when NODE_ENV is "production" and branch is "main"', async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "preview" and branch is "main"', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "canary" and branch is "main"', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it.each([
		["production (non-main branch)", "production", "v1.0.0"],
		["preview (non-main branch)", "preview", "feat/foo"],
		["development", "development", undefined],
		["unset", undefined, undefined],
	])("returns false when NODE_ENV is %s", async (_label, value, branch) => {
		if (value !== undefined) vi.stubEnv("NODE_ENV", value);
		if (branch !== undefined) vi.stubEnv("WORKERS_CI_BRANCH", branch);
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(false);
	});
});

describe("getEnv", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	beforeEach(() => {
		for (const envVar of ALL_ENV_VARS) {
			vi.stubEnv(envVar, undefined);
		}
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('returns "dev" in development mode', async () => {
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(true);

		expect(result.env).toBe("dev");
	});

	it('returns "canary" for preview deploys from main branch', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "canary" for custom NODE_ENV "canary" on main branch', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "canary" for production deploys from main branch', async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "release" for a Workers Build of the alpha branch', async () => {
		vi.stubEnv("WORKERS_CI_BRANCH", "refactor/v3");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("release");
	});

	it('returns "release" for a build outside Workers Builds', async () => {
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("release");
	});

	it('prioritises "dev" over "canary" in development mode', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("WORKERS_CI_BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(true);

		expect(result.env).toBe("dev");
	});
});
