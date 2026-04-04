function getNameSpaceDetails(name: string): readonly [string | null, string] {
	const index = name.indexOf(".");
	if (index === -1) {
		return [null, name];
	}
	return [name.substring(0, index), name.substring(index + 1)];
}

function matchName(name: string, command: WolfCommand): boolean {
	return command.name === name || command.aliases.includes(name);
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

export async function matchAny(names: Iterable<string>, commandName: string): Promise<boolean> {
	for (const name of names) {
		if (await match(name, commandName)) {
			return true;
		}
	}
	return false;
}

async function match(name: string, commandName: string): Promise<boolean> {
	// Match All:
	if (name === "*") {
		return true;
	}

	const commands = await fetchCommands();
	const command = commands.find(
		(cmd) => cmd.name === commandName || cmd.aliases.includes(commandName),
	);
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
