# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-15

First release of **dsh-theme-center** — the theme center for the dsh web UI.

### Added

- **Theme gallery** — a settings section (设置 → 主题) with a 3-column preview
  grid, light and dark grouped; every card renders a canvas-drawn PNG mock of
  the theme, and clicking a card switches the interface instantly.
- **One-click switching with persistence** — selections survive restarts
  (stored in the `theme-center` settings namespace); `light`/`dark` are the
  runtime's own themes, all others are registered and painted by the plugin.
- **Custom wallpaper** — any image as the interface background, downscaled
  locally (1440 px, JPEG q0.72) and edited in a live crop/tint editor:
  drag-to-pan, wheel-zoom (100%–300%), readability overlay, and surface
  opacity; the banner preview shows the full image with a dashed frame
  marking the exact on-screen crop (what's inside the frame is what you get).
- **dsh-theme file import/export** — portable JSON theme files (file picker or
  paste); the format is documented in
  [`docs/theme-file-format.md`](docs/theme-file-format.md) /
  [`docs/theme-file-format.zh.md`](docs/theme-file-format.zh.md), with a
  working example in [`examples/`](examples/).
- **Archived palettes** — 14 curated-out themes kept as importable dsh-theme
  files under [`docs/archive/`](docs/archive/), restorable as custom themes in
  one click (regenerate with `node scripts/archive-removed-themes.mjs`).
- **Documentation** — [`README.md`](README.md) / [`README-zh.md`](README-zh.md)
  with screenshot slots, [`docs/theme-catalog.md`](docs/theme-catalog.md)
  (swatch reference), MIT license, and a controller smoke test
  (`node scripts/smoke.mjs`, browser-free).

### Changed

- **Curated built-in catalog** — 11 themes, one per visual identity
  (`light`, `claude`, `sakura`, `paper`, `dark`, `claude-dark`,
  `tokyo-night`, `graphite`, `monokai`, `gruvbox`, `wallpaper`); see
  [`docs/theme-catalog.md`](docs/theme-catalog.md).
- **Unified theme descriptions** — every theme uses the
  `基调 · 点缀色 · 风格标签` (`base · accent · style`) format in both zh and
  en dictionaries.
- **Bilingual UI** — Simplified Chinese and English; the General-settings
  Appearance row is shadowed so the gallery stays authoritative.

### Fixed

- **Wallpaper slider / zoom bounce-back** — rapid edits (slider drags, pan,
  wheel zoom) wrote to the settings document at high frequency; stale
  in-flight round-trip notifications could revert the preview and snap the
  sliders back. The controller now keeps an “edit-wins” window around local
  wallpaper writes (same pattern as the selection click-wins window), so the
  local state is authoritative while an edit is in flight.

### Removed

- **跟随系统 (follow system) button** from the theme panel toolbar; the
  system default preference still applies when nothing is selected.
- The following themes are **not part of the shipped catalog** (palettes
  duplicated a kept identity; `minimal` and `synthwave` were dropped on
  request). All 14 remain importable from [`docs/archive/`](docs/archive/):

  `one-light`, `solarized-light`, `catppuccin-latte`, `minimal`, `midnight`,
  `one-dark`, `dracula`, `nord`, `catppuccin`, `night-owl`, `gemini`, `grok`,
  `chatgpt`, `synthwave`

### Known limitations

- **Host allowlist patch required for persistence.** Browser-side settings
  go through an API-gateway allowlist (`WEB_SETTINGS_NAMESPACES` in
  `dsh-host-apiproxy`); this plugin persists only when `"theme-center"` is on
  that list. A manual patch is required and must be re-applied after every
  dsh upgrade — see the README notes.
