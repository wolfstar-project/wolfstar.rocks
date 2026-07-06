import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ALL_ENV_VARS = ["CONTEXT", "URL", "PULL_REQUEST", "REVIEW_ID", "BRANCH", "NODE_ENV"];

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
		vi.stubEnv("BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "preview" and branch is "main" (non-PR)', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns true when NODE_ENV is "canary" and branch is "main"', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("BRANCH", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it('returns false when NODE_ENV is "preview", branch is "main", but is a PR', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("BRANCH", "main");
		vi.stubEnv("PULL_REQUEST", "true");
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
		if (branch !== undefined) vi.stubEnv("BRANCH", branch);
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

	it('returns "canary" for Netlify preview deploys from main branch (non-PR)', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "canary" for custom NODE_ENV "canary" on main branch', async () => {
		vi.stubEnv("NODE_ENV", "canary");
		vi.stubEnv("BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "preview" for Netlify deploy-preview PR builds', async () => {
		vi.stubEnv("CONTEXT", "deploy-preview");
		vi.stubEnv("PULL_REQUEST", "true");
		vi.stubEnv("BRANCH", "feat/foo");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
	});

	it('returns "preview" for PR deploys from main branch', async () => {
		vi.stubEnv("CONTEXT", "deploy-preview");
		vi.stubEnv("PULL_REQUEST", "true");
		vi.stubEnv("BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
	});

	it('returns "canary" for Netlify production deploys from main branch', async () => {
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("canary");
	});

	it('returns "release" for production deploys from non-main branch', async () => {
		vi.stubEnv("CONTEXT", "production");
		vi.stubEnv("BRANCH", "v1.0.0");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("release");
	});

	it('prioritises "dev" over "canary" in development mode', async () => {
		vi.stubEnv("NODE_ENV", "preview");
		vi.stubEnv("BRANCH", "main");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(true);

		expect(result.env).toBe("dev");
	});
});

describe("getPreviewUrl", () => {
	beforeEach(() => {
		// Reset consts evaluated at module init time
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

	it("returns `undefined` if no known preview env is detected", async () => {
		const { getPreviewUrl } = await import("../../../config/env");

		expect(getPreviewUrl()).toBeUndefined();
	});

	it.each([["Netlify production", { CONTEXT: "production", URL: "https://prod.example.com" }]])(
		"%s environment returns `undefined`",
		async (_name, envVars) => {
			for (const [key, value] of Object.entries(envVars)) {
				vi.stubEnv(key, value);
			}
			const { getPreviewUrl } = await import("../../../config/env");

			expect(getPreviewUrl()).toBeUndefined();
		},
	);

	it.each([
		[
			"Netlify dev",
			{ CONTEXT: "dev", URL: "https://dev.example.com" },
			"https://dev.example.com",
		],
		[
			"Netlify deploy-preview",
			{
				CONTEXT: "deploy-preview",
				URL: "https://preview.example.com",
			},
			"https://preview.example.com",
		],
		[
			"Netlify branch-deploy",
			{ CONTEXT: "branch-deploy", URL: "https://beta.example.com" },
			"https://beta.example.com",
		],
		[
			"Netlify preview-server",
			{
				CONTEXT: "preview-server",
				URL: "https://my-feat--preview.example.com",
			},
			"https://my-feat--preview.example.com",
		],
	])("%s environment returns preview URL", async (_name, envVars, expectedUrl) => {
		for (const [key, value] of Object.entries(envVars)) {
			vi.stubEnv(key, value);
		}

		const { getPreviewUrl } = await import("../../../config/env");

		expect(getPreviewUrl()).toBe(expectedUrl);
	});
});

describe("getProductionUrl", () => {
	beforeEach(() => {
		// Reset consts evaluated at module init time
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

	it("returns `undefined` if no known production env is detected", async () => {
		const { getProductionUrl } = await import("../../../config/env");

		expect(getProductionUrl()).toBeUndefined();
	});

	it.each([
		["Netlify dev", { CONTEXT: "dev", URL: "https://dev.example.com" }],
		[
			"Netlify deploy-preview",
			{
				CONTEXT: "deploy-preview",
				URL: "https://preview.example.com",
			},
		],
		["Netlify branch-deploy", { CONTEXT: "branch-deploy", URL: "https://beta.example.com" }],
		[
			"Netlify preview-server",
			{
				CONTEXT: "preview-server",
				URL: "https://my-feat--preview.example.com",
			},
		],
	])("%s environment returns `undefined`", async (_name, envVars) => {
		for (const [key, value] of Object.entries(envVars)) {
			vi.stubEnv(key, value);
		}
		const { getProductionUrl } = await import("../../../config/env");

		expect(getProductionUrl()).toBeUndefined();
	});

	it.each([
		[
			"Netlify production",
			{ CONTEXT: "production", URL: "https://prod.example.com" },
			"https://prod.example.com",
		],
	])("%s environment returns production URL", async (_name, envVars, expectedUrl) => {
		for (const [key, value] of Object.entries(envVars)) {
			vi.stubEnv(key, value);
		}
		const { getProductionUrl } = await import("../../../config/env");

		expect(getProductionUrl()).toBe(expectedUrl);
	});
});

describe("getVersion", () => {
	it('returns a valid semver string without a leading "v"', async () => {
		const { getVersion } = await import("../../../config/env");
		const result = await getVersion();

		expect(result).not.toMatch(/^v/);
		expect(result).toMatch(/^\d+\.\d+\.\d+$/);
	});
});
