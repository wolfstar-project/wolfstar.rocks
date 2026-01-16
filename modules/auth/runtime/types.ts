/**
 * Metadata for authentication configuration on routes and pages
 */
export interface AuthMeta {
  /**
   * If true, the route requires authentication
   */
  required?: boolean;

  /**
   * Namespace for multi-tenant management (optional)
   */
  namespace?: string;

  /**
   * List of roles authorized to access the route
   */
  roles?: string[];

  /**
   * List of permissions required to access the route
   */
  permissions?: string[];

  /**
   * Custom login route (default: /login)
   */
  loginRoute?: string;

  /**
   * Where to redirect if the user is already logged in
   * false = do not redirect
   */
  redirectIfLoggedIn?: string | false;
}
