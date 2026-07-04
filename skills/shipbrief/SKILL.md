---
name: shipbrief
description: Generate readable daily follow-ups from local git commits using compact AXI/TOON output.
---

# Shipbrief

Use `shipbrief` when the user wants a daily commit follow-up, Telegram digest, or agent-readable summary of local git work.

## Commands

```bash
npx -y shipbrief run --today
```

This prints compact TOON:
- `shipbrief` summary
- `quality` commit metadata counts
- `projects[]`
- `commits[]`
- `notes[]`
- `descriptions[]`

Write the final human report yourself before sending it anywhere. Do not send raw output unless the user asks.

Use full JSON only when needed:

```bash
npx -y shipbrief run --today --format json --full
```

Check setup:

```bash
npx -y shipbrief doctor
```

## Safety

`shipbrief` is read-only for repositories. Do not run `git fetch`, `git pull`, `git push`, `git checkout`, or `git reset` as part of a follow-up report.

Keep reports grouped by project. Mention quality issues such as commits without bodies when `quality.without_body` is high.
