# dsh-theme File Format

Theme Center lets users author their own interface themes as portable JSON
documents — **dsh-theme files**. This document is the full reference for that
format.

- A working example: [`examples/aurora.dsh-theme.json`](../examples/aurora.dsh-theme.json)
- The parser implementation: [`src/client/parser.ts`](../src/client/parser.ts)
- The host-side validation schema: [`src/host/index.ts`](../src/host/index.ts)
- Archived built-in palettes you can re-import: [`docs/archive/`](../docs/archive/)

---

## 1. The envelope

A theme file is a single UTF-8 JSON object:

```json
{
  "format": "dsh-theme",
  "version": 1,
  "id": "aurora",
  "name": "Aurora",
  "description": "A deep violet night sky with a glowing accent.",
  "colorScheme": "dark",
  "tokens": {
    "--dsw-alias-bg-base": "#0d0b1e",
    "--dsw-alias-label-primary": "#ece9fb",
    "--dsw-specific-sidebar-fill": "#0a0918"
  },
  "wallpaper": "data:image/jpeg;base64,...."
}
```

## 2. Fields

| Field | Required | Type | Rules |
| ----- | -------- | ---- | ----- |
| `format` | yes | string | Must be exactly `"dsh-theme"`. |
| `version` | yes | number | Must be `1`. |
| `name` | yes | string | Theme name, ≤ 64 characters. |
| `id` | no | string | Lowercase id: starts with a letter, then letters / digits / hyphens, ≤ 64 characters (`/^[a-z][a-z0-9-]{0,63}$/`). Derived from `name` when absent (a warning is shown). Must not collide with a built-in or an already-imported theme id. |
| `description` | no | string | ≤ 200 characters. |
| `colorScheme` | yes | `"light"` \| `"dark"` | Which palette family the theme belongs to. |
| `tokens` | no | object | CSS variable name → value mapping (see §3). Keys must start with `--`; values are strings ≤ 300 characters. |
| `wallpaper` | no | string | An image **data URL** (`data:image/png|jpeg|webp|gif|avif;base64,...`), ≤ 2.5 MB. Embeds the theme's own background image. |

Unknown fields are **ignored with a warning** (forward compatibility).

### Validation summary

Anything the import parser rejects is rejected with a precise, localized
message; anything it accepts is guaranteed to persist and re-apply. In short:

- root must be an object;
- `format` / `version` / `colorScheme` / `name` are mandatory and checked;
- invalid `tokens` keys or values are skipped with a warning;
- `wallpaper`, when present, must be a valid image data URL within the size
  limit;
- duplicate ids (built-in or imported) are rejected.

## 3. Tokens

`tokens` maps **CSS custom property names** to values. Two token classes are
legal:

### 3.1 Design-platform tokens (`--dsw-alias-*` / `--dsw-specific-*`)

These are the semantic tokens declared by the web app's design platform
(`lib/styles/design-platform.css`). They are the *recommended* way to theme
the interface — each one drives a concrete UI surface. The complete set:

| Token | Purpose | Typical value |
| ----- | ------- | ------------- |
| `--dsw-alias-bg-base` | App background | `#0d0b1e` |
| `--dsw-alias-bg-layer-1` | First surface layer | `#121028` |
| `--dsw-alias-bg-layer-2` | Second surface layer | `#171434` |
| `--dsw-alias-bg-layer-3` | Third surface layer | `#1d1940` |
| `--dsw-alias-bg-overlay` | Modal / overlay backdrop | `#241f4d` |
| `--dsw-alias-bg-module-platform` | Floating module background | `#171434` |
| `--dsw-alias-bg-mask-1` | Strong mask (wallpaper readability) | `rgba(0,0,0,0.24)` |
| `--dsw-alias-bg-mask-2` | Light mask | `rgba(0,0,0,0.12)` |
| `--dsw-alias-border-l1` | Hairline border | `rgba(196,181,253,0.08)` |
| `--dsw-alias-border-l2` | Regular border | `rgba(196,181,253,0.15)` |
| `--dsw-alias-border-l3` | Strong border | `rgba(196,181,253,0.22)` |
| `--dsw-alias-brand-primary` | Brand / accent color | `#9f7aea` |
| `--dsw-alias-brand-text` | Brand-colored text | `#9f7aea` |
| `--dsw-alias-button-primary-fill` | Primary button fill | `#7c5cd6` |
| `--dsw-alias-button-primary-hover` | Primary button hover | `#9f7aea` |
| `--dsw-alias-button-elevated-fill` | Elevated button fill | `#121028` |
| `--dsw-alias-button-floating-fill` | Floating button fill | `#171434` |
| `--dsw-alias-button-floating-hover` | Floating button hover | `#1d1940` |
| `--dsw-alias-button-info-fill` | Info button fill | `#7c5cd6` |
| `--dsw-alias-button-info-hover` | Info button hover | `#9f7aea` |
| `--dsw-alias-button-primary-dimmed` | Dimmed primary button | `#1d1940` |
| `--dsw-alias-interactive-bg-hover` | Hover highlight | `rgba(196,181,253,0.06)` |
| `--dsw-alias-interactive-bg-active` | Active highlight | `rgba(196,181,253,0.1)` |
| `--dsw-alias-label-primary` | Primary text | `#ece9fb` |
| `--dsw-alias-label-secondary` | Secondary text | `#a9a3cf` |
| `--dsw-alias-label-tertiary` | Tertiary text / captions | `#7b75a3` |
| `--dsw-alias-label-caption` | Caption text | `#7b75a3` |
| `--dsw-alias-label-primary-foreground` | Text on accent fills | `#ffffff` |
| `--dsw-alias-markdown-code-block` | Code block background | `#171434` |
| `--dsw-alias-markdown-inline-code` | Inline code background | `#1d1940` |
| `--dsw-alias-scrollbar-bg-l2` | Scrollbar track | `#1d1940` |
| `--dsw-alias-scrollbar-hover-l2` | Scrollbar hover | `#262052` |
| `--dsw-alias-state-error-primary` | Error color | `#f87171` |
| `--dsw-alias-state-success-primary` | Success color | `#4ade80` |
| `--dsw-alias-state-warn-primary` | Warning color | `#fbbf24` |
| `--dsw-alias-toast-bg` | Toast background | `#241f4d` |
| `--dsw-alias-tooltip-bg` | Tooltip background | `#241f4d` |
| `--dsw-specific-bubble` | Chat bubble fill | `#1d1940` |
| `--dsw-specific-bubble-highlight` | Highlighted bubble | `#262052` |
| `--dsw-specific-input-major` | Major input fill | `#121028` |
| `--dsw-specific-menu` | Menu surface | `#1d1940` |
| `--dsw-specific-sidebar-fill` | Sidebar background | `#0a0918` |
| `--dsw-specific-sidebar-nav-item-active` | Active nav item | `#1d1940` |
| `--dsw-specific-sidebar-nav-item-hover` | Hovered nav item | `#171434` |
| `--dsw-specific-sidebar-nav-item-active-accent` | Active nav accent | `rgba(159,122,234,0.16)` |

> Values shown are from the `aurora` example; use your own.

### 3.2 Custom variables

Any other `--name` variable is legal and is carried straight into the document
as a CSS custom property. This is how advanced themes extend the platform —
for example, the built-in **wallpaper** theme works by defining:

```json
"tokens": {
  "--dsh-wallpaper-image": "url(data:image/jpeg;base64,....)",
  "--dsh-wallpaper-w": "1920px",
  "--dsh-wallpaper-h": "1080px",
  "--dsh-wallpaper-x": "50%",
  "--dsh-wallpaper-y": "50%",
  "--dsh-wallpaper-overlay": "rgba(8, 10, 14, 0.45)"
}
```

## 4. Writing a theme from scratch

A convenient workflow is to derive your palette from the alias tokens in §3.1:

1. Pick a **base** (app background), 2–3 **surface** shades (layers), a
   **sidebar** shade, a **bubble** shade, an **accent** color and its hover,
   plus **text** colors — that covers the visible UI.
2. Map them onto the tokens; let borders/masks derive from your base color
   with alpha.
3. Test in the gallery via **粘贴导入** (paste import) — the parse result and
   live preview are immediate.

The built-in catalog (`src/client/catalog.ts`) authors every theme from a
flat palette this way — a good crib sheet for what a coherent palette looks
like.

## 5. Import / export workflow

- **Import** — Settings → Themes → **导入主题** (choose a `.json` / `.dsh-theme.json`
  file) or **粘贴导入** (paste the JSON text and parse).
- **Export** — every imported theme card has an **导出** button that downloads
  the theme back as `{id}.dsh-theme.json`.
- **Restore an archived theme** — `docs/archive/*.dsh-theme.json` are complete
  dsh-theme files; import any of them to bring the palette back as a custom
  theme.

## 6. Limits (constants)

| Constant | Value |
| -------- | ----- |
| `THEME_FILE_VERSION` | `1` |
| `MAX_THEME_NAME_LENGTH` | 64 |
| `MAX_THEME_DESCRIPTION_LENGTH` | 200 |
| `MAX_TOKEN_VALUE_LENGTH` | 300 |
| `MAX_WALLPAPER_DATA_URL` | 2 500 000 (≈ 1.9 MB binary) |
| `MAX_IMPORT_FILE_BYTES` | 4 000 000 |
| `MAX_CUSTOM_THEMES` | 30 |

See [`src/shared/theme-file.ts`](../src/shared/theme-file.ts) for the
canonical constants and normalization helpers.
