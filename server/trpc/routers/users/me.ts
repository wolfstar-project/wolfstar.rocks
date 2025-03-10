import { cast } from '@sapphire/utilities/cast';
import { TRPCError } from '@trpc/server';
import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { z } from 'zod';
import { router, procedure } from '~~/server/trpc/trpc';
import type { TransformedLoginData } from '~~/shared/types';
import useApi from '~~/shared/utils/api';

export const usersRouter = router({
	me: procedure
		.meta({
			openapi: {
				method: 'GET',
				path: '/users/@me',
				protect: true,
				description: 'Get the current user and their guilds transformed'
			}
		})
		.input(
			z
				.object({
					shouldSerialize: z.boolean().optional()
				})
				.optional()
		)
		.output(z.custom<TransformedLoginData>())
		.query(async ({ input, ctx }) => {
			const { access_token: token } = cast<RESTPostOAuth2AccessTokenResult>(ctx.session.secure.tokens);
			if (!token) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Missing token'
				});
			}
			const rest = useRest({
				authPrefix: 'Bearer'
			}).setToken(token);
			const user = await useApi(rest).users.getCurrent();
			if (!user) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch user'
				});
			}

			const guilds = await useApi(rest).users.getGuilds();

			if (!guilds) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch guilds'
				});
			}

			return input?.shouldSerialize !== undefined && input?.shouldSerialize === false
				? {
						user,
						guilds
					}
				: await transformOauthGuildsAndUser({
						user,
						guilds
					});
		})
});
