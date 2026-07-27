import type { AuthSession, AuthUser } from "#nuxt-better-auth";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, vi } from "vitest";

/**
 * Mock authentication for Nuxt browser tests.
 * @see https://better-auth.nuxt.dev/guides/testing
 */
export function mockAuth(user: Partial<AuthUser> | null = null) {
	const resolvedUser: AuthUser | null = user
		? {
				id: "test-user",
				email: "test@example.com",
				emailVerified: true,
				name: "Test",
				createdAt: new Date(0),
				updatedAt: new Date(0),
				...user,
			}
		: null;

	const resolvedSession: AuthSession | null = resolvedUser
		? {
				id: "test-session",
				createdAt: new Date(0),
				updatedAt: new Date(0),
				userId: resolvedUser.id,
				expiresAt: new Date(Date.now() + 60_000),
				token: "test-token",
			}
		: null;

	mockNuxtImport("useUserSession", () => () => ({
		user: ref(resolvedUser),
		session: ref(resolvedSession),
		loggedIn: computed(() => !!resolvedUser),
		ready: computed(() => true),
		signOut: vi.fn(),
		waitForSession: vi.fn().mockResolvedValue(undefined),
		fetchSession: vi.fn().mockResolvedValue(undefined),
		updateUser: vi.fn().mockResolvedValue(undefined),
	}));

	beforeEach(() => {
		// authorization-resolver does not run here; mockNuxtImport also cannot
		// replace useUserSession in Vitest browser + viteEnvironmentApi:false.
		const app = useNuxtApp();
		if (!app.$authorization) {
			app.provide("authorization", {
				resolveClientUser: () => resolvedUser,
			});
		}
	});
}
