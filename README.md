# dsh-theme-center

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-5865F2.svg)](package.json)

A theme plugin for the **dsh** web UI — a curated gallery of built-in themes
(light and dark separated), one-click switching, an image **wallpaper** mode
with a crop/tint editor, and **import/export** of user-authored `dsh-theme`
files.

> Theme Center 是 dsh Web 界面的主题插件：内置精选主题画廊（浅色 / 深色分组）、
> 一键切换、自定义图片壁纸与裁切编辑、以及 dsh-theme 主题文件的导入 / 导出。

---

## Screenshots

> Placeholder SVGs are committed so the README renders now — replace each with
> a real capture (`docs/screenshots/*.png`). See
> [docs/screenshots/README.md](docs/screenshots/README.md).

| Gallery | Light theme | Dark theme |
| ------- | ----------- | ---------- |
| ![Gallery](docs/screenshots/gallery.svg) | ![Light theme](docs/screenshots/light-theme.svg) | ![Dark theme](docs/screenshots/dark-theme.svg) |

| Wallpaper mode | Import / Export |
| -------------- | --------------- |
| ![Wallpaper](docs/screenshots/wallpaper.svg) | ![Import / Export](docs/screenshots/import-export.svg) |

## Features

- **Curated built-in catalog** — 13 themes, one per visual identity
  ([catalog reference](docs/theme-catalog.md)); light and dark are grouped
  in a 3-column gallery grid.
- **One-click switching** — click a card, the interface re-themes instantly
  and the selection persists across reloads.
- **Wallpaper** — use any image as the interface background with a live
  crop/tint editor (pan, zoom, overlay opacity, surface translucency).
- **dsh-theme files** — import themes others have authored (file or paste),
  export your own; the format is fully documented in
  [docs/theme-file-format.md](docs/theme-file-format.md).
- **Bilingual UI** — Simplified Chinese and English.

## Built-in themes

| id | Name | Scheme | Description |
| -- | ---- | ------ | ----------- |
| `light` | Original Light | light | Pure white · Indigo · DeepSeek original |
| `claude` | Claude Style | light | Warm cream · Terracotta · Claude aesthetic |
| `minimal` | Minimal | light | Pure white · Black · Minimalist |
| `sakura` | Sakura | light | Soft pink · Rose · Spring blossom |
| `paper` | Warm Paper | light | Warm paper · Sepia · Eye-friendly reading |
| `dark` | Original Dark | dark | Charcoal · Indigo · DeepSeek original |
| `claude-dark` | Claude Dark | dark | Warm charcoal · Terracotta · Claude night |
| `tokyo-night` | Tokyo Night | dark | Deep blue · Bright blue · Tokyo night |
| `synthwave` | Synthwave | dark | Midnight purple · Neon purple · Synthwave |
| `graphite` | Graphite | dark | Graphite · Moon white · High-contrast monochrome |
| `monokai` | Monokai | dark | Dark olive · Cyan-green · Classic high contrast |
| `gruvbox` | Gruvbox | dark | Warm brown · Amber · Retro vintage |
| `wallpaper` | Custom Wallpaper | light/dark | Custom image · Adjustable tint · Wallpaper mode |

Palettes removed in the v1.1.0 curation are **archived as importable dsh-theme
files** in [`docs/archive/`](docs/archive/) — nothing is lost. Full swatch
reference: [docs/theme-catalog.md](docs/theme-catalog.md).

## Installation

```sh
# from this repository
pnpm install
pnpm build        # produces lib/client.js (browser) + lib/index.js (host)

# install into the dsh web profile
dsh plugin --profile web add <path-to-this-repo>
```

Enable the plugin in `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: theme-center
      name: dsh-theme-center
```

Then restart `dsh web` and refresh the browser. After editing `src/`, run
`pnpm build` and refresh — the web profile has HMR disabled, so a page reload
loads the new bundle.

> **Known host dependency.** Browser-side settings reads/writes go through the
> API gateway, which only serves namespaced settings on an explicit allowlist
> (`WEB_SETTINGS_NAMESPACES` in `dsh-host-apiproxy`). **This plugin persists
> only if `"theme-center"` is on that allowlist.** The upstream fix
> ("plugins expose their own namespaces") is deferred work, so a manual patch
> is currently required:
>
> `$DSH_HOME/profiles/node_modules/@deepseek-ai/dsh-host-apiproxy/lib/index.js`
> — append `"theme-center"` to the `WEB_SETTINGS_NAMESPACES` array. Re-apply
> after every dsh upgrade/reinstall, otherwise selections, imports and
> wallpapers silently reset on reload.

## Usage

1. **Open the gallery** — Settings → **主题 / Themes**.
2. **Switch** — click any card; the selection persists automatically.
3. **Wallpaper** — pick the *Custom Wallpaper* card → **Choose image**, then
   tune pan/zoom/overlay/surface opacity in the editor.
4. **Import** — 「导入主题」 (file) or 「粘贴导入」 (paste JSON) — see
   [docs/theme-file-format.md](docs/theme-file-format.md).
5. **Export / delete** — every imported theme card has 导出 / 删除 buttons.

## Theme file format

Themes are portable JSON documents:

```json
{
  "format": "dsh-theme",
  "version": 1,
  "id": "aurora",
  "name": "Aurora",
  "description": "A deep violet night sky.",
  "colorScheme": "dark",
  "tokens": {
    "--dsw-alias-bg-base": "#0d0b1e",
    "--dsw-alias-label-primary": "#ece9fb"
  },
  "wallpaper": "data:image/jpeg;base64,...."
}
```

Full reference: [docs/theme-file-format.md](docs/theme-file-format.md)
(中文版: [docs/theme-file-format.zh.md](docs/theme-file-format.zh.md)).
Working example: [`examples/aurora.dsh-theme.json`](examples/aurora.dsh-theme.json).

## Documentation

| Document | Contents |
| -------- | -------- |
| [docs/theme-catalog.md](docs/theme-catalog.md) | Built-in catalog with swatches & the unified description format |
| [docs/theme-file-format.md](docs/theme-file-format.md) | The dsh-theme file format (full token reference) |
| [docs/theme-file-format.zh.md](docs/theme-file-format.zh.md) | 主题文件格式（中文版） |
| [docs/archive/](docs/archive/) | Archived palettes of the curated-out themes (importable) |
| [CHANGELOG.md](CHANGELOG.md) | Release history & curation rationale |

## Architecture

```
src/
  shared/theme-file.ts     format constants, id normalization (shared by host & client)
  host/index.ts            Node side: registers the theme-center settings namespace schema
  client/
    index.tsx              client apply: theme registry, selection persistence, DOM presentation, settings entry
    catalog.ts             13 built-in themes: palette → token expansion + preview swatches
    parser.ts              dsh-theme file parsing / validation / export
    wallpaper.ts           wallpaper processing (downscale, tint, encode) & wallpaper theme building
    ThemeGallerySection.tsx settings gallery (3-column grid, import/export, wallpaper controls)
    locales.ts             zh/en dictionaries (zh is the key-set source)
    styles.ts              injected stylesheet (gallery + wallpaper surfaces)
```

**How themes take effect** — `light`/`dark` are the ui-theme runtime's own
themes (selection writes `ui-theme.preference`); every other theme is
registered into the runtime's registry via `ctx.theme.register()`, and while a
custom theme is active this plugin paints `color-scheme`,
`body[data-ds-dark-theme]` and the token variables itself (ui-layout's
presenter cannot express custom ids). The General-settings **Appearance** row
is shadowed so authority stays in the gallery; built-in selections repaint
from a cached base palette without settings round trips. Selections, imported
themes and wallpapers persist in the `theme-center` settings namespace.

## Development

```sh
pnpm install
pnpm typecheck   # tsc --noEmit
pnpm build       # esbuild → lib/client.js + lib/index.js
node scripts/smoke.mjs          # controller smoke test (no browser)
node scripts/archive-removed-themes.mjs  # regenerate docs/archive/*
```

The `scripts/cdp-*.mjs` files are headless-Chrome (CDP) verification tools
used during development; the `restart-dsh-web*.ps1` helpers are
machine-specific and intentionally not shipped.

## License

[MIT](LICENSE)
