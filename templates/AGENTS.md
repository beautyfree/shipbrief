# Shipbrief Agent Instructions

Use `shipbrief` for local commit follow-up reports.

Commands:
- Check setup: `shipbrief doctor`
- Collect compact TOON: `shipbrief collect --yesterday`
- Collect full JSON: `shipbrief collect --yesterday --format json --full --output commits.json`
- Render text: `shipbrief render --input commits.json --output report.txt`
- Send Telegram: `shipbrief send --input report.txt`
- Full collection run: `shipbrief run --yesterday`

Safety rules:
- Do not discover repositories outside configured `roots`.
- Do not run mutating git commands.
- Treat bot tokens as secrets.
- Keep report grouped by project.
- Agent analysis should use generated TOON/JSON/text, not direct filesystem scanning.
- Prefer agent-written human summaries over sending raw commit lists directly.
