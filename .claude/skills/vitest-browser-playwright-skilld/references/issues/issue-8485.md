---
number: 8485
title: "Feature: matcher for standard schema"
type: other
state: closed
created: 2025-08-27
url: "https://github.com/vitest-dev/vitest/issues/8485"
reactions: 9
comments: 17
labels: "[p2-nice-to-have]"
---

# Feature: matcher for standard schema

### Clear and concise description of the problem

I created the custom matcher expect-match-schema for schema validation based on a Standard Schema like Zod, Valibot, ArkType, etc. 

```ts
test('should pass for valid data', () => {
  const schema = z.object({
    name: z.string(),
    email: z.email(),
  });

  const validData = { name: 'John', email: 'john@example.com' };
  expect(validData).toMatchSchema(schema);
});
```

Since Standard Schema just specifies an interface without depending on the actual schema libraries like Zod, the implementation is quite lightweight.

It has received good feedback on Twitter and I thought this might be a good feature to be natively supported by Vitest: https://x.com/zirkelc_/status/1958534349319553418

<img width="680" height="340" alt="Image" src="https://github.com/user-attachments/assets/9245d357-d227-4ba9-a562-8b3286e845fd" />

### Suggested solution

See PR https://github.com/vitest-dev/vitest/pull/8527

Three options have been implemented for further discussion:

- custom equality tester for expect.toEqual()
- custom matcher expect.toEqualSchema()
- asymmetric matcher expect.schemaMatching()

```ts
const schema = z.object({
  name: z.string(),
  email: z.email(),
});
const validData = { name: 'John', email: 'john@example.com' };

// custom equality test using toEqual
expect(validData).toEqual(schema);
expect({ email: "john@example.com" }).toEqual({ email: z.email() });

// custom matcher using toEqualSchema
expect(validData).toEqualSchema(schema);
expect({ email: "john@example.com" }).toEqualSchema({ email: z.email() });

...

---

## Top Comments

**@sheremet-va** [maintainer]:

There was already a discussion about Standard Schema at https://github.com/vitest-dev/vitest/issues/7015#issuecomment-2524699229

I am open to discuss how it can be integrated into Vitest if someone creates a thread with an API proposal, and how it integrates with existing APIs (with a comparison to `expect.any*` and other matchers). Having only `toHaveSchema` doesn't seem enough to justify adding it.


**@hi-ogawa** [maintainer]:

You can continue on this issue. So far, the team has discussed that we can explore supporting standard schema directly as asymmetric matcher i.e. you can use it on the right side of current `toEqual` API etc. For example:

```js
const schema = z.object({
  name: z.string(),
  email: z.email(),
});
const validData = { name: 'John', email: 'john@example.com' };
expect(validData).toEqual(schema);
expect({ email: "john@example.com" }).toEqual({ email: z.email() });
```

...

**@sheremet-va** [maintainer]:

> I'd prefer this to use `toMatchSchema` or similar.
> 
> `toEqual` reads wrong unless the left hand side would be a schema as well and not a value to be matched with the schema.
> 
> its basically equivalent to `expect("foo").toEqual(/foo/)` which should fail because one is a regex and the other is a string

Your example could also be written like this: `expect("foo").toEqual(expect.stringContaining(/foo/))` which already works. The reason why `toEqual` works is because asymetric matchers can be used anywhere where equality is checked. For example, when validating spy calls:

...