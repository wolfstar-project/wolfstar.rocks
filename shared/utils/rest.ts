import type { RESTOptions } from '@discordjs/rest';

import { REST } from '@discordjs/rest';

export function useRest(options?: Partial<RESTOptions>) {
    if (!process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN) {
        throw new Error('\'NUXT_OAUTH_DISCORD_BOT_TOKEN\' env is not defined');
    }
    return new REST(options).setToken(process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN!);
}
