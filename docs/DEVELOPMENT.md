# Development

## Local Setup

```bash
npm ci
npm test
npm run check
```

## Package Dry Run

```bash
npm pack --dry-run
```

## CLI Smoke Test

```bash
node bin/shipbrief.js --help
npx -y -p shipbrief shipbrief --help
```

## Safety Contract

`shipbrief` only reads configured roots and runs:

- `git rev-parse --show-toplevel`
- `git config --get remote.origin.url`
- `git log --all ...`

Do not add commands that mutate repositories: `fetch`, `pull`, `push`, `checkout`, `reset`, `clean`, `merge`, `rebase`.
