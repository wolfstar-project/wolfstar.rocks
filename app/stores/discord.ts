import { defineStore } from 'pinia';
import { StorageKeys } from '@/utils/constants';
import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';

export const useDiscordStore = defineStore(StorageKeys.Discord, {
	state: () => ({
		data: {
			access_token: undefined,
			token_type: undefined,
			expires_in: undefined,
			refresh_token: undefined,
			scope: undefined
		} as Partial<RESTPostOAuth2AccessTokenResult>
	}),
	getters: {
		isExpired(): boolean {
			if (this.data !== undefined) {
				return this.data.expires_in !== undefined && this.data.expires_in < Date.now();
			}
			return false;
		},
		token(): string {
			return this.data.access_token!;
		},
		refreshToken(): string {
			return this.data.refresh_token!;
		}
	},
	actions: {
		set(data: RESTPostOAuth2AccessTokenResult) {
			this.data = data;
		},
		clear() {
			this.data = {
				access_token: undefined,
				token_type: undefined,
				expires_in: undefined,
				refresh_token: undefined,
				scope: undefined
			};
		}
	},
	persist: {
		key: 'discord-pack',
		pick: ['data.access_token', 'data.refresh_token']
	}
});
