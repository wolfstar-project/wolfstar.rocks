---
number: 227
title: Unable to Resolve Auto-Imports in Component Tests
category: "Q&A"
created: 2023-11-10
url: "https://github.com/nuxt/test-utils/discussions/227"
upvotes: 7
comments: 0
answered: false
---

# Unable to Resolve Auto-Imports in Component Tests

## Description
I am currently writing component tests for my Nuxt project, and I have encountered an issue with auto-imports in one of the components. The component utilizes auto-imports, which seem to be causing difficulties in the testing process. Is there any relevant information or documentation that I can refer to regarding this issue?

The following code is button component and button component unit test:

**`AtomicButton.vue`**
```vue
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

interface AtomicButtonProps {
	// props
}

const props = withDefaults(defineProps<AtomicButtonProps>(), {
	// props default value
});

const NuxtLink = resolveComponent('NuxtLink');

const rootComponent = computed(() => {
	return isNullOrUndefined(props.to) ? 'button' : NuxtLink;
});

const rootClass = computed(() => {
	// implement
});
</script>
```

**`components/atomics/__tests__/AtomicButton.test.ts`**
```ts
import { config, mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import AtomicButton from '../AtomicButton.vue';

config.global.components = {
	'NuxtLink': RouterLinkStub,
};

describe('<AtomicButton>', () => {
	it('should have default props', () => {
		const wrapper = mount(AtomicButton);

		expect(wrapper.props()).toEqual({
			type: 'button',
			size: 'normal',
			theme: 'secondary',
			variant: 'contained',
			to: undefined,
		});
	});
});

```

##...