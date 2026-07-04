# Codex Automation Prompt

Run daily commit follow-up through `shipbrief`.

1. Execute:

```bash
shipbrief run --yesterday --send --json
```

2. Read the JSON result printed by the command.
3. If sending failed, report the error and point to the generated text report.
4. Do not run `git fetch`, `git pull`, `git push`, `git checkout`, `git reset`, or any command that changes repositories.
5. If extra analysis is requested, analyze only the generated JSON/text report and keep project grouping intact.

Required environment variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_COMMIT_REPORT_CHAT_ID`
- `TELEGRAM_COMMIT_REPORT_THREAD_ID`
