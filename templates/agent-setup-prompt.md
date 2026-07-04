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
