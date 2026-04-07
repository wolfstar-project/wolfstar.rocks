---
number: 9629
title: "Vitest/coverage-v8 - Code coverage issues related to \");\"?"
category: "Q&A"
created: 2026-02-10
url: "https://github.com/vitest-dev/vitest/discussions/9629"
upvotes: 2
comments: 1
answered: false
---

# Vitest/coverage-v8 - Code coverage issues related to ");"?

Angular `21.x.x` project with vitest `4.0.8` and coverage-v8 `4.0.18`.

Somehow I got multiple `);` coverage issues in multiple files after running `ng test`. It seems because of this I am unable to get 100% on unit-test coverage. Does anyone know what kind of issue this is and/or how this can be fixed?

<img width="455" height="155" alt="{0D15C50A-E8E3-4222-98C0-C812A39C9A39}" src="https://github.com/user-attachments/assets/b6acdf74-7c35-4590-8ba8-5601beaa2044" />

<img width="293" height="56" alt="{9736EAF0-4E62-41FE-940E-5F659C280853}" src="https://github.com/user-attachments/assets/5db945ec-fe15-40e8-b127-6ac72b20f685" />

## Some project information:

package.json:
```json
...
  "devDependencies": {
   ...
    "@vitest/coverage-v8": "^4.0.18",
    ...
    "jsdom": "^27.1.0",
    ...
    "vitest": "^4.0.8"
  }
}
```...

---

## Top Comments

**@AriPerkkio** [maintainer]:

Same issue as https://github.com/vitest-dev/vitest/issues/9811. Root cause is on Angular side and fixed https://github.com/angular/angular-cli/issues/32718.