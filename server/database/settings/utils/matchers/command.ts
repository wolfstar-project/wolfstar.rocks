import type { WolfCommand } from "#shared/types/discord";

// `fetchCommands` is injected by Nitro's auto-imports from `server/utils/discord/index.ts`.
// Importing it directly would pull that Nitro-dependent module into the shared/node type
// contexts, so declare only its signature here.
declare const fetchCommands: () => Promise<WolfCommand[]>;

function getNameSpaceDetails(name: string): readonly [string | null, string] {
	const index = name.indexOf(".");
	if (index === -1) {
		return [null, name];
	}
	return [name.substring(0, index), name.substring(index + 1)];
}

// The bot lists every subcommand as an entry of its own (`ban add`) and names
// its command in `command`, the name permission nodes use; an older bot does
// not send it, and then `name` is the command.
function commandName(command: WolfCommand): string {
	return command.command ?? command.name;
}

function matchName(name: string, command: WolfCommand): boolean {
	return commandName(command) === name || command.alias.includes(name);
}

function matchNameAndCategory(name: string, category: string, command: WolfCommand): boolean {
	return command.category === category && matchName(name, command);
}

function matchNameCategoryAndSubCategory(
	name: string,
	category: string,
	subCategory: string,
	command: WolfCommand,
): boolean {
	return command.subCategory === subCategory && matchNameAndCategory(name, category, command);
}

export async function matchAny(names: Iterable<string>, target: string): Promise<boolean> {
	for (const name of names) {
		if (await match(name, target)) {
			return true;
		}
	}
	return false;
}

async function match(name: string, target: string): Promise<boolean> {
	// Match All:
	if (name === "*") {
		return true;
	}

	const commands = await fetchCommands();
	const command = commands.find((cmd) => matchName(target, cmd));
	if (!command) {
		return false;
	}

	// Match Category:
	const [category, categoryRest] = getNameSpaceDetails(name);
	if (category === null) {
		return matchName(name, command);
	}
	if (category !== command.category) {
		return false;
	}
	if (categoryRest === "*") {
		return true;
	}

	// Match Sub-Category:
	const [subCategory, subCategoryRest] = getNameSpaceDetails(categoryRest);
	if (subCategory === null) {
		return matchNameAndCategory(categoryRest, category, command);
	}
	if (subCategory !== command.subCategory) {
		return false;
	}
	if (subCategoryRest === "*") {
		return true;
	}

	// Match Command:
	return matchNameCategoryAndSubCategory(subCategoryRest, category, subCategory, command);
}
