import { isNullishOrEmpty } from '@sapphire/utilities';

export default eventHandler(async (event) => {
	const { code, redirectUri } = (await readBody(event)) as OAuth2BodyData;

	if (isNullishOrEmpty(code) || isNullishOrEmpty(redirectUri)) {
		throw createError({ message: 'Invalid body parameters', statusCode: 400 });
	}

	const data = await fetchAccessToken(code, redirectUri);
	if (!data) {
		throw createError({ message: 'Failed to fetch the token', statusCode: 500 });
	}

	const auth = await fetchAuth(data);

	if (!auth) {
		throw createError({ message: 'Failed to fetch the auth', statusCode: 500 });
	}

	const session = await useAuthSession(event);
	await session.update({ name: auth.user!.global_name ?? auth.user!.username, ...auth.user });
	return auth;
});

interface OAuth2BodyData {
	code: string;
	redirectUri: string;
}
