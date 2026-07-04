# Automation

`shipbrief` is designed for nightly agent runs.

## Minimal Scheduler Command

```bash
npx -y -p shipbrief shipbrief run --today
```

Use `--yesterday` for morning reports:

```bash
npx -y -p shipbrief shipbrief run --yesterday
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
npx -y -p shipbrief shipbrief check --html report.html
npx -y -p shipbrief shipbrief deliver --provider telegram --html report.html
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

## Other Agents

Use same split:

1. scheduler runs `shipbrief run --today`;
2. agent rewrites TOON into human brief;
3. `shipbrief check` validates HTML;
4. `shipbrief deliver` sends through provider.
