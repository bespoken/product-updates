---
title: DTMF input validation for phone tests
description: Phone test suites now flag invalid DTMF sequences before a run starts.
tags: Improvement
---

Phone test suites now validate DTMF input as you type. Sequences containing
characters outside `0-9`, `*`, `#`, `A-D` and `,` are rejected in the editor
instead of failing mid-call.

## What changed

- The interaction editor highlights the offending characters inline.
- Running a suite with an invalid DTMF step is blocked, with a clear message.
