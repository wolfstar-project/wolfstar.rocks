import type { ReadonlyGuildData } from "#server/database/settings/types";
import { PermissionNodeManager } from "#server/database/settings/structures/PermissionNodeManager";
import { isNullish } from "@sapphire/utilities";

export class SettingsContext {
	readonly #permissionNodes: PermissionNodeManager;

	public constructor(settings: ReadonlyGuildData) {
		this.#permissionNodes = new PermissionNodeManager(settings);
	}

	public get permissionNodes() {
		return this.#permissionNodes;
	}

	public update(settings: ReadonlyGuildData, data: Partial<ReadonlyGuildData>) {
		if (!isNullish(data.permissionsRoles) || !isNullish(data.permissionsUsers)) {
			void this.#permissionNodes.refresh(settings);
		}
	}
}
