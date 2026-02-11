import type { AuthMeta } from "../types";
// @ts-expect-error vfs
import config from "#build/auth.config";
import { defineNuxtPlugin } from "#imports";

export default defineNuxtPlugin({
	name: "auth",
	parallel: true,
	setup() {
		const { loggedIn } = useAuth();

		const redirectTo = useState<string>("authRedirect", () => "/");

		// Client-side watch for logout - redirect to login if on protected page
		if (import.meta.client) {
			const currentRoute = useRoute();
			watch(loggedIn, async (isLoggedIn) => {
				const auth = currentRoute.meta?.auth as AuthMeta | undefined;

				const loginRoute = auth?.loginRoute || config.loginRoute;
				const authRequired = auth?.required ?? false;

				if (!authRequired) {
					return;
				}

				if (!isLoggedIn) {
					redirectTo.value = currentRoute.fullPath;
					return navigateTo(
						{
							path: loginRoute,
							query: { next: currentRoute.fullPath },
						},
						{
							redirectCode: 302,
						},
					);
				}
			});
		}
	},
});
