# shipbrief

Read-only daily commit digests for local git repositories.

`shipbrief` scans configured project roots, collects commits with `git log`, renders a project-grouped report, and can send text to a Telegram group topic through the Bot API. It is built for Codex, Claude Code, Cursor, OpenCode, and other agents that should analyze commit data without crawling your whole machine themselves.

## Install

```bash
npm install -g shipbrief
```

Until the package is published:

```bash
npm install -g /Users/devall/Projects/shipbrief
```

## Setup

```bash
shipbrief init
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
shipbrief run --yesterday --json
```

Pipeline mode:

```bash
shipbrief collect --yesterday --output commits.json
shipbrief render --input commits.json --output report.txt
shipbrief send --input report.txt
```

Recommended agent flow:

1. Run `shipbrief run --yesterday --json`.
2. Ask the agent to summarize the JSON into a readable follow-up in the user's language.
3. Send the agent-written follow-up to Telegram.

## Agent Templates

- `templates/codex-automation.md`
- `templates/AGENTS.md`
- `templates/CLAUDE.md`

## Safety

`shipbrief` only reads directories and runs:

- `git rev-parse --show-toplevel`
- `git config --get remote.origin.url`
- `git log --all ...`

It never fetches, pulls, pushes, checks out, resets, edits files inside repositories, or scans outside configured roots.

## Package Name

The npm name `shiplog` is already taken. This project uses the unscoped package name `shipbrief`.
