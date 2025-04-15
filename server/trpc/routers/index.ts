import { guildsRouter } from '~~/server/trpc/routers/guilds/index';
import { usersRouter } from '~~/server/trpc/routers/users/me';
import { router } from '~~/server/trpc/trpc';

export const appRouter = router({
	guilds: guildsRouter,
	users: usersRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
