// @ts-expect-error vfs
import authconfig from "#build/auth.config";

/**
 * Composable for managing Discord authentication
 * Uses nuxt-auth-utils under the hood
 */
export const useAuth = (
  { namespace: _namespace }: { namespace?: string } = {},
) => {
  const { ready, loggedIn, user, session, fetch, openInPopup, clear } = useUserSession();

  // Create a ref to know where to redirect the user when logged in
  const redirectTo = useState<string>("authRedirect", () => "/");

  const login = async (returnUrl?: string) => {
    const targetUrl = returnUrl || redirectTo.value || useRoute().fullPath;
    await navigateTo(`/api/auth/discord?next=${encodeURIComponent(targetUrl)}`, { external: true });
  };

  const logout = async () => {
    await clear();
    await navigateTo("/");
  };

  return {
    isAuthenticated: computed(() => loggedIn.value),
    login,
    logout,
    refreshSession: fetch,
    redirectTo,
    loggedIn,
    user,
    session,
    clear,
    ready,
    fetch,
    openInPopup,
  };
};

export const usePermissions = (
  { namespace = "default" }: { namespace?: string } = {},
) => {
  const prefix = namespace !== "default" ? `${namespace}:` : "";

  const _roles = useState<string[]>(`${prefix}roles`, () => []);
  const _permissions = useState<Record<string, Record<string, boolean>>>(
    `${prefix}permissions`,
    () => ({}),
  );

  const hasRole = (role: string) => {
    if (!_roles.value?.includes(role))
      return false;
    return _roles.value.includes(role);
  };

  const hasAnyRole = (roles: string[]) => {
    if (!_roles.value?.length)
      return false;
    return roles.some(role => _roles.value!.includes(role));
  };

  const hasAllRoles = (roles: string[]) => {
    if (!_roles.value.length)
      return false;
    return roles.every(role => _roles.value.includes(role));
  };

  const _hasFullAccess = () => {
    return hasAnyRole(authconfig.fullAccessRoles || []);
  };

  type Permission = `${string}.${string}` | `${string}`;

  const hasPermission = (permission: Permission) => {
    // Check for full access roles first
    if (_hasFullAccess())
      return true;

    if (Object.keys(_permissions.value || {}).length === 0)
      return false;

    if (permission.includes(".")) {
      const [resource, action] = permission.split(".");
      if (!resource || !action)
        return false;
      return _permissions.value?.[resource]?.[action] ?? false;
    }

    // Resource-only check - return true if any action is allowed for this resource
    return Object.keys(_permissions.value?.[permission] || {}).some(
      action => _permissions.value?.[permission]?.[action] === true,
    );
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    // Check for full access roles first
    if (_hasFullAccess())
      return true;

    if (!_permissions.value)
      return false;
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]) => {
    // Check for full access roles first
    if (_hasFullAccess())
      return true;

    if (!_permissions.value)
      return false;
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};
