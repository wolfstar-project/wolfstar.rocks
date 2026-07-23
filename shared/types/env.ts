export type EnvType = "dev" | "preview" | "canary" | "release";

export interface BuildInfo {
	version: string;
	commit: string;
	shortCommit: string;
	time: number;
	branch: string;
	env: EnvType;
	privacyPolicyDate: string;
	termsDate: string;
	prNumber: string | null;
}

// `nuxt/schema` only re-exports `@nuxt/schema`, so the augmentation must
// target the declaring package for `CustomAppConfig` to merge
declare module "@nuxt/schema" {
	// `CustomAppConfig` wins over the value-inferred app config types, so the
	// literal defaults set by `modules/build-env.ts` do not narrow `env` or
	// `buildInfo` for `useAppConfig()` consumers
	interface CustomAppConfig {
		// Optional because `modules/build-env.ts` injects both values at build
		// time; app.config.ts does not (and should not) provide them
		env?: EnvType;
		buildInfo?: BuildInfo;
	}
}
