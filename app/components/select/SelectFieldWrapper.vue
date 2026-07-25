<template>
	<StarFormField :name="fieldName">
		<template #default>
			<StarTooltip v-if="tooltipTitle" :text="tooltipTitle">
				<slot></slot>
			</StarTooltip>
			<slot v-else></slot>
		</template>

		<template #help>
			<slot name="help"></slot>
		</template>
	</StarFormField>
</template>

<script setup lang="ts">
interface SelectFieldWrapperProps {
	fieldName: string;
	tooltipTitle?: string;
}

const { fieldName, tooltipTitle } = defineProps<SelectFieldWrapperProps>();
</script>
