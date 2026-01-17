import type { WolfCommand } from "~~/shared/types/discord";
import { fetchCommands } from "~~/server/utils/discord";

function getNameSpaceDetails(name: string): readonly [string | null, string] {
  const index = name.indexOf(".");
  if (index === -1)
    return [null, name];
  return [name.substring(0, index), name.substring(index + 1)];
}

function matchName(name: string, command: WolfCommand): boolean {
  return command.name === name || command.aliases.includes(name);
}

function matchNameAndCategory(name: string, category: string, command: WolfCommand): boolean {
  return command.category === category && matchName(name, command);
}

function matchNameCategoryAndSubCategory(name: string, category: string, subCategory: string, command: WolfCommand): boolean {
  return command.subCategory === subCategory && matchNameAndCategory(name, category, command);
}

export async function matchAny(names: Iterable<string>, command: WolfCommand): Promise<boolean> {
  for (const name of names) {
    if (await match(name, command))
      return true;
  }
  return false;
}

export async function match(name: string, command: WolfCommand): Promise<boolean> {
  // Match All:
  if (name === "*")
    return true;

  // Match Category:
  const [category, categoryRest] = getNameSpaceDetails(name);
  if (category === null)
    return matchName(name, command);
  if (category !== command.category)
    return false;
  if (categoryRest === "*")
    return true;

  // Match Sub-Category:
  const [subCategory, subCategoryRest] = getNameSpaceDetails(categoryRest);
  if (subCategory === null)
    return matchNameAndCategory(name, category, command);
  if (subCategory !== command.subCategory)
    return false;
  if (subCategoryRest === "*")
    return true;

  // Match Command:
  return matchNameCategoryAndSubCategory(subCategoryRest, category, subCategory, command);
}

async function resolveCategory(category: string): Promise<string | null> {
  const commands = await fetchCommands();
  const scanned = new Set<string>();
  const lowerCaseCategory = category.toLowerCase();

  for (const command of commands) {
    const value = command.category;
    if (!value)
      continue;
    if (scanned.has(value))
      continue;
    if (value.toLowerCase() === lowerCaseCategory)
      return value;
    scanned.add(value);
  }

  return null;
}

async function resolveCommandWithCategory(name: string, category: string): Promise<string | null> {
  const commands = await fetchCommands();
  const lowerName = name.toLowerCase();

  for (const command of commands) {
    if (command.name.toLowerCase() === lowerName && command.category === category) {
      return command.name;
    }
  }

  return null;
}

async function resolveCommandWithCategoryAndSubCategory(name: string, category: string): Promise<string | null> {
  const commands = await fetchCommands();
  const lowerName = name.toLowerCase();

  for (const command of commands) {
    if (command.name.toLowerCase() === lowerName && command.category === category) {
      return command.name;
    }
  }

  return null;
}

export async function resolve(name: string): Promise<string | null> {
  // Match All:
  if (name === "*")
    return name;

  const parts = name.split(".");

  // If it's an empty string, or has more than two parts, it is invalid:
  if (parts.length === 0 || parts.length > 2)
    return null;

  const commands = await fetchCommands();

  // Handle `${command}`:
  if (parts.length === 1) {
    const lowerName = name.toLowerCase();
    const command = commands.find(cmd => cmd.name.toLowerCase() === lowerName);
    return command?.name ?? null;
  }

  // Handle `${category}.${string}`:
  const category = await resolveCategory(parts[0]);
  if (category === null)
    return null;
  if (parts.length === 2)
    return parts[1] === "*" ? `${category}.*` : resolveCommandWithCategory(parts[1].toLowerCase(), category);

  return parts[2] === "*"
    ? `${category}.*`
    : resolveCommandWithCategoryAndSubCategory(parts[2].toLowerCase(), category);
}
