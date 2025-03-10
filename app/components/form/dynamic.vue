<template>
	<form @submit="form.handleSubmit(onSubmit)">
		<div v-for="{ as, name, label, children, ...attrs } in schema.fields" :key="name">
			<label :for="name">{{ label }}</label>
			<Field :id="name" :as="as" :name="name" v-bind="attrs">
				<template v-if="children && children.length">
					<component :is="tag" v-for="({ tag, text, ...childAttrs }, idx) in children" :key="idx" v-bind="childAttrs">
						{{ text }}
					</component>
				</template>
			</Field>
			<VeeErrorMessage :name="name" />
		</div>
		<button type="submit">Submit</button>
	</form>
</template>

<script setup lang="ts">
interface FormChild {
	tag: string;
	text?: string;
	[key: string]: unknown;
}

interface FormField {
	as: string;
	name: string;
	label: string;
	children?: FormChild[];
	[key: string]: unknown;
}

interface FormSchema {
	fields: FormField[];
}

interface Props {
	schema: FormSchema;
}

const props = defineProps<Props>();

const schema = reactive(toRefs(props).schema);
const emit = defineEmits<{
	(e: 'submit', values: unknown): void;
}>();

const form = useForm({
	validationSchema: props.schema
});

const onSubmit = (values: unknown) => {
	emit('submit', values);
};
</script>
