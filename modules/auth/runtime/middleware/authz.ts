import type { AuthMeta } from "../types";
// @ts-expect-error vfs
import config from "#build/auth.config";
import { defineNuxtRouteMiddleware } from "#imports";
import { isSafeRedirectPath } from "#shared/utils/redirect";

export default defineNuxtRouteMiddleware(async (to) => {
	if (to.name === undefined) {
		return;
	}
	const auth = to.meta?.auth as AuthMeta | undefined;
	const authRequired = auth?.required ?? false;
	const authNamespace = auth?.namespace;

	const loginRoute = auth?.loginRoute || config.loginRoute;
	const redirectIfLoggedIn = auth?.redirectIfLoggedIn ?? false;

	const { loggedIn } = useAuth({ namespace: authNamespace });

	const redirectTo = useState<string>("authRedirect", () => "/");

	if (typeof redirectIfLoggedIn === "string" && redirectIfLoggedIn && loggedIn.value) {
		return navigateTo({ path: redirectIfLoggedIn }, { redirectCode: 302 });
	}

	if (!authRequired) {
		return;
	}

	if (!loggedIn.value) {
		redirectTo.value = to.fullPath;
		const safeNext = isSafeRedirectPath(to.fullPath) ? to.fullPath : "/";
		return navigateTo(
			{
				path: loginRoute,
				query: { next: safeNext },
			},
			{
				redirectCode: 302,
			},
		);
	}

	// Previous behaviour redirected users back to the `from` route in many
	// Cases which prevented access to protected pages even when authenticated.
	// That logic has been removed so authenticated users can access pages
	// With `auth.required = true` as expected.
});
