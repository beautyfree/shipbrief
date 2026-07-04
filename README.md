# shipbrief

AXI-style read-only daily commit digests for local git repositories.

`shipbrief` scans configured project roots, collects commits with `git log`, emits compact TOON for agents, renders Markdown for humans, and can send text to a Telegram group topic through the Bot API. It is built for Codex, Claude Code, Cursor, OpenCode, and other agents that should analyze commit data without crawling your whole machine themselves.

## Install

```bash
npm install -g shipbrief
```

Until the package is published:

```bash
npm install -g /Users/devall/Projects/shipbrief
```

One-command agent run after publish:

```bash
npx -y shipbrief run --yesterday
```

## Setup

```bash
shipbrief init
shipbrief doctor
```

Edit `~/.shipbrief/config.json`:

```json
{
  "roots": ["/Users/devall/Projects"],
  "outputDir": "/Users/devall/Documents/Codex/commit-reports"
}
```

Telegram topic delivery uses env vars:

```bash
launchctl setenv TELEGRAM_BOT_TOKEN "123:abc"
launchctl setenv TELEGRAM_COMMIT_REPORT_CHAT_ID "-1001234567890"
launchctl setenv TELEGRAM_COMMIT_REPORT_THREAD_ID "87"
```

## Usage

```bash
shipbrief run --today
```

Pipeline mode:

```bash
shipbrief collect --today --output commits.json
shipbrief render --input commits.json --output report.txt
shipbrief send --input report.txt
```

Recommended agent flow:

1. Run `shipbrief run --today` for compact TOON.
2. Ask the agent to summarize the TOON into a readable follow-up in the user's language.
3. Send the agent-written follow-up to Telegram.

Formats:

```bash
shipbrief run --today                 # TOON, default for evening automation
shipbrief run --today --format json   # complete machine-readable JSON
shipbrief run --today --format markdown
```

Quality metrics are included in every report:

```text
quality:
  without_body: 14
  with_body: 1
  tests_note: 0
  codex_note: 3
```

Use them in the final follow-up when commit messages lack enough detail.

## Agent Templates

- `templates/codex-automation.md`
- `templates/AGENTS.md`
- `templates/CLAUDE.md`
- `skills/shipbrief/SKILL.md`

Suggested public install paths:

```bash
npx -y shipbrief init
npx -y shipbrief doctor
npx -y shipbrief run --today
```

## Safety

`shipbrief` only reads directories and runs:

- `git rev-parse --show-toplevel`
- `git config --get remote.origin.url`
- `git log --all ...`

It never fetches, pulls, pushes, checks out, resets, edits files inside repositories, or scans outside configured roots.

## Package Name

The npm name `shiplog` is already taken. This project uses the unscoped package name `shipbrief`.
