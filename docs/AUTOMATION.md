# Automation

`shipbrief` is designed for nightly agent runs. The canonical prompt lives in [`../templates/codex-automation.md`](../templates/codex-automation.md).

## Minimal Scheduler Command

```bash
shipbrief run --today
```

Use `--yesterday` for morning reports:

```bash
shipbrief run --yesterday
```

## Agent Prompt

```text
Read shipbrief TOON output. Write a concise human follow-up in my language.
Group by project.
Use provider-safe HTML.
Use linked commit hashes.
Save report.html.
Run shipbrief check, then shipbrief deliver.
```

## Telegram Delivery

```bash
shipbrief check --html report.html
shipbrief deliver --provider telegram --html report.html
```

Required environment variables:

```bash
TELEGRAM_BOT_TOKEN
TELEGRAM_COMMIT_REPORT_CHAT_ID
TELEGRAM_COMMIT_REPORT_THREAD_ID
```

## Codex

Use [`../templates/codex-automation.md`](../templates/codex-automation.md).

Schedule it daily in Codex automation with local execution in the directory that contains your projects root.

Use English for reusable automation prompts. The generated report can still be written in the user's preferred language.

Use `~/.shipbrief/reports` or `$HOME/.shipbrief/reports` for reusable prompts. Do not hardcode a specific user's home directory in templates.

Public templates should not pin package versions. Personal automations may pin `shipbrief@x.y.z` when reproducibility matters more than receiving updates automatically.

If a scheduler cannot find the globally installed `shipbrief` binary, run `npm config get prefix` and add `<prefix>/bin` to that scheduler's PATH. Prefer this over hardcoding a user-specific home directory in reusable prompts.

## Other Agents

Use same split:

1. scheduler runs `shipbrief run --today`;
2. agent rewrites TOON into human brief;
3. `shipbrief check` validates HTML;
4. `shipbrief deliver` sends through provider.
