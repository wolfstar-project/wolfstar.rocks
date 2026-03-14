import type { PermissionsNode, ReadonlyGuildData } from "#server/database/settings/types";
import type { APIGuildMember, APIRole, APIUser } from "discord-api-types/v10";
import { CommandMatcher } from "#server/database/settings/utils/matchers";
import { Collection } from "@discordjs/collection";

// oxlint-disable-next-line no-restricted-syntax
export const enum PermissionNodeAction {
	Allow,
	Deny,
}

type PermissionNodeValueResolvable = APIRole | APIGuildMember | APIUser;

export class PermissionNodeManager {
	private sorted = new Collection<string, PermissionsManagerNode>();
	#cachedRawPermissionRoles: readonly PermissionsNode[] = [];
	#cachedRawPermissionUsers: readonly PermissionsNode[] = [];

	public constructor(settings: ReadonlyGuildData) {
		this.refresh(settings);
	}

	public settingsPropertyFor(target: PermissionNodeValueResolvable) {
		return (
			this.isAPIRole(target) ? "permissionsRoles" : "permissionsUsers"
		) satisfies keyof ReadonlyGuildData;
	}

	public async run(member: APIGuildMember, command: WolfCommand) {
		return (await this.runUser(member, command)) ?? (await this.runRole(member, command));
	}

	public has(roleId: string) {
		return this.sorted.has(roleId);
	}

	public add(
		target: PermissionNodeValueResolvable,
		command: string,
		action: PermissionNodeAction,
	): readonly PermissionsNode[] {
		const nodes = this.#getPermissionNodes(target);

		const nodeIndex = nodes.findIndex(
			(n) =>
				n.id ===
				(typeof target === "object" && "id" in target ? target.id : target.user.id),
		);
		if (nodeIndex === -1) {
			const node: PermissionsNode = {
				allow: action === PermissionNodeAction.Allow ? [command] : [],
				deny: action === PermissionNodeAction.Deny ? [command] : [],
				id: typeof target === "object" && "id" in target ? target.id : target.user.id,
			};

			return [...nodes, node];
		}
		if (
			(action === PermissionNodeAction.Allow && previous.allow.includes(command)) ||
			(action === PermissionNodeAction.Deny && previous.deny.includes(command))
		) {
			throw new Error("This command is duplicated for this node.");
		}

		const node: PermissionsNode = {
			allow:
				action === PermissionNodeAction.Allow
					? [...previous.allow, command]
					: previous.allow,
			deny:
				action === PermissionNodeAction.Deny ? [...previous.deny, command] : previous.deny,
			id: typeof target === "object" && "id" in target ? target.id : target.user.id,
		};

		return nodes.with(nodeIndex, node);
	}

	public remove(
		target: PermissionNodeValueResolvable,
		command: string,
		action: PermissionNodeAction,
	): readonly PermissionsNode[] {
		const nodes = this.#getPermissionNodes(target);

		const nodeIndex = nodes.findIndex(
			(n) =>
				n.id ===
				(typeof target === "object" && "id" in target ? target.id : target.user.id),
		);
		if (nodeIndex === -1) {
			throw new Error("This node does not exist.");
		}

		const property = this.getName(action);
		const previous = nodes[nodeIndex];
		const commandIndex = previous[property].indexOf(command);
		if (commandIndex === -1) {
			throw new Error("This command does not exist for this node.");
		}

		const node: PermissionsNode = {
			allow:
				action === PermissionNodeAction.Allow
					? previous.allow.toSpliced(commandIndex, 1)
					: previous.allow,
			deny:
				action === PermissionNodeAction.Deny
					? previous.deny.toSpliced(commandIndex, 1)
					: previous.deny,
			id: typeof target === "object" && "id" in target ? target.id : target.user.id,
		};

		return node.allow.length === 0 && node.deny.length === 0 //
			? nodes.toSpliced(nodeIndex, 1)
			: nodes.with(nodeIndex, node);
	}

	public reset(target: PermissionNodeValueResolvable): readonly PermissionsNode[] {
		const nodes = this.#getPermissionNodes(target);

		const nodeIndex = nodes.findIndex(
			(n) =>
				n.id ===
				(typeof target === "object" && "id" in target ? target.id : target.user.id),
		);
		if (nodeIndex === -1) {
			throw new Error("This node does not exist.");
		}

		return nodes.toSpliced(nodeIndex, 1);
	}

	public async refresh(settings: ReadonlyGuildData): Promise<readonly PermissionsNode[]> {
		const nodes = settings.permissionsRoles;
		this.#cachedRawPermissionRoles = nodes;
		this.#cachedRawPermissionUsers = settings.permissionsUsers;

		if (nodes.length === 0) {
			this.sorted.clear();
			return nodes;
		}

		// Generate sorted data and detect useless nodes to remove
		const { pendingToAdd, pendingToRemove } = await this.generateSorted(settings, nodes);

		const sorted = new Collection<string, PermissionsManagerNode>();
		for (const pending of pendingToAdd) {
			sorted.set(pending.id, {
				allow: new Set(pending.allow),
				deny: new Set(pending.deny),
			});
		}

		this.sorted = sorted;

		let copy: PermissionsNode[] | null = null;

		// Delete redundant entries
		for (const removedItem of pendingToRemove) {
			const removedIndex = nodes.findIndex((element) => element.id === removedItem);
			if (removedIndex !== -1) {
				copy ??= [...nodes];
				copy.splice(removedIndex, 1);
			}
		}

		return copy ?? nodes;
	}

	private async runUser(member: APIGuildMember, command: WolfCommand) {
		// Assume sorted data
		const permissionNodeRoles = this.#cachedRawPermissionUsers;
		const memberId = member.user.id;
		for (const node of permissionNodeRoles) {
			if (node.id !== memberId) {
				continue;
			}
			if (await CommandMatcher.matchAny(node.allow, command)) {
				return true;
			}
			if (await CommandMatcher.matchAny(node.deny, command)) {
				return false;
			}
		}

		return null;
	}

	private async runRole(member: APIGuildMember, command: WolfCommand) {
		const { roles } = member;

		// Assume sorted data
		for (const [id, node] of this.sorted.entries()) {
			if (!roles.includes(id)) {
				continue;
			}
			if (await CommandMatcher.matchAny(node.allow, command)) {
				return true;
			}
			if (await CommandMatcher.matchAny(node.deny, command)) {
				return false;
			}
		}

		return null;
	}

	private async generateSorted(settings: ReadonlyGuildData, nodes: readonly PermissionsNode[]) {
		const { pendingToRemove, sortedRoles } = await this.getSortedRoles(settings, nodes);

		const sortedNodes: PermissionsNode[] = [];
		for (const sortedRole of sortedRoles.values()) {
			const node = nodes.find((node) => node.id === sortedRole.id);
			if (node === undefined) {
				continue;
			}

			sortedNodes.push(node);
		}

		return {
			pendingToAdd: sortedNodes,
			pendingToRemove,
		};
	}

	private isAPIRole(target: PermissionNodeValueResolvable): target is APIRole {
		return "permissions" in target && "hoist" in target && !("user" in target);
	}

	private async getSortedRoles(
		settings: ReadonlyGuildData,
		rawNodes: readonly PermissionsNode[],
	) {
		const ids = new Set(rawNodes.map((rawNode) => rawNode.id));
		// I know we should never rely on private methods, however, `Guild#_sortedRoles`
		// Exists in v13 and is called every time the `Role#position` getter is called,
		// So to avoid doing a very expensive call for each role, we will call this once
		// And then handle whatever it returns. This has a cost of O(n * log(n)), which is
		// Pretty good. For 255 role permission nodes, this would do 1,413 checks.
		//
		// An alternative is to filter, then map the roles by their position, but that has
		// A cost of O(n) * O(n * log(n)), which is really bad, with a total amount of
		// 360,320 checks.
		//
		// Although that's also theoretical, `Guild#_sortedRoles` calls `Util.discordSort`
		// With the role cache, which besides checking for positions, also does up to 4
		// String operations (`String#slice()` and `Number(string)` in each), which is
		// Already a performance killer.
		//

		const rawRoles = await useApi().guilds.getRoles(settings.id);
		const roles = rawRoles
			.toSorted((a, b) => a.position - b.position || Number(BigInt(b.id) - BigInt(a.id)))
			// Set#delete returns `true` when the entry exists, so we will use this
			// To automatically sweep the valid entries and leave the invalid ones out
			.filter((role) => ids.delete(role.id));

		// Guild#_sortedRoles sorts in the inverse order, so we need to turn it into an array and reverse it:
		const reversed = [...roles.values()].toReversed();

		return {
			pendingToRemove: ids,
			sortedRoles: reversed,
		};
	}

	private getName(type: PermissionNodeAction) {
		switch (type) {
			case PermissionNodeAction.Allow: {
				return "allow";
			}
			case PermissionNodeAction.Deny: {
				return "deny";
			}
			default: {
				throw new Error("Unreachable");
			}
		}
	}

	#getPermissionNodes(target: PermissionNodeValueResolvable): readonly PermissionsNode[] {
		return this.isAPIRole(target)
			? this.#cachedRawPermissionRoles
			: this.#cachedRawPermissionUsers;
	}
}

interface PermissionsManagerNode {
	allow: Set<string>;
	deny: Set<string>;
}
