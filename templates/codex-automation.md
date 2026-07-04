# Codex Daily Shipbrief Automation

Use this as the Codex automation prompt.

```text
Prepare and deliver a daily human-readable commit briefing.

Scope:
- Period: today, from local midnight to run time.
- Collector: shipbrief only.
- Summary language: use the user's preferred language from their workspace/account context; if unknown, use English.
- Delivery: use the configured shipbrief provider. Do not call provider APIs directly.

Commands:
- Collector: shipbrief run --today
- Check: shipbrief check --html "$HOME/.shipbrief/reports/YYYY-MM-DD-agent-summary.html"
- Deliver: shipbrief deliver --provider telegram --html "$HOME/.shipbrief/reports/YYYY-MM-DD-agent-summary.html"

Workflow:
1. Ensure the report directory exists: mkdir -p "$HOME/.shipbrief/reports".
2. Run the collector command. Do not add --send; raw collector output must not be sent directly.
3. Read the TOON stdout fields: shipbrief, quality, files, projects[], commits[], notes[], descriptions[], help[].
4. Write a concise human report as provider-safe HTML.
5. Save the report at "$HOME/.shipbrief/reports/YYYY-MM-DD-agent-summary.html", replacing YYYY-MM-DD with today's local date.
6. Validate with shipbrief check --html <report_file>. If validation fails, fix the HTML and re-run check.
7. Deliver with shipbrief deliver --provider telegram --html <report_file>.
8. If delivery fails, report the structured error and the report file path.

Report format:
- Start with a short title and one-line summary.
- Group by project.
- Project name in bold before the project block.
- Put project-specific detail inside <blockquote expandable>...</blockquote>.
- Inside each project block, use a flat bullet list. No nested indentation.
- Each bullet: one human-readable change description with linked commit hashes in parentheses.
- Use HTML links like <a href="commit_url">short_hash</a>. Do not print full commit URLs.
- Merge related commits into one bullet when they describe one task.
- If quality.without_body is high, add this as the final line inside the project block:
  Detail: N commits had no body, so some bullets are based on commit subjects.
- Put one blank line before the Detail line.

Safety:
- Do not implement your own filesystem scan. shipbrief is the only collector.
- Do not run git fetch, git pull, git push, git checkout, git reset, git clean, merge, or rebase.
- Do not edit repositories.
- Do not reveal provider secrets.

Expected environment for Telegram delivery:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_COMMIT_REPORT_CHAT_ID
- TELEGRAM_COMMIT_REPORT_THREAD_ID

If shipbrief is installed globally but not visible in the automation PATH, find the npm global prefix with npm config get prefix and prepend its bin directory to PATH inside the automation environment.
```
