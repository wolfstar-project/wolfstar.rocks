export function useCommands(options?: ApiComposableOptions) {
	return createApiComposable<WolfCommand[]>("wolfstar:commands", "/api/commands", [], options);
}
