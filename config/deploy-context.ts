import * as process from "node:process";

export type DeployVendor = "netlify" | "vercel" | "railway" | "local";

export interface DeployContext {
	vendor: DeployVendor;
	isPR: boolean;
	prNumber: string | null;
	gitBranch: string | undefined;
	isPreview: boolean;
	isProduction: boolean;
	commitRef: string | undefined;
}

const RAILWAY_PERMANENT_ENVIRONMENTS = new Set(["production", "staging"]);

function normalizeUrl(hostOrUrl: string | undefined): string | undefined {
	if (!hostOrUrl) {
		return undefined;
	}

	return hostOrUrl.startsWith("http://") || hostOrUrl.startsWith("https://")
		? hostOrUrl
		: `https://${hostOrUrl}`;
}

function detectVendor(): DeployVendor {
	if (process.env.NETLIFY) {
		return "netlify";
	}

	if (process.env.VERCEL) {
		return "vercel";
	}

	if (process.env.RAILWAY_PROJECT_ID) {
		return "railway";
	}

	return "local";
}

function resolveNetlifyContext(): DeployContext {
	const isPR = process.env.PULL_REQUEST === "true";
	const context = process.env.CONTEXT;
	const isProduction = context === "production";
	const isPreview = isPR || Boolean(context && context !== "production");

	return {
		vendor: "netlify",
		isPR,
		prNumber: process.env.REVIEW_ID || null,
		gitBranch: process.env.BRANCH,
		isPreview,
		isProduction,
		commitRef: process.env.COMMIT_REF,
	};
}

function resolveVercelContext(): DeployContext {
	const prNumber = process.env.VERCEL_GIT_PULL_REQUEST_ID || null;
	const isPR = Boolean(prNumber);
	const vercelEnv = process.env.VERCEL_ENV;
	const isProduction = vercelEnv === "production";
	const isPreview = vercelEnv === "preview";

	return {
		vendor: "vercel",
		isPR,
		prNumber,
		gitBranch: process.env.VERCEL_GIT_COMMIT_REF,
		isPreview,
		isProduction,
		commitRef: process.env.VERCEL_GIT_COMMIT_SHA,
	};
}

function resolveRailwayContext(): DeployContext {
	const environmentName = process.env.RAILWAY_ENVIRONMENT_NAME?.toLowerCase();
	const gitBranch = process.env.RAILWAY_GIT_BRANCH;
	const isProduction = environmentName === "production";
	const isPreview = Boolean(process.env.RAILWAY_PUBLIC_DOMAIN) && !isProduction;
	const isPR =
		Boolean(gitBranch) &&
		environmentName !== undefined &&
		!RAILWAY_PERMANENT_ENVIRONMENTS.has(environmentName);

	return {
		vendor: "railway",
		isPR,
		prNumber: null,
		gitBranch,
		isPreview,
		isProduction,
		commitRef: process.env.RAILWAY_GIT_COMMIT_SHA,
	};
}

function resolveLocalContext(): DeployContext {
	return {
		vendor: "local",
		isPR: false,
		prNumber: null,
		gitBranch: undefined,
		isPreview: false,
		isProduction: false,
		commitRef: undefined,
	};
}

export function getDeployContext(): DeployContext {
	switch (detectVendor()) {
		case "netlify":
			return resolveNetlifyContext();
		case "vercel":
			return resolveVercelContext();
		case "railway":
			return resolveRailwayContext();
		default:
			return resolveLocalContext();
	}
}

export function getPreviewUrlFromContext(context: DeployContext): string | undefined {
	if (!context.isPreview) {
		return undefined;
	}

	switch (context.vendor) {
		case "netlify":
			return normalizeUrl(process.env.URL);
		case "vercel":
			return normalizeUrl(process.env.VERCEL_URL);
		case "railway":
			return normalizeUrl(process.env.RAILWAY_PUBLIC_DOMAIN);
		default:
			return undefined;
	}
}

export function getProductionUrlFromContext(context: DeployContext): string | undefined {
	if (!context.isProduction) {
		return undefined;
	}

	switch (context.vendor) {
		case "netlify":
			return normalizeUrl(process.env.URL);
		case "vercel":
			return normalizeUrl(
				process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL,
			);
		case "railway":
			return normalizeUrl(process.env.RAILWAY_PUBLIC_DOMAIN);
		default:
			return undefined;
	}
}
