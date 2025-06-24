export interface BuildInfo {
	version: string;
	commit: string;
	shortCommit: string;
	time: number;
	branch: string;
	env: Env.Canary | Env.Dev | Env.Release;
}

export enum Env {
	Canary = 'canary',
	Dev = 'dev',
	Release = 'release'
}


export {};

declare module 'h3' {
	interface H3EventContext {
			errorHandled: boolean;
	}
}
