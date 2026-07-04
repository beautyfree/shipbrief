# Codex Automation Prompt

Run daily commit follow-up through `shipbrief`, then write a human follow-up.

1. Execute:

```bash
/Users/devall/.hermes/node/bin/shipbrief run --today
```

2. Read the TOON result printed by the command.
3. Analyze `quality`, `projects[]`, `commits[]`, `notes[]`, and `descriptions[]`, then write a concise human report in the user's language.
4. Telegram format:
   - project name in bold before the quote: `<b>project_name</b>`;
   - put all project-specific text inside `<blockquote expandable>...</blockquote>` so long project sections can collapse in Telegram clients that support it;
   - inside the blockquote, use a flat bullet list with no nested indentation;
   - each bullet is one human-readable change description with linked commit hashes in parentheses;
   - use HTML links like `<a href="commit_url">short_hash</a>` instead of printing full URLs;
   - merge related commits into one bullet when they describe one task.
   - If adding a project detail/quality note after the bullet list, put one blank line before it.
5. Keep Telegram messages under 4096 characters. Target 3500 characters per message, split by project sections first, and split a single project into `(part N)` quote blocks if needed.
6. Send the final report to Telegram only after the agent summary is written.
7. If sending failed, report the error and point to the generated text report.
8. Do not run `git fetch`, `git pull`, `git push`, `git checkout`, `git reset`, or any command that changes repositories.

Required environment variables:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_COMMIT_REPORT_CHAT_ID`
- `TELEGRAM_COMMIT_REPORT_THREAD_ID`
