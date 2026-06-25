---
number: 1490
title: " VS Code Extension requires Disable->Enable to clear reported problems/diagnostics"
type: bug
state: open
created: 2026-01-27
url: "https://github.com/webpro-nl/knip/issues/1490"
reactions: 1
comments: 2
labels: "[bug]"
---

#  VS Code Extension requires Disable->Enable to clear reported problems/diagnostics

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://vscode.dev

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

This is an issue purely with the VS Code Extension. 

In my instance there were a bunch of "Unlisted dependency" problems being reported. I told Copilot to fix all `#problems` in the workspace. 

...

---

## Top Comments

**@webpro** [maintainer]:

That's an awful experience. Trying this now and things seem fine, both from a root or sub workspace. When I install the dependency, the `package.json` visibly updates in the editor, and I can see a restart sequence starting with "Creating options" in the Output → Knip panel.

So there should be a restart of the plugin just by a modified `package.json`.

Maybe the editor didn't know about or didn't propagate the saved `package.json`?

Do you experience the same with a similar tool/extension like ESLint?

...

**@OliverJAsh**:

I'm facing a similar issue with other Knip errors. I haven't encountered this issue with other tools like ESLint. The stale errors do not disappear when I restart the Knip server nor if I edit the nearest `package.json` (monorepo). Here's a screen recording:

https://github.com/user-attachments/assets/8db6b42b-a6ba-4737-836d-23c94e95354c