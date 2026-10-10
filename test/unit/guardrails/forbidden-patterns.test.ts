/**
 * Forbidden-Pattern Guardrail
 *
 * AGENTS.md and docs/arch record invariants that a reviewer cannot be expected to remember:
 * each one was a production failure or a silent misconfiguration before it
 * became a rule. This file turns the greppable ones into failing tests, and each
 * rule carries its reason so the failure message explains itself.
 *
 * Every rule also ships a `bad` and a `good` snippet. They keep the detectors
 * honest: a regex that stops matching its own counter-example fails here instead
 * of silently passing the repository.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");

const SKIPPED_DIRECTORIES = new Set([
	"node_modules",
	".nuxt",
	".output",
	".git",
	".data",
	".claude",
	".agents",
	".skills",
]);

interface Rule {
	id: string;
	/** Why the pattern is forbidden. Shown on failure. */
	reason: string;
	/** Files or directories, relative to the repository root. */
	roots: string[];
	extensions: string[];
	/** Returns one entry per violation found in `source`. */
	violations: (source: string) => string[];
	/** Must produce at least one violation. */
	bad: string;
	/** Must produce none. */
	good: string;
}

/** Block comments and whole-line or trailing `//` comments, so prose cannot trip a rule. */
function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

function matches(source: string, pattern: RegExp, label: string): string[] {
	const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
	return Array.from(source.matchAll(new RegExp(pattern.source, flags)), () => label);
}

/** Text between the first `<template>` and the last `</template>` of an SFC. */
function templateOf(source: string): string {
	const start = source.indexOf("<template");
	const end = source.lastIndexOf("</template>");
	return start === -1 || end === -1 ? "" : source.slice(start, end);
}

/** Body of the first `name: { ... }` object literal, matched by brace depth. */
function objectBody(source: string, name: string): string | undefined {
	const match = new RegExp(`\\b${name}\\s*:\\s*\\{`).exec(source);
	if (!match) return undefined;
	let depth = 0;
	for (let i = match.index + match[0].length - 1; i < source.length; i++) {
		if (source[i] === "{") depth++;
		else if (source[i] === "}" && --depth === 0) {
			return source.slice(match.index, i + 1);
		}
	}
	return undefined;
}

function collectFiles(root: string, extensions: string[]): string[] {
	const absolute = join(ROOT, root);
	if (!existsSync(absolute)) return [];
	if (statSync(absolute).isFile()) return [absolute];

	const files: string[] = [];
	const walk = (directory: string): void => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
			const path = join(directory, entry.name);
			if (entry.isDirectory()) walk(path);
			else if (extensions.some((extension) => entry.name.endsWith(extension)))
				files.push(path);
		}
	};
	walk(absolute);
	return files;
}

const V5_DEFAULT_FLAGS = [
	"typedPages",
	"routeTypedFetch",
	"payloadExtraction",
	"inlineErrorRendering",
	"navigateToEarlyReturn",
	"extractSerializablePageMeta",
	"normalizePageNames",
	"watcher",
];

const RELATIVE_IMPORT = /\bfrom\s+["'](\.{1,2}\/[^"']*)["']/g;

const RULES: Rule[] = [
	{
		id: "no-forced-session-fetch-in-oauth-callback",
		reason: "fetchSession({ force: true }) bypasses the jwe cookie cache the callback just wrote and races the eventually-consistent KV write, so a successful sign-in shows a false 'session not found'. Use fetchSessionWithRetry() and a plain fetchSession().",
		roots: ["app/pages/oauth/callback.vue", "app/utils/oauth-session-retry.ts"],
		extensions: [".vue", ".ts"],
		violations: (source) =>
			matches(
				stripComments(source),
				/fetchSession\(\s*\{[^}]*\bforce\s*:\s*true/,
				"fetchSession({ force: true })",
			),
		bad: "await fetchSession({ force: true });",
		good: "await fetchSession();",
	},
	{
		id: "no-discord-redirect-env-var",
		reason: "The Discord redirect URI is derived from NUXT_PUBLIC_SITE_URL by resolveDiscordRedirectURI(). A separate variable drifts, and when it is empty better-auth silently substitutes a callback Discord has not registered.",
		roots: [
			"app",
			"server",
			"shared",
			"modules",
			"config",
			"scripts",
			"nuxt.config.ts",
			".env.example",
			"netlify.toml",
		],
		extensions: [".ts", ".vue", ".mjs", ".js", ".json", ".example", ".toml"],
		violations: (source) =>
			matches(
				stripComments(source),
				/NUXT_OAUTH_DISCORD_REDIRECT_URL/,
				"NUXT_OAUTH_DISCORD_REDIRECT_URL",
			),
		bad: "const url = process.env.NUXT_OAUTH_DISCORD_REDIRECT_URL;",
		good: "const url = runtimeConfig.public.siteUrl;",
	},
	{
		id: "no-nuxt-auth-utils",
		reason: "nuxt-auth-utils was removed in the better-auth migration (#297). Import session state from useUserSession() and types from #nuxt-better-auth, never from #auth-utils.",
		roots: ["app", "server", "shared", "modules", "config"],
		extensions: [".ts", ".vue"],
		violations: (source) =>
			matches(
				stripComments(source),
				/\bfrom\s+["'](?:nuxt-auth-utils|#auth-utils)["']/,
				"import from nuxt-auth-utils / #auth-utils",
			),
		bad: 'import type { User } from "#auth-utils";',
		good: 'import type { AuthUser } from "#nuxt-better-auth";',
	},
	{
		id: "no-local-get-user-session",
		reason: "The module auto-imports a server util named getUserSession into every server/ file, and a local declaration silently shadows it module-wide. The local helper is called resolveHandlerSession.",
		roots: ["server"],
		extensions: [".ts"],
		violations: (source) =>
			matches(
				stripComments(source),
				/\b(?:function|const|let|var)\s+getUserSession\b/,
				"local getUserSession declaration",
			),
		bad: "function getUserSession(event) {}",
		good: "function resolveHandlerSession(event) {}",
	},
	{
		id: "no-value-import-from-nuxt-better-auth",
		reason: "#nuxt-better-auth is an ambient declare module, not a real alias, so it can only be imported for types. A value import fails at runtime.",
		roots: ["app", "server", "shared", "test"],
		extensions: [".ts", ".vue"],
		violations: (source) =>
			matches(
				stripComments(source),
				/^[ \t]*import\s(?!\s*type\b)[^;]*?\bfrom\s*["']#nuxt-better-auth["']/m,
				"value import from #nuxt-better-auth",
			),
		bad: 'import { useAuth } from "#nuxt-better-auth";',
		good: 'import type { AuthUser } from "#nuxt-better-auth";',
	},
	{
		id: "no-secret-or-base-url-in-server-auth-config",
		reason: "@nuxtjs/better-auth spreads its own secret and baseURL over defineServerAuth(), so both are silently ignored. baseURL comes from runtimeConfig.public.siteUrl.",
		roots: ["server/auth.config.ts"],
		extensions: [".ts"],
		violations: (source) =>
			matches(
				stripComments(source),
				/^\s*(?:secret|baseURL)\s*:/m,
				"secret or baseURL key in server auth config",
			),
		bad: "export default defineServerAuth({\n\tbaseURL: 'https://wolfstar.rocks',\n});",
		good: "export default defineServerAuth({\n\ttrustedOrigins: () => [],\n});",
	},
	{
		id: "translate-with-ts-not-t",
		reason: "Nuxt I18n Micro's t() can return an object or array for a non-leaf key. ts() is the string-safe variant with the same signature, so components destructure ts from useI18n().",
		roots: ["app"],
		extensions: [".vue", ".ts"],
		violations: (source) =>
			matches(
				stripComments(source),
				/const\s*\{[^}]*\bt\b[^}]*\}\s*=\s*useI18n\(/,
				"t destructured from useI18n()",
			),
		bad: "const { t } = useI18n();",
		good: "const { ts } = useI18n();",
	},
	{
		id: "no-get-locale-in-template",
		reason: "Nuxt I18n Micro exposes locale state as plain getters, so $getLocale() in a template never re-renders on a locale switch. Read it through useAppLocale().",
		roots: ["app"],
		extensions: [".vue"],
		violations: (source) =>
			matches(templateOf(source), /\$getLocale\s*\(/, "$getLocale() in a template"),
		bad: "<template><span>{{ $getLocale() }}</span></template>",
		good: "<template><span>{{ locale }}</span></template>",
	},
	{
		id: "no-v5-defaults-in-experimental",
		reason: "future.compatibilityVersion: 5 already enables these flags. Repeating them in experimental hides the flags the project really overrides.",
		roots: ["nuxt.config.ts"],
		extensions: [".ts"],
		violations: (source) => {
			const body = objectBody(stripComments(source), "experimental") ?? "";
			return V5_DEFAULT_FLAGS.filter((flag) => new RegExp(`\\b${flag}\\s*:`).test(body));
		},
		bad: "experimental: {\n\ttypedPages: true,\n}",
		good: "experimental: {\n\tearly404: true,\n}",
	},
	{
		id: "explicit-extensions-in-natively-loaded-files",
		reason: "Nuxt 5 loads nuxt.config.ts and local modules natively in Node before falling back to jiti, so relative imports need an explicit .ts (or .json with { type: 'json' }) extension.",
		roots: ["nuxt.config.ts", "modules", "config", "test/e2e"],
		extensions: [".ts"],
		violations: (source) =>
			Array.from(stripComments(source).matchAll(RELATIVE_IMPORT), (match) => match[1] ?? "")
				.filter((specifier) => !/\.(?:ts|mts|json|mjs|js)$/.test(specifier))
				.map((specifier) => `extensionless import ${specifier}`),
		bad: 'import { pwa } from "./config/pwa";',
		good: 'import { pwa } from "./config/pwa.ts";',
	},
];

describe("forbidden patterns", () => {
	describe.each(RULES)("$id", (rule) => {
		it("detects its own counter-example", () => {
			expect(rule.violations(rule.bad).length).toBeGreaterThan(0);
		});

		it("allows its own good example", () => {
			expect(rule.violations(rule.good)).toEqual([]);
		});

		it("holds across the repository", () => {
			const files = rule.roots.flatMap((root) => collectFiles(root, rule.extensions));
			// A moved or renamed root would otherwise pass vacuously.
			expect(
				files.length,
				`${rule.id}: no files matched ${rule.roots.join(", ")}`,
			).toBeGreaterThan(0);

			const found = files.flatMap((file) =>
				rule
					.violations(readFileSync(file, "utf-8"))
					.map(
						(violation) => `${relative(ROOT, file).split(sep).join("/")}: ${violation}`,
					),
			);

			expect(found, `${rule.id}: ${rule.reason}`).toEqual([]);
		});
	});

	describe("removed OAuth state endpoints", () => {
		it.each(["server/api/auth/discord.get.ts", "server/utils/oauth-state.ts"])(
			"does not bring back %s",
			(path) => {
				// better-auth's own /api/auth/sign-in/social and /api/auth/callback/discord
				// routes own the OAuth flow and its CSRF state.
				expect(existsSync(join(ROOT, path))).toBe(false);
			},
		);
	});
});
