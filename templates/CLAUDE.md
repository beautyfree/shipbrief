# Shipbrief Claude Instructions

For daily commit reports, use `shipbrief run --yesterday`, then summarize the generated TOON in human language before sending. Use `--format json --full` only when complete commit bodies are needed.

`shipbrief` performs read-only repository discovery and commit collection. Claude should only summarize the generated report when asked. Do not run mutating git commands.
