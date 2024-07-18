import { LoginData } from '@sapphire/plugin-api';
import {
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	Locale,
	OAuth2Routes,
	RESTAPIPartialCurrentUserGuild,
	RouteBases,
	Routes,
	type RESTGetAPICurrentUserResult,
	type RESTPostOAuth2AccessTokenResult,
	type RESTPostOAuth2AccessTokenURLEncodedData
} from 'discord-api-types/v10';
import { FlattenedGuild, OauthFlattenedGuild, PartialOauthFlattenedGuild, TransformedLoginData } from '~/config/types/ApiData';

const { clientId, clientSecret, apiOrigin } = useRuntimeConfig();

export async function fetchAccessToken(code: string, redirectUri: string) {
	const data = {
		client_id: clientId,
		client_secret: clientSecret,
		code,
		grant_type: 'authorization_code',
		redirect_uri: redirectUri
	} satisfies RESTPostOAuth2AccessTokenURLEncodedData;

	const result = await fetch(OAuth2Routes.tokenURL, {
		method: 'POST',
		body: new URLSearchParams(data).toString(),
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		}
	});

	const json = await result.json();
	if (result.ok) return json as RESTPostOAuth2AccessTokenResult;

	console.error(json);
	return null;
}

export async function fetchUser(token: string) {
	return fetchData<RESTGetAPICurrentUserResult>(token, Routes.user());
}

async function fetchData<T extends object>(token: string, route: string) {
	const result = await fetch(`${RouteBases.api}${route}`, {
		headers: {
			authorization: `Bearer ${token}`
		}
	});

	return result.ok ? ((await result.json()) as T) : null;
}

export async function fetchAuth(data: RESTPostOAuth2AccessTokenResult) {
	const result = await fetch(`${apiOrigin}/oauth/authorize`, {
		method: 'POST',
		body: JSON.stringify(data),
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	const json = await result.json();
	if (result.ok) return json as TransformedLoginData;

	console.error(json);
	return null;
}
