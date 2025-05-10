<template>
    <ShadModal v-model:open="open" class="max-w-2xl">
        <template #content>
            <ShadForm :validation-schema="validationSchema" @submit="handleSearch">
                <ShadFormField name="search">
                    <template #default>
                        <ShadInput
                            ref="searchInput"
                            v-model="searchText"
                            type="text"
                            placeholder="Search commands..."
                            class="w-full"
                            @keydown.down.prevent="$emit('navigate', 'next')"
                            @keydown.up.prevent="$emit('navigate', 'prev')"
                            @keydown.enter.prevent="$emit('execute')"
                        />
                    </template>
                </ShadFormField>

                <div class="divider my-4"></div>

                <div class="max-h-[60vh] space-y-4 overflow-y-auto">
                    <div v-for="group in categories" :key="group" class="collapse-arrow collapse bg-base-200">
                        <input type="checkbox" checked />
                        <div class="collapse-title text-base font-medium">
                            {{ group }}
                        </div>
                        <div class="collapse-content">
                            <ul class="menu w-full menu-sm rounded-box">
                                <li v-for="command in getCommandsByCategory(group)" :key="command.name">
                                    <button
                                        :class="{ active: selectedCommand?.name === command.name }"
                                        class="flex flex-col items-start gap-1 p-3 transition-colors hover:bg-base-300"
                                        @click="$emit('select', command)"
                                    >
                                        <span class="font-medium">{{ command.name }}</span>
                                        <span class="text-xs text-base-content/70">{{ command.description }}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </ShadForm>
        </template>
        <template #footer>
            <div class="modal-action">
                <ShadButton variant="ghost" @click="handleClose">Close</ShadButton>
            </div>
        </template>
    </ShadModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '~/types/form';
import { toTypedSchema } from '@vee-validate/zod';
import Fuse from 'fuse.js';
import { computed, nextTick, onMounted, ref } from 'vue';
import { z } from 'zod';

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'navigate', direction: 'next' | 'prev'): void;
    (e: 'execute' | 'close'): void;
    (e: 'select', command: FlattenedCommand): void;
    (e: 'search', value: string): void;
}>();

defineShortcuts({
    o: () => (open.value = !open.value),
});

const open = ref(false);
// Define search schema with Zod and proper typing
const searchSchema = z.object({
    search: z
        .string()
        .max(50, 'Search term too long')
        .transform(val => val?.trim() || ''),
});

const validationSchema = toTypedSchema(searchSchema);

interface Props {
    commands: FlattenedCommand[];
    selectedCommand: FlattenedCommand | null;
}

const categories = computed(() => {
    return [...new Set(props.commands.map(cmd => cmd.category))];
});

const searchInput = ref<HTMLInputElement | null>(null);
const searchText = ref('');

// Configure Fuse.js options
const fuseOptions = {
    keys: ['name', 'description', 'category'],
    threshold: 0.4, // Adjust this value to control fuzzy matching sensitivity
    includeScore: true,
};

// Create Fuse instance
const fuse = new Fuse(props.commands, fuseOptions);

// Filtered commands using Fuse.js
const filteredCommands = computed(() => {
    if (!searchText.value) {
        return props.commands;
    }

    return fuse.search(searchText.value).map(result => result.item);
});

// Modified to use filtered results
function getCommandsByCategory(groupId: string): FlattenedCommand[] {
    return filteredCommands.value.filter(cmd => cmd.category === groupId);
}

function handleSearch(values: FormSubmitEvent<object>) {
    // eslint-disable-next-line no-console
    console.log('Search submitted:', values);
    // searchText.value = values.search;
    // emit('search', values.search);
}

function handleClose() {
    emit('close');
}

onMounted(() => {
    nextTick(() => {
        searchInput.value?.focus();
    });
});
</script>
