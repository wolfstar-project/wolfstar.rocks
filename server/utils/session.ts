import type { H3Event, SessionConfig } from 'h3';
import { TRPCError } from '@trpc/server';
import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

const sessionConfig = useRuntimeConfig().auth as SessionConfig;

export interface AuthSession {
	id: string;
	name: string;
	avatar: string | null;
}

export type AuthSessionData = RESTPostOAuth2AccessTokenResult;

export function useAuthSession(event: H3Event) {
	return useSession<AuthSession>(event, sessionConfig);
}

export async function requireAuthSession(event: H3Event) {
	const session = await useAuthSession(event);
	if (!session.data.id) {
		throw new TRPCError({ message: 'Not Authorized', code: 'UNAUTHORIZED' });
	}
	return session;
}
