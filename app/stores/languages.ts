import type { ExpirableLocalStorageStructure } from '@/utils/constants';
import { Time } from '@sapphire/time-utilities';
import { defineStore } from 'pinia';
import { useAPI } from '@/composables/externalApi';
import { StorageKeys } from '@/utils/constants';

export const LanguagesStore = defineStore(StorageKeys.Language, {
	state: () => ({
		languagesStorage: {
			expire: 0,
			data: []
		} as ExpirableLocalStorageStructure<string[]>
	}),

	getters: {
		languages(state): string[] {
			return state.languagesStorage.data;
		},
		expired(state): boolean {
			return state.languagesStorage.expire < Date.now();
		}
	},
	actions: {
		async fetchLanguages() {
			try {
				if (!this.expired && !import.meta.env.DEV) {
					return;
				}

				const { data: languagesData } = await useAPI<string[]>('/languages');
				this.languagesStorage = {
					expire: Date.now() + Time.Day * 6,
					data: Array.isArray(languagesData.value) ? languagesData.value : []
				};
			} catch {
				/* empty */
			}
		}
	}
});
