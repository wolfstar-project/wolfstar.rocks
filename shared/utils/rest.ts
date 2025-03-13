import { REST, type RESTOptions } from '@discordjs/rest';

export const useRest = (options?: Partial<RESTOptions>) => {
	if (!process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN) {
		throw new Error("'DISCORD_TOKEN' env is not defined");
	}
	return new REST(options).setToken(process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN!);
};
