---
number: 9006
title: Playwright trace report ENAMETOOLONG copyfile
type: bug
state: open
created: 2025-11-11
url: "https://github.com/vitest-dev/vitest/issues/9006"
reactions: 4
comments: 0
labels: "[feat: browser, p3-minor-bug]"
---

# Playwright trace report ENAMETOOLONG copyfile

### Describe the bug


Redacted error:
```
Error: ENAMETOOLONG: name too long, copyfile '/path/to/file/and/test/file/.vitest-attachments/src-components-<SuiteName>-traces-<FileName>-spec-tsx-browser--chromium--<SuiteName>-<LongTestName>-0-0-trace-zip-c4a24a9dd74d061060a01ddeb8c322357cbaeb01.zip'
```

Likely culprit, the annotation message in the file name

<img width="769" height="342" alt="Image" src="https://github.com/user-attachments/assets/9cfbd579-ca86-4e85-a30e-e38fa159f41b" />

combined with this code in trace.ts

<img width="551" height="460" alt="Image" src="https://github.com/user-attachments/assets/6d600cfa-0693-410f-b834-6ccead5cf851" />

### Reproduction

Have a test with a long-ish name, enable traces on playwright and html reporter

### System Info

...