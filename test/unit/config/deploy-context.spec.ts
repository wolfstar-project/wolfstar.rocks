import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getDeployContext,
	getPreviewUrlFromContext,
	getProductionUrlFromContext,
} from "../../../config/deploy-context";

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
];

describe("getDeployContext", () => {
	beforeEach(() => {
		for (const envVar of ALL_VENDOR_ENV_VARS) {
			vi.stubEnv(envVar, undefined);
		}
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("detects Netlify deployments", () => {
		vi.stubEnv("NETLIFY", "true");
		vi.stubEnv("CONTEXT", "deploy-preview");
		vi.stubEnv("PULL_REQUEST", "true");
		vi.stubEnv("REVIEW_ID", "42");
		vi.stubEnv("BRANCH", "feat/foo");
		vi.stubEnv("COMMIT_REF", "abc123");

		expect(getDeployContext()).toEqual({
			vendor: "netlify",
			isPR: true,
			prNumber: "42",
			gitBranch: "feat/foo",
			isPreview: true,
			isProduction: false,
			commitRef: "abc123",
		});
	});

	it("detects Vercel deployments", () => {
		vi.stubEnv("VERCEL", "1");
		vi.stubEnv("VERCEL_ENV", "preview");
		vi.stubEnv("VERCEL_GIT_COMMIT_REF", "main");
		vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "def456");
		vi.stubEnv("VERCEL_GIT_PULL_REQUEST_ID", "17");

		expect(getDeployContext()).toEqual({
			vendor: "vercel",
			isPR: true,
			prNumber: "17",
			gitBranch: "main",
			isPreview: true,
			isProduction: false,
			commitRef: "def456",
		});
	});

	it("detects Railway deployments", () => {
		vi.stubEnv("RAILWAY_PROJECT_ID", "project-id");
		vi.stubEnv("RAILWAY_ENVIRONMENT_NAME", "production");
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "wolfstar.rocks");
		vi.stubEnv("RAILWAY_GIT_BRANCH", "main");
		vi.stubEnv("RAILWAY_GIT_COMMIT_SHA", "ghi789");

		expect(getDeployContext()).toEqual({
			vendor: "railway",
			isPR: false,
			prNumber: null,
			gitBranch: "main",
			isPreview: false,
			isProduction: true,
			commitRef: "ghi789",
		});
	});

	it("prefers Netlify when multiple vendor markers are present", () => {
		vi.stubEnv("NETLIFY", "true");
		vi.stubEnv("VERCEL", "1");
		vi.stubEnv("RAILWAY_PROJECT_ID", "project-id");

		expect(getDeployContext().vendor).toBe("netlify");
	});
});

describe("deploy URL helpers", () => {
	beforeEach(() => {
		for (const envVar of ALL_VENDOR_ENV_VARS) {
			vi.stubEnv(envVar, undefined);
		}
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("normalizes Vercel hostnames to https URLs", () => {
		vi.stubEnv("VERCEL_URL", "wolfstar.vercel.app");

		const context = {
			vendor: "vercel" as const,
			isPR: false,
			prNumber: null,
			gitBranch: "main",
			isPreview: true,
			isProduction: false,
			commitRef: undefined,
		};

		expect(getPreviewUrlFromContext(context)).toBe("https://wolfstar.vercel.app");
	});

	it("keeps Netlify URLs unchanged when already absolute", () => {
		vi.stubEnv("URL", "https://preview.example.com");

		const context = {
			vendor: "netlify" as const,
			isPR: true,
			prNumber: "1",
			gitBranch: "feat/foo",
			isPreview: true,
			isProduction: false,
			commitRef: undefined,
		};

		expect(getPreviewUrlFromContext(context)).toBe("https://preview.example.com");
	});

	it("returns production URLs only for production contexts", () => {
		vi.stubEnv("RAILWAY_PUBLIC_DOMAIN", "wolfstar.rocks");

		const previewContext = {
			vendor: "railway" as const,
			isPR: true,
			prNumber: null,
			gitBranch: "feat/foo",
			isPreview: true,
			isProduction: false,
			commitRef: undefined,
		};

		const productionContext = {
			...previewContext,
			isPreview: false,
			isProduction: true,
		};

		expect(getProductionUrlFromContext(previewContext)).toBeUndefined();
		expect(getProductionUrlFromContext(productionContext)).toBe("https://wolfstar.rocks");
	});
});
