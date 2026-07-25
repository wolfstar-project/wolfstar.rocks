<template>
	<nav class="join" :aria-label="ariaLabel">
		<button
			type="button"
			class="btn btn-sm join-item"
			:disabled="currentPage <= 1"
			aria-label="Previous page"
			@click="setPage(currentPage - 1)"
		>
			«
		</button>
		<button
			v-for="pageNumber in visiblePages"
			:key="pageNumber"
			type="button"
			class="btn btn-sm join-item"
			:class="{ 'btn-active': pageNumber === currentPage }"
			:aria-current="pageNumber === currentPage ? 'page' : undefined"
			@click="setPage(pageNumber)"
		>
			{{ pageNumber }}
		</button>
		<button
			type="button"
			class="btn btn-sm join-item"
			:disabled="currentPage >= pageCount"
			aria-label="Next page"
			@click="setPage(currentPage + 1)"
		>
			»
		</button>
	</nav>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		page?: number;
		defaultPage?: number;
		itemsPerPage?: number;
		total?: number;
		modelValue?: number;
		ariaLabel?: string;
	}>(),
	{
		defaultPage: 1,
		itemsPerPage: 10,
		total: 0,
		ariaLabel: "Pagination",
	},
);

const emit = defineEmits<{
	"update:page": [page: number];
	"update:modelValue": [page: number];
}>();

const currentPage = ref(props.page ?? props.modelValue ?? props.defaultPage);

watch(
	() => props.page ?? props.modelValue,
	(value) => {
		if (typeof value === "number") currentPage.value = value;
	},
);

const pageCount = computed(() =>
	Math.max(1, Math.ceil((props.total ?? 0) / Math.max(1, props.itemsPerPage ?? 10))),
);

const visiblePages = computed(() => {
	const total = pageCount.value;
	const current = currentPage.value;
	const pages: number[] = [];
	const start = Math.max(1, current - 2);
	const end = Math.min(total, start + 4);
	for (let i = Math.max(1, end - 4); i <= end; i += 1) {
		pages.push(i);
	}
	return pages;
});

function setPage(page: number) {
	const next = Math.min(pageCount.value, Math.max(1, page));
	currentPage.value = next;
	emit("update:page", next);
	emit("update:modelValue", next);
}
</script>
