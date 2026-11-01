import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ALL_ENV_VARS = [
	"GITHUB_EVENT_NAME",
	"GITHUB_HEAD_REF",
	"GITHUB_REF_NAME",
	"NODE_ENV",
	"WORKERS_CI_BRANCH",
];

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
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "preview" and branch is "main" (non-PR)', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "canary" and branch is "main"', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns false when NODE_ENV is "preview", branch is "main", but is a PR', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(false);
	});

	it.each([
		["production (non-main branch)", "production", "v1.0.0"],
		["preview (non-main branch)", "preview", "feat/foo"],
		["development", "development", undefined],
		["unset", undefined, undefined],
	])("returns false when NODE_ENV is %s", async (_label, value, branch) => {
		if (value !== undefined) vi.stubEnv("NODE_ENV", value);
		if (branch !== undefined) vi.stubEnv("GITHUB_REF_NAME", branch);
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

	it('returns "canary" for preview deploys from main branch (non-PR)', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "canary" for custom NODE_ENV "canary" on main branch', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "preview" for PR builds', async () => {
		vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
		vi.stubEnv("GITHUB_REF_NAME", "feat/foo");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
	});

	it('returns "preview" for PR deploys from main branch', async () => {
		vi.stubEnv("GITHUB_EVENT_NAME", "pull_request");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
	});

	it('returns "canary" for production deploys from main branch', async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "release" for production deploys from the release branch', async () => {
		vi.stubEnv("GITHUB_REF_NAME", "release");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("release");
	});

	it('prioritises "dev" over "canary" in development mode', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("GITHUB_REF_NAME", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(true);

		expect(result.env).toBe("dev");
	});
});
