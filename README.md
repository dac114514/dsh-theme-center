<p align="center">
  <img src="assets/logo.svg" width="96" alt="dsh-theme-center logo">
</p>

# dsh-theme-center

English | [中文](README-zh.md)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-5865F2.svg)](package.json)

The theme center inside DeepSeek Harness — a curated gallery of built-in
themes (light and dark grouped), one-click switching, a custom-image
**wallpaper** with a crop/tint editor, and **import/export** of
user-authored `dsh-theme` files. Open **Settings → 主题 / Themes**.

![Theme gallery](docs/screenshots/gallery.svg)

Click a card to switch instantly — your choice survives restarts:

![Light and dark themes](docs/screenshots/light-theme.svg)

## Install

```sh
dsh plugin --profile web add <path-to-this-repo>
```

Enable the plugin in `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: theme-center
      name: dsh-theme-center
```

Restart `dsh web`, then open **Settings → 主题 / Themes**.

## What you get

- **Curated built-in catalog** — 11 themes, one per visual identity; light and
  dark are grouped in a 3-column gallery grid
- **One-click switching** — instant re-theme, the selection persists across
  reloads
- **Wallpaper** — any image as the interface background, with a live
  crop/tint editor (pan, zoom, overlay opacity, surface translucency)
- **dsh-theme files** — import themes others have authored (file or paste),
  export your own; the format is fully documented
- **Bilingual UI** — Simplified Chinese and English

## Wallpaper

![Wallpaper editor](docs/screenshots/wallpaper.svg)

- pick an image — it is downscaled locally (1440px, JPEG q0.72) and stored
  in your settings
- the banner preview shows the **entire image** with a dashed frame marking
  the exact on-screen crop — what's inside the frame is what you get
- drag to pan the frame, wheel to zoom (100%–300%); sliders tune the
  readability overlay and surface translucency
- all parameters persist in the `theme-center` settings namespace

## Theme file format

Themes are portable JSON documents — author your own or re-import an
archived one:

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

Full reference: [docs/theme-file-format.md](docs/theme-file-format.md) ·
中文版: [docs/theme-file-format.zh.md](docs/theme-file-format.zh.md) ·
Example: [`examples/aurora.dsh-theme.json`](examples/aurora.dsh-theme.json)

![Import / Export](docs/screenshots/import-export.svg)

## Built-in themes

| id | Name | Scheme | Description |
| -- | ---- | ------ | ----------- |
| `light` | Original Light | light | Pure white · Indigo · DeepSeek original |
| `claude` | Claude Style | light | Warm cream · Terracotta · Claude aesthetic |
| `sakura` | Sakura | light | Soft pink · Rose · Spring blossom |
| `paper` | Warm Paper | light | Warm paper · Sepia · Eye-friendly reading |
| `dark` | Original Dark | dark | Charcoal · Indigo · DeepSeek original |
| `claude-dark` | Claude Dark | dark | Warm charcoal · Terracotta · Claude night |
| `tokyo-night` | Tokyo Night | dark | Deep blue · Bright blue · Tokyo night |
| `graphite` | Graphite | dark | Graphite · Moon white · High-contrast monochrome |
| `monokai` | Monokai | dark | Dark olive · Cyan-green · Classic high contrast |
| `gruvbox` | Gruvbox | dark | Warm brown · Amber · Retro vintage |
| `wallpaper` | Custom Wallpaper | light/dark | Custom image · Adjustable tint · Wallpaper mode |

Every palette that is not part of the shipped catalog is **archived, not
deleted**, as an importable dsh-theme file in
[`docs/archive/`](docs/archive/) — 14 themes you can restore in one click.
Full swatch reference: [docs/theme-catalog.md](docs/theme-catalog.md)

## Notes

- **Known host dependency.** Browser-side settings go through an API-gateway
  allowlist (`WEB_SETTINGS_NAMESPACES` in `dsh-host-apiproxy`); this plugin
  persists only when `"theme-center"` is on that list. A manual patch is
  currently required — re-apply it after every dsh upgrade (the patch
  location and steps are documented in the
  [source-tree README](https://github.com/dsh-market/dsh-theme-center)).
- **Development** — `pnpm install` → `pnpm typecheck` → `pnpm build`;
  `node scripts/smoke.mjs` runs the controller smoke test without a browser.

## License

MIT · [dsh-market](https://github.com/dsh-market) · docs in
[`docs/`](docs/)
