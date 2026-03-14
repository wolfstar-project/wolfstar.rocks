---
number: 1058
title: Class Component issues
type: other
state: closed
created: 2021-10-16
url: "https://github.com/vuejs/test-utils/issues/1058"
reactions: 10
comments: 8
labels: "[class component]"
---

# Class Component issues

I use typescript and vue-class-component on vue3. when I want to change the component data I will get an error:
```ts
await wrapper.setData({ showNextButton: true });
// TypeError: Cannot add property showNextButton, object is not extensible
```
This is the component:
```ts
import { Vue, Options, prop } from "vue-class-component";
import { QuizMode } from "@/common/models/config";

import MarkdownComponent from "@/common/components/layout/Markdown.vue";
import ButtonCheckComponent from "./ButtonCheck.vue";

type SubmitFunction = (configNumber?: number) => Promise<boolean>;

class Props {
  text = prop<string>({ required: true });
  subtext = prop<string>({ default: "" });
  type = prop<"multiple_choice" | "info">({ required: true });
  submitFunction = prop<SubmitFunction>({ required: true });
}

@Options({
  components: {
    MarkdownComponent,
    ButtonCheckComponent,
  },
  inject: ["quiz_mode", "staging", "staging_message"],
  emits: ["next"],
})
export default class ConfigQuestion extends Vue.with(Props) {
  quiz_mode!: QuizMode;
  staging!: boolean;
  staging_message!: string;

  checking = false;
  disabledCheckButton = false;
  disabledNextButton = false;

  status: string | null = null;
  showNextButton = false;

  check(configNumber?: number) {
    this.checking = true;
    this.disabledCheckButton = true;

    this.submitFunction(configNumber)
      .then((success) => {
        this.status = success ? "correct" : "wrong";
        this.showNextButton = true;
        console.log('showNextButton', this.showNextButton);
        
      })
      .finally(() => {
        this.checking = false;
      });
  }

  next() {
    if (this.disabledNextButton) return;

    this.disabledNextButton = true;
    this.$emit("next");
  }
}
```

And this is the test script:
...

---

## Top Comments

**@lmiller1990** [maintainer] (+2):

Thanks for the bug report. I am not even sure if this is something we can fix without modifying Vue Class Component.

For anyone following/waiting on a fix: happy to accept a PR, but I won't be able to prioritise this issue in the near future. The class component appears not to be actively maintained, and is not generally recommended by Evan: https://github.com/vuejs/vue-next/issues/4744#issuecomment-937369062

If you feel strongly about this, I can help review or give you some pointers. Isolating the issue is probably not hard; 

- `setData`: https://github.com/vuejs/vue-test-utils-next...

**@lmiller1990** [maintainer]:

Related: https://github.com/vuejs/test-utils/issues/572

**@cexbrayat** [maintainer]:

As vue-class-component has been deprecated for a long time (see https://github.com/vuejs/vue-class-component?tab=readme-ov-file#deprecated-vue-class-component), I think we should close this.