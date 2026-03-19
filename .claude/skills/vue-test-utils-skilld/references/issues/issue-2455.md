---
number: 2455
title: "Bug: Unable to mock original mixin method in the component with Vue 3."
type: bug
state: open
created: 2024-06-14
url: "https://github.com/vuejs/test-utils/issues/2455"
reactions: 1
comments: 2
labels: "[bug]"
---

# Bug: Unable to mock original mixin method in the component with Vue 3.




**Describe the bug**

I am trying to mock the mixins used in the Vue component by passing in a fake mixin under `global.mixins`. But it seems to be not working on the Component while on the child component I can see the mocked method.

No difference on switching from `shallowMount` to `mount`.

**To Reproduce**

##### common-chart.vue 
```
<template>
  <div class="fill-height">
    <widget-export-as-image @click="downloadAsImage" />
  </div>
</template>
<script>
import chartMixin from './../mixins/chart-mixin';
import WidgetExportAsImage from '../../common/widget-export-as-image/widget-export-as-image';
export default {
  components: {
    WidgetExportAsImage
  },
  mixins: [chartMixin],
  props: {
    widget: { type: Object, required: true }
  },
  data() {
    return {};
  }
};
</script>
```...