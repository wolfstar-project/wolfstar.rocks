import { Time } from '@sapphire/time-utilities';
import { defineStore } from 'pinia';
import { StorageKeys, type ExpirableLocalStorageStructure } from '@/utils/constants';
import { useAPI } from '@/composables/externalApi';
import type { FlattenedCommand } from '~~/shared/types/discord';

export const useCommandsStore = defineStore(StorageKeys.Language, {
	state: () => ({
		commandsStorage: {
			expire: 0,
			data: []
		} as ExpirableLocalStorageStructure<FlattenedCommand[]>
	}),

	getters: {
		commands(state): FlattenedCommand[] {
			return state.commandsStorage.data;
		},
		expired(state): boolean {
			return state.commandsStorage.expire < Date.now();
		}
	},
	actions: {
		async fetchCommands() {
			try {
				if (this.expired || import.meta.env.DEV) {
					return;
				}

				const { data: commandsData } = await useAPI<FlattenedCommand[]>('/languages');

				this.commandsStorage = {
					expire: Date.now() + Time.Day * 6,
					data: Array.isArray(commandsData.value) ? commandsData.value : []
				};
			} catch {
				/* empty */
			}
		}
	}
});
