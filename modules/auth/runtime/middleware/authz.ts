import type { AuthMeta } from "../types";

// @ts-expect-error vfs
import config from "#build/auth.config";
import { defineNuxtRouteMiddleware } from "#imports";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.name === undefined)
    return;
  const auth = to.meta?.auth as AuthMeta | undefined;
  const authRequired = auth?.required ?? false;
  const authNamespace = auth?.namespace;

  const loginRoute = auth?.loginRoute || config.loginRoute;
  const redirectIfLoggedIn = auth?.redirectIfLoggedIn ?? false;
  const redirectIfNotAllowed = auth?.redirectIfNotAllowed ?? false;

  const { loggedIn } = useAuth({ namespace: authNamespace });

  // Create a ref to know where to redirect the user when logged in
  const redirectTo = useState<string>("authRedirect", () => "/");

  if (typeof redirectIfLoggedIn === "string" && redirectIfLoggedIn && loggedIn.value) {
    return navigateTo({ path: redirectIfLoggedIn }, { redirectCode: 302 });
  }

  if (!authRequired) {
    return;
  }

  if (!loggedIn.value) {
    // Save the current path to redirect after login
    redirectTo.value = to.fullPath;
    return navigateTo(
      {
        path: loginRoute,
        query: { next: to.fullPath },
      },
      {
        redirectCode: 302,
      },
    );
  }

  if (from.fullPath !== to.fullPath && from.path !== loginRoute) {
    return navigateTo(from);
  }

  if (!redirectIfNotAllowed) {
    return abortNavigation({ statusCode: 403 });
  }

  return navigateTo({ path: redirectIfNotAllowed }, { redirectCode: 302 });
});
