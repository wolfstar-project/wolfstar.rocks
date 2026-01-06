import type { AuthMeta } from "../types";

// @ts-expect-error vfs
import config from "#build/auth.config";
import { defineNuxtRouteMiddleware } from "#imports";
import { usePermissions } from "../composable";

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.name === undefined)
    return;
  const auth = to.meta?.auth as AuthMeta | undefined;
  const authRequired = auth?.required ?? false;
  const authNamespace = auth?.namespace;

  const loginRoute = auth?.loginRoute || config.loginRoute;
  const redirectIfLoggedIn = auth?.redirectIfLoggedIn ?? false;
  const redirectIfNotAllowed = auth?.redirectIfNotAllowed ?? false;

  const routeRoles = auth?.roles;
  const routePermissions = auth?.permissions;

  // Use useUserSession directly instead of useAuth wrapper
  const { loggedIn } = useUserSession();

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

  // Check roles and permissions only if specified
  if (routeRoles || routePermissions) {
    const { hasAnyRole, hasAnyPermission } = usePermissions({ namespace: authNamespace });

    if (routeRoles && hasAnyRole(routeRoles)) {
      return;
    }

    if (routePermissions && hasAnyPermission(routePermissions)) {
      return;
    }

    // If has specified roles/permissions but doesn't have any, deny access
    if (!redirectIfNotAllowed) {
      return abortNavigation({ statusCode: 403 });
    }

    return navigateTo({ path: redirectIfNotAllowed }, { redirectCode: 302 });
  }
});
