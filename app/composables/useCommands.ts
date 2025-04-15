import type { TRPCClientErrorLike } from '@trpc/client';
import { toast } from 'vue-sonner';
import type { FlattenedCommand } from '~~/shared/types/discord';

export const useCommands = () => {
	const client = useClientTrpc();
	const commands = useState<FlattenedCommand[]>('commands', () => []);
	const loading = useState<boolean>('loading', () => false);
	const selectedCommand = shallowRef<FlattenedCommand | null>(null);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleError = (error: TRPCClientErrorLike<any>, context: string) => {
		captureException(error, { extra: { context } });
		toast.error('Error', {
			description: `Failed to ${context.toLowerCase()}. Please try again.`
		});
	};

	const fetchCommands = async () => {
		try {
			await client.commands.refresh.mutate();
			const { data, error, status } = await client.commands.getAll.useQuery();

			if (error.value && status.value === 'error') {
				handleError(error.value, 'fetch commands');
			}
			if (data.value && status.value === 'success') {
				commands.value = data.value;
			}
		} finally {
			loading.value = false;
		}
	};

	return {
		commands,
		loading,
		selectedCommand,
		fetchCommands
	};
};
