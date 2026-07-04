<p align="center">
  <img src="./assets/shipbrief-mark.svg" width="132" height="132" alt="shipbrief logo">
</p>

<h1 align="center">shipbrief</h1>

<p align="center">
  <b>End-of-day commit briefings for people who build with agents.</b>
</p>

<p align="center">
  Read local git history, hand compact facts to an agent, deliver a human summary anywhere.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/shipbrief"><img alt="npm" src="https://img.shields.io/npm/v/shipbrief"></a>
  <a href="https://github.com/beautyfree/shipbrief/actions"><img alt="CI" src="https://github.com/beautyfree/shipbrief/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-black"></a>
</p>

---

## What

`shipbrief` answers one question:

> What changed across my projects today?

It scans configured git repos, collects commits, prints a tiny agent-friendly report, then your agent turns that into a readable daily brief.

No agent crawling your filesystem. No giant context dump. No manual commit archaeology.

<p align="center">
  <img src="./assets/shipbrief-flow.svg" alt="shipbrief flow: commits to agent summary to delivery">
</p>

## Fast Setup

Paste this into Codex, Claude Code, Cursor, OpenCode, or another local coding agent:

```text
Install shipbrief for me.

Goal:
- create a daily commit briefing from my local git projects;
- keep shipbrief as the only collector;
- make an agent write the final human summary;
- install the canonical daily automation prompt from shipbrief templates;
- prepare delivery later through Telegram, Slack, email, or webhook.

Steps:
1. Run: npm install -g shipbrief
2. Run: shipbrief init
3. Detect my normal projects directory and put it in ~/.shipbrief/config.json roots.
4. Run: shipbrief doctor
5. Create a daily evening automation:
   - run: shipbrief run --today
   - use the canonical prompt from templates/codex-automation.md when this agent supports Codex automations
   - read the TOON output
   - write a concise human brief in my language
   - group by project
   - keep commit hashes as links when URLs exist
   - save the final report
6. Use paths under ~/.shipbrief for generated reports; do not hardcode a user's absolute home path in reusable prompts.
7. Do not mutate any repositories.
```

Already installed? Print the same prompt:

```bash
shipbrief prompt
```

Manual install:

```bash
npm install -g shipbrief
shipbrief init
shipbrief doctor
shipbrief run --today
```

## Output Shape

Final brief should feel like this:

```text
shipbrief
- Published the package and tightened launch commands (dfc2035)
- Fixed CI install and portable test discovery (e04659a, 22a8354)

my-app
- Added nightly project summaries and delivery validation (a91c3e2)
```

Provider decides final formatting: Telegram HTML, Slack blocks, email HTML, webhook JSON.

## Automation

Daily job pattern:

```text
shipbrief run --today -> agent summary -> provider delivery
```

`shipbrief` owns collection and provider-specific delivery. Agent owns wording.

Canonical prompts:

- [agent setup prompt](./templates/agent-setup-prompt.md)
- [Codex automation prompt](./templates/codex-automation.md)
- [AGENTS.md commit rules](./templates/AGENTS.md)
- [CLAUDE.md commit rules](./templates/CLAUDE.md)
- [Shipbrief skill](./skills/shipbrief/SKILL.md)

<details>
<summary>Delivery providers</summary>

Current built-in provider: Telegram.

```bash
shipbrief check --html report.html
shipbrief deliver --provider telegram --html report.html
```

Required env vars:

```bash
TELEGRAM_BOT_TOKEN
TELEGRAM_COMMIT_REPORT_CHAT_ID
TELEGRAM_COMMIT_REPORT_THREAD_ID
```

Planned provider shape: Slack, email, webhook. Same collector, same agent summary step, different adapter.

</details>

<details>
<summary>Command reference</summary>

```bash
shipbrief run --today
shipbrief run --yesterday
shipbrief run --date 2026-07-03
shipbrief run --today --format json
shipbrief run --today --format markdown

shipbrief collect --today --output commits.json
shipbrief render --input commits.json --output report.txt
shipbrief check --html report.html
shipbrief deliver --provider telegram --html report.html
```

Use without global install:

```bash
npx -y -p shipbrief shipbrief run --today
```

The repeated name is npm syntax: first `shipbrief` installs the package, second `shipbrief` runs its binary.

Version policy:

- reusable docs use `shipbrief` after global install;
- one-off commands may use `npx -y -p shipbrief shipbrief`;
- personal automations can pin `shipbrief@x.y.z` for reproducibility, but public templates should not pin.

</details>

<details>
<summary>Config</summary>

Default config path:

```text
~/.shipbrief/config.json
```

Example:

```json
{
  "roots": ["~/Projects"],
  "outputDir": "~/shipbrief-reports"
}
```

</details>

## Safety

`shipbrief` is read-only. It runs `git rev-parse`, `git config`, and `git log`.

It never fetches, pulls, pushes, checks out, resets, edits files inside repositories, or scans outside configured roots.

## More

- [Automation details](./docs/AUTOMATION.md)
- [Development notes](./docs/DEVELOPMENT.md)
