# Stitch Fetch Summary

Date: 2026-06-01

## MCP status

- Stitch MCP connected successfully.
- Read-only tools used: `list_projects`, `list_screens`, `get_screen`.
- No write or generation tools were used.

## Projects

- `48503881178617761` — `Carbon Data Security Workspace`
- `410508295000337477` — `moné Personal Money Map`

## Project containing CyberGuard Work Queue screens

- Selected project: `48503881178617761` — `Carbon Data Security Workspace`
- Reason: this project contains the `CyberGuard — Work Queue` screens.

## Screens in the selected project

- `d8028ce0e85c420e8e284c3279846a33` — `CyberGuard — Work Queue (Default)`
- `d5a2801a12ba4a6789c00884c738a9f8` — `CyberGuard — Work Queue (Preview Open)`
- `9957766507544784295` — `CyberGuard — Work Queue (Default)`

## Selected latest screens

- Latest Work Queue default: `9957766507544784295` — `CyberGuard — Work Queue (Default)`
- Latest Work Queue preview-open: `d5a2801a12ba4a6789c00884c738a9f8` — `CyberGuard — Work Queue (Preview Open)`
- Note: the default screen selection is based on the newer derived screen instance present in the Stitch project for screen `9957766507544784295`.
- Additional available Work Queue screen: `d8028ce0e85c420e8e284c3279846a33` — `CyberGuard — Work Queue (Default)`
- Filter-open screen: not available through the returned screen list.
- Bulk-selection screen: not available through the returned screen list.

## Downloaded Stitch references

- Default screenshot: `docs/reference-screens/stitch-fetch/work-queue-default-latest.png`
- Default HTML: `docs/reference-screens/stitch-fetch/work-queue-default-latest.html`
- Default HTML copy: `docs/stitch-fetch/work-queue-default-latest.html`
- Preview-open screenshot: `docs/reference-screens/stitch-fetch/work-queue-preview-open-latest.png`
- Preview-open HTML: `docs/reference-screens/stitch-fetch/work-queue-preview-open-latest.html`
- Preview-open HTML copy: `docs/stitch-fetch/work-queue-preview-open-latest.html`

## Stitch URLs

- Screen `9957766507544784295` screenshot URL:
  `https://lh3.googleusercontent.com/aida/ADBb0uhX9bJBC5GePTXaeIoGaSSnM_MuBiRRjufn7UeYvmOsZuHDunV02RzxlAy6NE10N4iR-LP3lZlqGyHHWJlRCkWkDrDxjgVWhNOA3kLV2I8EKybnFmhlB1MkkYjE-nRcq-92P_N01OymNC_MiRCgpT9-i4gWaqJxV_kHCZDorzWsStb1DvsatvuM9Ffvbw2agRVad3jviACWQH2iqmvlDFHdFjM_dAHFrOAc7qPOPMxqXvJLTQtarO8`
- Screen `9957766507544784295` HTML URL:
  `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ5Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpYCiVodG1sXzAwMDY1MzFiMGNhNmIxNDMwNDczNjFhODI2MjM2ZTIxEgsSBxDsm4TJ4gQYAZIBIQoKcHJvamVjdF9pZBITQhE0ODUwMzg4MTE3ODYxNzc2MQ&filename=&opi=89354086`
- Screen `d5a2801a12ba4a6789c00884c738a9f8` screenshot URL:
  `https://lh3.googleusercontent.com/aida/ADBb0ugzxH2oIFIuL8h9A35XtTb2Gazf_xF2btBeEGrj-r2eOQd4wk1nRTCEqBtH50uzH7k-GfwyP54ZjHp9eS9HRwZyP616VVWgMxV4XH1aBcc9zw55Oi_J8xxzwOSmLF3B5ws15N6jIf6-WnwRLTkRXoVKok-8EZnclFpwFNanKk5pkzKBVyDYzGl0eDrpVfzS4BX72n18AW6GQbjyFoOtYc7CHausVOeOx1F3lq80MUIosw_8BuzoGoPW`
- Screen `d5a2801a12ba4a6789c00884c738a9f8` HTML URL:
  `https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ5Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpYCiVodG1sXzA1NDk0ODI0OGYwMzQ5N2RhYzI0MTNlNjMxMTg4NGY0EgsSBxDsm4TJ4gQYAZIBIQoKcHJvamVjdF9pZBITQhE0ODUwMzg4MTE3ODYxNzc2MQ&filename=&opi=89354086`

## MCP limitations

- The returned screen metadata did not include explicit update timestamps for individual screens.
- The available read-only screen list exposed default and preview-open states, but no distinct filter-open or bulk-selection states.
- Stitch was treated strictly as a visual-reference source; local implementation stayed anchored to the JSON specification and assignment requirements.

## Source-of-truth guidance

Continue to treat the manually supplied fallback artifacts as sources of truth when Stitch output is incomplete or ambiguous:

- `docs/reference-screens/work-queue-default.png`
- `docs/reference-screens/work-queue-preview-open.png`
- `docs/stitch-design.md`
- `src/data/cyberguard_work_queue_content_spec_v1.json`
