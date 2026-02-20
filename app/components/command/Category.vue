<template>
	<div>
		<div v-for="category in categories" :key="category">
			<CommandSubCategory
				:commands="commands"
				:search-value="searchValue"
				:category-name="category"
				:loading
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
const { commands, searchValue, categories, loading } = defineProps<{
	commands: FlattenedCommand[];
	searchValue: string;
	categories: string[];
	loading: boolean;
}>();
</script>
