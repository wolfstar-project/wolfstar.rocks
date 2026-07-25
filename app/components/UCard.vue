<template>
	<div class="card bg-base-200 shadow-sm">
		<div v-if="$slots.header" class="card-body pb-0">
			<slot name="header" />
		</div>
		<div class="card-body">
			<slot name="body">
				<slot />
			</slot>
		</div>
		<div v-if="$slots.footer" class="card-body pt-0">
			<slot name="footer" />
		</div>
	</div>
</template>
