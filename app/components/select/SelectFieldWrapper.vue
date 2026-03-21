<template>
	<UFormField :name="fieldName">
		<template #default>
			<UTooltip v-if="tooltipTitle" :text="tooltipTitle">
				<slot></slot>
			</UTooltip>
			<slot v-else></slot>
		</template>

		<template #help>
			<slot name="help"></slot>
		</template>
	</UFormField>
</template>

<script setup lang="ts">
interface SelectFieldWrapperProps {
	fieldName: string;
	tooltipTitle?: string;
}


const { fieldName, tooltipTitle } = defineProps<SelectFieldWrapperProps>();
</script>
