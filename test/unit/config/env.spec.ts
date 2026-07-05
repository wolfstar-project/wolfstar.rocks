import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ALL_VENDOR_ENV_VARS = [
	"NETLIFY",
	"CONTEXT",
	"URL",
	"PULL_REQUEST",
	"REVIEW_ID",
	"BRANCH",
	"COMMIT_REF",
	"VERCEL",
	"VERCEL_ENV",
	"VERCEL_URL",
	"VERCEL_GIT_COMMIT_REF",
	"VERCEL_GIT_COMMIT_SHA",
	"VERCEL_GIT_PULL_REQUEST_ID",
	"VERCEL_PROJECT_PRODUCTION_URL",
	"RAILWAY_PROJECT_ID",
	"RAILWAY_ENVIRONMENT_NAME",
	"RAILWAY_PUBLIC_DOMAIN",
	"RAILWAY_GIT_BRANCH",
	"RAILWAY_GIT_COMMIT_SHA",
	"NODE_ENV",
] as const;

function stubVendorEnv(vendor: "netlify" | "vercel" | "railway") {
	for (const envVar of ALL_VENDOR_ENV_VARS) {
		vi.stubEnv(envVar, undefined);
	}

	switch (vendor) {
		case "netlify":
			vi.stubEnv("NETLIFY", "true");
			break;
		case "vercel":
			vi.stubEnv("VERCEL", "1");
			break;
		case "railway":
			vi.stubEnv("RAILWAY_PROJECT_ID", "test-project-id");
			break;
	}
}

describe("isCanary", () => {
	beforeEach(() => {
		vi.resetModules();
		stubVendorEnv("netlify");
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

	it("returns true on Vercel production deploys from main (non-PR)", async () => {
		vi.resetModules();
		stubVendorEnv("vercel");
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("VERCEL_ENV", "production");
		vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(true);
	});

	it("returns false on Vercel preview deploys triggered by a pull request", async () => {
		vi.resetModules();
		stubVendorEnv("vercel");
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("VERCEL_ENV", "preview");
		vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");
		vi.stubEnv("VERCEL_GIT_PULL_REQUEST_ID", "42");
		const { isCanary } = await import("../../../config/env");

		expect(isCanary).toBe(false);
	});
});

describe("getEnv", () => {
	beforeEach(() => {
		vi.resetModules();
		stubVendorEnv("netlify");
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

	it('returns "preview" for Vercel preview deployments', async () => {
		vi.resetModules();
		stubVendorEnv("vercel");
		vi.stubEnv("VERCEL_ENV", "preview");
		vi.stubEnv("VERCEL_GIT_COMMIT_REF", "feat/foo");
		vi.stubEnv("VERCEL_GIT_PULL_REQUEST_ID", "99");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
		expect(result.prNumber).toBe("99");
	});

	it('returns "preview" for Railway ephemeral PR environments', async () => {
		vi.resetModules();
		stubVendorEnv("railway");
		vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "pr-42");
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "preview.up.railway.app");
		vi.stubEnv("RAILWAY_GIT_BRANCH", "feat/foo");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("preview");
		expect(result.prNumber).toBeNull();
	});

	it('returns "release" for Railway production deploys from non-main branch', async () => {
		vi.resetModules();
		stubVendorEnv("railway");
		vi.stubEnv("NODE_ENV", "production");
		vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "production");
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "wolfstar.rocks");
		vi.stubEnv("RAILWAY_GIT_BRANCH", "v1.0.0");
		const { getEnv } = await import("../../../config/env");
		const result = await getEnv(false);

		expect(result.env).toBe("release");
	});
});

describe("getPreviewUrl", () => {
	beforeEach(() => {
		vi.resetModules();
		stubVendorEnv("netlify");
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

	it("returns Vercel preview URL with https prefix", async () => {
		vi.resetModules();
		stubVendorEnv("vercel");
		vi.stubEnv("VERCEL_ENV", "preview");
		vi.stubEnv("VERCEL_URL", "wolfstar-git-feat.vercel.app");
		const { getPreviewUrl } = await import("../../../config/env");

		expect(getPreviewUrl()).toBe("https://wolfstar-git-feat.vercel.app");
	});

	it("returns Railway preview URL with https prefix", async () => {
		vi.resetModules();
		stubVendorEnv("railway");
		vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "pr-42");
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "preview.up.railway.app");
		vi.stubEnv("RAILWAY_GIT_BRANCH", "feat/foo");
		const { getPreviewUrl } = await import("../../../config/env");

		expect(getPreviewUrl()).toBe("https://preview.up.railway.app");
	});
});

describe("getProductionUrl", () => {
	beforeEach(() => {
		vi.resetModules();
		stubVendorEnv("netlify");
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

	it("returns Vercel production URL with https prefix", async () => {
		vi.resetModules();
		stubVendorEnv("vercel");
		vi.stubEnv("VERCEL_ENV", "production");
		vi.stubEnv("VERCEL_URL", "wolfstar.vercel.app");
		const { getProductionUrl } = await import("../../../config/env");

		expect(getProductionUrl()).toBe("https://wolfstar.vercel.app");
	});

	it("returns Railway production URL with https prefix", async () => {
		vi.resetModules();
		stubVendorEnv("railway");
		vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "production");
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "wolfstar.rocks");
		const { getProductionUrl } = await import("../../../config/env");

		expect(getProductionUrl()).toBe("https://wolfstar.rocks");
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
