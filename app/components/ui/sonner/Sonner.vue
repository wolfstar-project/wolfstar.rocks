<template>
	<Sonner
		class="toast-end toast-top md:toast-bottom group toast"
		v-bind="props"
		:rich-colors="false"
		:close-button="true"
		:toast-options="{
			unstyled: true,
			classes: {
				success: 'alert alert-success',
				error: 'alert alert-error',
				warning: 'alert alert-warning',
				info: 'alert alert-info'
			}
		}"
	>
		<template #loading-icon>
			<ShadIcon name="i-mdi-loading" class="animate-spin" />
		</template>
	</Sonner>
</template>

<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner';

const props = defineProps<ToasterProps>();
</script>
