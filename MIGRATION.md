# Migration from nuxt-auth-utils to better-auth

This document explains the migration from `nuxt-auth-utils` to `better-auth` for authentication in the WolfStar dashboard.

## What Changed

### Dependencies
- **Removed**: `nuxt-auth-utils`
- **Added**: `better-auth` and `nuxt-better-auth`

### Database Schema
New tables for better-auth:
- `auth_user` - User accounts
- `auth_session` - Active sessions
- `auth_account` - OAuth provider accounts (Discord)
- `auth_verification` - Verification tokens

Run the migration:
```bash
pnpm prisma:migrate:deploy
```

Or for development:
```bash
pnpm prisma:migrate:dev
```

### Environment Variables

#### Updated Configuration
The Discord OAuth callback URL has changed:
- **Old**: `http://localhost:3000/oauth/callback`
- **New**: `http://localhost:3000/api/auth/callback/discord`

Update your Discord OAuth application settings in the [Discord Developer Portal](https://discord.com/developers/applications):
1. Navigate to your application
2. Go to "OAuth2" → "General"
3. Update the redirect URI to: `http://localhost:3000/api/auth/callback/discord` (for dev) or `https://wolfstar.rocks/api/auth/callback/discord` (for production)

#### New Required Variable
Add to your `.env` file:
```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

This is used by better-auth to construct OAuth callback URLs.

### API Changes

#### Authentication Endpoints
- **Old**: `/api/auth/discord` - Manual OAuth handler
- **New**: `/api/auth/*` - All auth handled by better-auth automatically
  - `/api/auth/sign-in/discord` - Discord login
  - `/api/auth/sign-out` - Logout
  - `/api/auth/callback/discord` - OAuth callback
  - `/api/auth/session` - Get current session

#### Client-side Usage
The `useAuth()` composable API has changed slightly:

**Before (nuxt-auth-utils):**
```typescript
const { loggedIn, user, login, logout } = useAuth();
```

**After (better-auth):**
```typescript
const { isAuthenticated, user, login, logout } = useAuth();
// isAuthenticated is a computed that checks session status
```

### Session Structure

**Before:**
```typescript
interface UserSession {
  user: {
    id: string;
    name: string;
    username: string;
    globalName: string | null;
    avatar: string | null;
  };
  loggedInAt: number;
  secure: {
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}
```

**After:**
```typescript
interface Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    emailVerified: boolean;
  };
}
```

### Token Access
Discord OAuth tokens are now stored in the database (`auth_account` table) and accessed via the server authorization plugin. The existing Discord API utilities continue to work without changes.

## Migration Steps for Existing Deployments

### 1. Update Dependencies
```bash
# Install new dependencies
pnpm install
```

### 2. Run Database Migration
```bash
# Development
pnpm prisma:migrate:dev

# Production
pnpm prisma:migrate:deploy
```

### 3. Update Environment Variables
Add `NUXT_PUBLIC_SITE_URL` to your `.env` file:
```env
NUXT_PUBLIC_SITE_URL=https://wolfstar.rocks
```

### 4. Update Discord OAuth Settings
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to OAuth2 → General
4. Update Redirect URIs:
   - Remove: `https://wolfstar.rocks/oauth/callback`
   - Add: `https://wolfstar.rocks/api/auth/callback/discord`
5. Save changes

### 5. Clear Existing Sessions (Optional)
Existing user sessions from nuxt-auth-utils will be invalid after migration. Users will need to log in again. You can optionally clear the session storage:

```bash
# If using file storage
rm -rf node_modules/.cache/app/cache/sessions/*

# If using Cloudflare KV, clear via dashboard or API
```

### 6. Rebuild and Deploy
```bash
pnpm build
# Deploy as usual
```

## Benefits of better-auth

1. **Built-in Security**: Automatic CSRF protection, secure session handling
2. **Database-backed Sessions**: More reliable than cookie-only sessions
3. **Token Management**: OAuth tokens stored securely in database
4. **Extensibility**: Easier to add more OAuth providers in the future
5. **Type Safety**: Better TypeScript types for session and user data
6. **Active Development**: More actively maintained than nuxt-auth-utils

## Troubleshooting

### "Invalid redirect URI" error
- Verify Discord OAuth application settings match the new callback URL
- Ensure `NUXT_PUBLIC_SITE_URL` is set correctly
- Check that the URL in Discord settings includes the protocol (http/https)

### "Authentication required" errors
- Users need to log in again after migration
- Clear old session data if issues persist
- Verify database migration ran successfully

### Database migration fails
- Ensure PostgreSQL is running and accessible
- Check `DATABASE_URL` environment variable
- Verify sufficient database permissions

## Rollback Procedure (if needed)

If you need to rollback:

1. Revert the code changes:
   ```bash
   git revert <commit-hash>
   ```

2. Rollback database migration:
   ```bash
   pnpm prisma:migrate:resolve --rolled-back 20260110_add_better_auth_tables
   ```

3. Reinstall old dependencies:
   ```bash
   pnpm install
   ```

4. Restore Discord OAuth redirect URI to old value

## Support

If you encounter issues during migration:
1. Check the GitHub Issues for similar problems
2. Review the [better-auth documentation](https://www.better-auth.com)
3. Open a new issue with details about the problem
