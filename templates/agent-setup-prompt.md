# Shipbrief Agent Setup Prompt

Copy this into a local coding agent.

After installing shipbrief, the same prompt is available with:

```bash
shipbrief prompt
```

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
5. If this is Codex, create a daily 21:00 local-time cron automation:
   - name: Daily shipbrief commit briefing
   - execution: local
   - cwd: my projects root
   - model: gpt-5.4-mini or the default available Codex automation model
   - reasoning effort: low
   - prompt: use templates/codex-automation.md exactly, except provider env names may be adjusted for my chosen provider.
6. Use paths under ~/.shipbrief for generated reports; do not hardcode a user's absolute home path in reusable prompts.
7. Do not mutate any repositories.
```
