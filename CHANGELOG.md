# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-XX-XX

### Changed

- **Curated the built-in catalog** from 25 down to 13 themes. Every theme now
  owns a distinct visual identity; palettes that duplicated a kept theme were
  removed (see below). The full catalog is documented in
  [`docs/theme-catalog.md`](docs/theme-catalog.md).
- **Unified the description format** for every theme to
  `基调 · 点缀色 · 风格标签` / `base tone · accent · style tag`
  (e.g. “暖米 · 陶土橙 · Claude 美学”), in both zh and en dictionaries.
- Fixed the stale smoke test to match the current controller behavior
  (shadowed Appearance row, palette-cache repaint, debounced persistence).
- `pnpm-workspace.yaml` now approves the esbuild postinstall build script so
  `pnpm build` works out of the box for contributors.

### Removed (archived, not deleted)

The following themes were removed from the built-in catalog because they
duplicated a kept identity. Their palettes are **preserved as importable
dsh-theme files** under [`docs/archive/`](docs/archive/) — import any of them
from the gallery to restore it as a custom theme:

| Removed theme | Kept representative | Reason |
| ------------- | ------------------- | ------ |
| `one-light` | `light` | Same white + blue identity |
| `solarized-light` | `paper` | Same warm-paper family |
| `catppuccin-latte` | — | Light lavender-gray, trimmed with the light set |
| `midnight` | `tokyo-night` | Same deep-navy family |
| `one-dark` | `tokyo-night` | Same dark blue-gray editor family |
| `dracula` | `tokyo-night` / `synthwave` | Same dark blue-gray / purple family |
| `nord` | `tokyo-night` | Same dark blue-gray editor family |
| `catppuccin` | `tokyo-night` / `synthwave` | Same dark blue-gray / purple family |
| `night-owl` | `tokyo-night` | Same deep-navy family |
| `gemini` | `graphite` | Same near-black neutral + accent |
| `grok` | `graphite` | Same near-black neutral + accent |
| `chatgpt` | `graphite` | Same near-black neutral + accent |

## [1.0.0] - 2025-XX-XX

- Initial release: theme gallery (light/dark grouped), one-click switching,
  wallpaper background with a crop/tint editor, import/export of user-authored
  `dsh-theme` files.
