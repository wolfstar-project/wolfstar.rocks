import { useClipboard as _useClipboard } from "@vueuse/core";

type ToastOptions = Parameters<ReturnType<typeof useToast>["add"]>[0];

export const useClipboard = () => {
	const { copy: _copy, copied } = _useClipboard();

	const toast = useToast();

	const copy = async (source: string, toastOptions?: ToastOptions) => {
		try {
			await _copy(source);
			if (toastOptions) {
				toast.add(toastOptions);
			}
		} catch (error) {
			toast.add({
				color: "error",
				description: "Failed to copy to clipboard.",
				icon: "heroicons:x-circle",
				title: "Copy Failed",
			});
		}
	};

	return {
		copy,
		copied,
	};
};
