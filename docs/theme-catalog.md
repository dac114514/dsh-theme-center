# Built-in Theme Catalog

The curated catalog — 11 themes, one per visual identity. Descriptions follow
the unified `基调 · 点缀色 · 风格标签` (`base · accent · style`) format; the
swatches below are the gallery-card preview colors.

## Light

| id | Name 名称 | Preview base | Sidebar | Bubble | Accent | Text | Description 描述 |
| -- | --------- | ------------ | ------- | ------ | ------ | ---- | ---------------- |
| `light` | 原版亮 Original Light | `#ffffff` | `#f5f6f8` | `#eaf2ff` | `#4176e6` | `#14151a` | 纯白 · 靛蓝 · DeepSeek 原版 / Pure white · Indigo · DeepSeek original |
| `claude` | Claude 风格 | `#faf9f5` | `#f0eee6` | `#e8e5db` | `#c96442` | `#3d3929` | 暖米 · 陶土橙 · Claude 美学 / Warm cream · Terracotta · Claude aesthetic |
| `sakura` | 樱花粉 | `#fff9fa` | `#fdeef2` | `#fce4ea` | `#e86a92` | `#4a2733` | 柔粉 · 玫瑰 · 春日浪漫 / Soft pink · Rose · Spring blossom |
| `paper` | 纸张护眼 | `#f7f3e9` | `#f1ebdd` | `#efe6d3` | `#8b6f47` | `#3e3526` | 暖纸 · 棕褐 · 护眼阅读 / Warm paper · Sepia · Eye-friendly reading |

## Dark

| id | Name 名称 | Preview base | Sidebar | Bubble | Accent | Text | Description 描述 |
| -- | --------- | ------------ | ------- | ------ | ------ | ---- | ---------------- |
| `dark` | 原版暗 Original Dark | `#15151b` | `#1b1b21` | `#232329` | `#5686fe` | `#e6e8ee` | 炭黑 · 靛蓝 · DeepSeek 原版 / Charcoal · Indigo · DeepSeek original |
| `claude-dark` | Claude 暗色 | `#201f1c` | `#1b1a17` | `#33312c` | `#d97757` | `#e9e6de` | 暖炭 · 陶土橙 · Claude 夜间 / Warm charcoal · Terracotta · Claude night |
| `tokyo-night` | 东京之夜 | `#1a1b26` | `#16161e` | `#2a2f45` | `#7aa2f7` | `#c0caf5` | 深蓝 · 亮蓝 · 东京夜色 / Deep blue · Bright blue · Tokyo night |
| `graphite` | 石墨黑 | `#0e0e10` | `#0b0b0d` | `#1b1b1e` | `#e4e4e7` | `#f4f4f5` | 石墨 · 月白 · 高对比单色 / Graphite · Moon white · High-contrast monochrome |
| `monokai` | Monokai | `#272822` | `#1b1c19` | `#33342e` | `#66d9ef` | `#f8f8f2` | 墨绿 · 青绿 · 高对比经典 / Dark olive · Cyan-green · Classic high contrast |
| `gruvbox` | Gruvbox | `#282828` | `#1c1e1d` | `#3c3a37` | `#fe8019` | `#ebdbb2` | 暖棕 · 琥珀 · 复古怀旧 / Warm brown · Amber · Retro vintage |

## Special

| id | Name 名称 | Description 描述 |
| -- | --------- | ---------------- |
| `wallpaper` | 自定义壁纸 Custom Wallpaper | 自定义图片 · 可调遮罩 · 壁纸模式 / Custom image · Adjustable tint · Wallpaper mode |

## Curation notes

- **One theme per identity.** The catalog ships 11 curated themes; palettes
  that duplicated a kept identity, plus `minimal` and `synthwave` (removed
  on request), are archived. See [CHANGELOG.md](../CHANGELOG.md).
- **Nothing is lost.** Every removed palette is archived as an importable
  dsh-theme file in [`docs/archive/`](archive/) (14 files) and can be
  restored as a custom theme in one click.
- **Full palettes** (all 40+ alias tokens per theme) live in
  [`src/client/catalog.ts`](../src/client/catalog.ts), expanded from a flat
  palette by `tokensOf()`.
