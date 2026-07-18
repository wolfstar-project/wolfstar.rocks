import type { BotApiCommand } from "#shared/types/botApi";
import { normalizeBotApiCommands } from "#shared/utils/botApi";

export function useCommands(options?: ApiComposableOptions) {
	const result = createApiComposable<BotApiCommand[]>(
		"wolfstar:commands",
		"/commands",
		[],
		options,
	);

	return {
		...result,
		data: computed(() => normalizeBotApiCommands(result.data.value)),
	};
}
