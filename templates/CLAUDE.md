# Shipbrief Claude Instructions

For daily commit reports, use `shipbrief run --yesterday --json`, then summarize the generated JSON in human language before sending.

`shipbrief` performs read-only repository discovery and commit collection. Claude should only summarize the generated report when asked. Do not run mutating git commands.
