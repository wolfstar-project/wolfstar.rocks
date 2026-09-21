import type { FlattenedCommand } from "#shared/types/discord";

export function useCommands(options?: ApiComposableOptions) {
	return createApiComposable<FlattenedCommand[]>("wolfstar:commands", "/commands", [], options);
}
