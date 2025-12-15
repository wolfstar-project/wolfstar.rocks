/**
 * Parses namespace details from a command string (e.g., "category.subcategory.command")
 */
function getNameSpaceDetails(name: string): readonly [string | null, string] {
  const index = name.indexOf(".");
  if (index === -1)
    return [null, name];
  return [name.substring(0, index), name.substring(index + 1)];
}

/**
 * Checks if a command name matches
 */
function matchName(pattern: string, commandName: string): boolean {
  return commandName === pattern;
}

/**
 * Checks if a command matches name and category
 */
function matchNameAndCategory(commandName: string, category: string, commandFullName: string): boolean {
  return commandFullName === `${category}.${commandName}`;
}

/**
 * Matches any command from an iterable list of names
 */
export async function matchAny(names: Iterable<string>, commandName: string): Promise<boolean> {
  for (const name of names) {
    if (await match(name, commandName))
      return true;
  }
  return false;
}

/**
 * Matches a command based on name pattern (supports wildcards and namespaces)
 * Patterns:
 * - "*" - matches all commands
 * - "commandName" - matches specific command
 * - "category.*" - matches all commands in category
 * - "category.commandName" - matches specific command in category
 */
export async function match(pattern: string, commandName: string): Promise<boolean> {
  // Match All:
  if (pattern === "*")
    return true;

  // Match Category:
  const [category, categoryRest] = getNameSpaceDetails(pattern);
  if (category === null)
    return matchName(pattern, commandName);

  // Check if command starts with category
  const [commandCategory] = getNameSpaceDetails(commandName);
  if (category !== commandCategory)
    return false;
  if (categoryRest === "*")
    return true;

  // Match Command:
  return matchNameAndCategory(categoryRest, category, commandName);
}

/**
 * Resolves a category name from the command list
 */
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

/**
 * Resolves a command with a specific category
 */
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

/**
 * Resolves a command name pattern to its canonical form
 * Supports:
 * - "*" - returns "*"
 * - "commandName" - returns actual command name if found
 * - "category.*" - returns "Category.*" if category exists
 * - "category.commandName" - returns "Category.CommandName" if found
 */
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
  if (parts[1] === "*")
    return `${category}.*`;

  return resolveCommandWithCategory(parts[1].toLowerCase(), category);
}
