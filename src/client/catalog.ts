/**
 * The built-in theme catalog.
 *
 * Each entry is a `ThemeDef` with:
 *  - `id` / `nameKey` / `descKey`  — identity and localized copy (dictionary
 *    keys live in locales.ts; names/descriptions are locale-aware).
 *  - `colorScheme` — `"light"` | `"dark"` (drives `color-scheme` and the
 *    `data-ds-dark-theme` body attribute).
 *  - `tokens` — CSS custom-property overrides applied to `<body>`; every
 *    `--dsw-alias-*` / `--dsw-specific-*` design-platform token is a legal
 *    target. `light` and `dark` are the original built-ins (empty tokens —
 *    the base stylesheets already carry both palettes).
 *  - `preview` — the swatch palette the gallery card renders (independent of
 *    `tokens` so the card stays legible even for the original themes).
 *
 * Curation (v1.1.0): the catalog is a deliberately small, non-homogeneous
 * set — one theme per visual identity. Palettes that duplicated a kept
 * identity (e.g. `one-light` ≈ `light`, `dracula`/`nord`/`one-dark` ≈ the
 * dark blue-gray editor family, `gemini`/`grok`/`chatgpt` ≈ `graphite`)
 * were archived as importable dsh-theme files under docs/archive/ so no
 * palette is lost — users can re-import them as custom themes.
 *
 * Maintainability: palettes are authored per theme as a flat `Palette` and
 * expanded through `tokensOf` — add a token to `tokensOf` once and every
 * theme inherits it. Keep the alias set in sync with
 * `lib/styles/design-platform.css` when the platform grows new tokens.
 */

/** Preview swatch keys used by the gallery card. */
export const PREVIEW_KEYS = ["base", "surface", "sidebar", "bubble", "accent", "text"];

/**
 * Map a per-theme palette to the full alias-token set. Every alias the
 * platform declares must resolve — each palette either supplies the key or a
 * named fallback (e.g. `surface2` falls back to `surface`), so a minimal
 * palette still yields a coherent surface.
 */
export function tokensOf(palette) {
	const v = (key, fallbackKey = undefined) => {
		const value = palette[key] ?? (fallbackKey === undefined ? undefined : palette[fallbackKey]);
		if (value === undefined) throw new Error(`theme palette missing token "${key}"`);
		return value;
	};
	return {
		"--dsw-alias-bg-base": v("base"),
		"--dsw-alias-bg-layer-1": v("surface"),
		"--dsw-alias-bg-layer-2": v("surface2", "surface"),
		"--dsw-alias-bg-layer-3": v("surface3", "surface2"),
		"--dsw-alias-bg-overlay": v("overlay", "surface3"),
		"--dsw-alias-bg-module-platform": v("module", "surface3"),
		"--dsw-alias-bg-mask-1": palette.mask1 ?? "rgba(0, 0, 0, 0.24)",
		"--dsw-alias-bg-mask-2": palette.mask2 ?? "rgba(0, 0, 0, 0.12)",
		"--dsw-alias-border-l1": v("border1"),
		"--dsw-alias-border-l2": v("border2"),
		"--dsw-alias-border-l3": v("border3", "border2"),
		"--dsw-alias-brand-primary": v("accent"),
		"--dsw-alias-brand-text": v("accent"),
		"--dsw-alias-button-primary-fill": v("accent"),
		"--dsw-alias-button-primary-hover": v("accentHover", "accent"),
		"--dsw-alias-button-elevated-fill": v("surface"),
		"--dsw-alias-button-floating-fill": v("surface2"),
		"--dsw-alias-button-floating-hover": v("surface3"),
		"--dsw-alias-button-info-fill": v("accent"),
		"--dsw-alias-button-info-hover": v("accentHover", "accent"),
		"--dsw-alias-button-primary-dimmed": v("surface3"),
		"--dsw-alias-interactive-bg-hover": v("hover", "border1"),
		"--dsw-alias-interactive-bg-active": v("active", "border2"),
		"--dsw-alias-label-primary": v("text"),
		"--dsw-alias-label-secondary": v("textSecondary"),
		"--dsw-alias-label-tertiary": v("textTertiary"),
		"--dsw-alias-label-caption": v("textTertiary"),
		"--dsw-alias-label-primary-foreground": palette.textOnAccent ?? "#ffffff",
		"--dsw-alias-markdown-code-block": v("code", "surface2"),
		"--dsw-alias-markdown-inline-code": v("inlineCode", "surface3"),
		"--dsw-alias-scrollbar-bg-l2": v("scrollbar", "border2"),
		"--dsw-alias-scrollbar-hover-l2": v("scrollbarHover", "border3"),
		"--dsw-alias-state-error-primary": v("error"),
		"--dsw-alias-state-success-primary": v("success"),
		"--dsw-alias-state-warn-primary": v("warn"),
		"--dsw-alias-toast-bg": v("toast", "text"),
		"--dsw-alias-tooltip-bg": v("tooltip", "text"),
		"--dsw-specific-bubble": v("bubble"),
		"--dsw-specific-bubble-highlight": v("bubbleHighlight", "bubble"),
		"--dsw-specific-input-major": v("input", "surface"),
		"--dsw-specific-menu": v("surface3"),
		"--dsw-specific-sidebar-fill": v("sidebar"),
		"--dsw-specific-sidebar-nav-item-active": v("itemActive", "surface3"),
		"--dsw-specific-sidebar-nav-item-hover": v("itemHover", "surface2"),
		"--dsw-specific-sidebar-nav-item-active-accent": palette.itemAccent ?? palette.accent
	};
}

/** Expand a palette into the compact preview swatches the cards render. */
export function previewOf(palette) {
	return {
		base: palette.base,
		surface: palette.surface ?? palette.base,
		sidebar: palette.sidebar ?? palette.surface ?? palette.base,
		bubble: palette.bubble ?? palette.surface2 ?? palette.surface,
		accent: palette.accent,
		text: palette.text
	};
}

/**
 * Full catalog in display order. `builtin` entries (the original pair) are
 * not registered into the theme runtime — the ui-theme plugin already owns
 * them — but they are first-class grid entries here.
 */
export const CATALOG = [
	{
		id: "light",
		nameKey: "theme.light",
		descKey: "theme.light.desc",
		builtin: true,
		colorScheme: "light",
		tokens: {},
		preview: {
			base: "#ffffff",
			surface: "#f7f8fa",
			sidebar: "#f5f6f8",
			bubble: "#eaf2ff",
			accent: "#4176e6",
			text: "#14151a"
		}
	},
	{
		id: "claude",
		nameKey: "theme.claude",
		descKey: "theme.claude.desc",
		colorScheme: "light",
		preview: {
			base: "#faf9f5",
			surface: "#f5f4ef",
			sidebar: "#f0eee6",
			bubble: "#e8e5db",
			accent: "#c96442",
			text: "#3d3929"
		},
		palette: {
			base: "#faf9f5",
			surface: "#f5f4ef",
			surface2: "#eeede6",
			surface3: "#e7e5dc",
			overlay: "#e2e0d6",
			module: "#f0efe9",
			border1: "rgba(61, 57, 41, 0.08)",
			border2: "rgba(61, 57, 41, 0.14)",
			border3: "rgba(61, 57, 41, 0.2)",
			accent: "#c96442",
			accentHover: "#b85a3b",
			text: "#3d3929",
			textSecondary: "#6b6558",
			textTertiary: "#8f897c",
			textOnAccent: "#fff7f2",
			hover: "rgba(61, 57, 41, 0.05)",
			active: "rgba(61, 57, 41, 0.09)",
			sidebar: "#f0eee6",
			itemActive: "#e8e5db",
			itemHover: "#edeae1",
			itemAccent: "rgba(201, 100, 66, 0.14)",
			bubble: "#e8e5db",
			bubbleHighlight: "#ded9cb",
			input: "#f5f4ef",
			code: "#f0eee6",
			inlineCode: "#efe9dd",
			scrollbar: "#d8d4c7",
			scrollbarHover: "#c3beae",
			error: "#b5472f",
			success: "#4e7c4a",
			warn: "#b7791f",
			toast: "#3d3929",
			tooltip: "#3d3929"
		}
	},
	{
		id: "minimal",
		nameKey: "theme.minimal",
		descKey: "theme.minimal.desc",
		colorScheme: "light",
		preview: {
			base: "#ffffff",
			surface: "#fafafa",
			sidebar: "#f7f7f7",
			bubble: "#f2f2f2",
			accent: "#111111",
			text: "#111111"
		},
		palette: {
			base: "#ffffff",
			surface: "#ffffff",
			surface2: "#fafafa",
			surface3: "#f4f4f5",
			overlay: "#ececee",
			module: "#fafafa",
			border1: "rgba(0, 0, 0, 0.05)",
			border2: "rgba(0, 0, 0, 0.1)",
			border3: "rgba(0, 0, 0, 0.14)",
			accent: "#111111",
			accentHover: "#000000",
			text: "#111111",
			textSecondary: "#55555c",
			textTertiary: "#88888f",
			textOnAccent: "#ffffff",
			hover: "rgba(0, 0, 0, 0.04)",
			active: "rgba(0, 0, 0, 0.08)",
			sidebar: "#f7f7f7",
			itemActive: "#eeeeef",
			itemHover: "#f2f2f3",
			itemAccent: "rgba(0, 0, 0, 0.06)",
			bubble: "#f2f2f2",
			bubbleHighlight: "#e8e8e9",
			input: "#ffffff",
			code: "#f7f7f7",
			inlineCode: "#f0f0f1",
			scrollbar: "#ddddde",
			scrollbarHover: "#c8c8cb",
			error: "#dc2626",
			success: "#16a34a",
			warn: "#d97706",
			toast: "#111111",
			tooltip: "#111111"
		}
	},
	{
		id: "sakura",
		nameKey: "theme.sakura",
		descKey: "theme.sakura.desc",
		colorScheme: "light",
		preview: {
			base: "#fff9fa",
			surface: "#ffffff",
			sidebar: "#fdeef2",
			bubble: "#fce4ea",
			accent: "#e86a92",
			text: "#4a2733"
		},
		palette: {
			base: "#fff9fa",
			surface: "#ffffff",
			surface2: "#fdf1f4",
			surface3: "#fbeaef",
			overlay: "#f6dde5",
			module: "#fdf1f4",
			border1: "rgba(180, 70, 110, 0.08)",
			border2: "rgba(180, 70, 110, 0.15)",
			border3: "rgba(180, 70, 110, 0.22)",
			accent: "#e86a92",
			accentHover: "#d64b7a",
			text: "#4a2733",
			textSecondary: "#8a5a6b",
			textTertiary: "#b08a97",
			textOnAccent: "#ffffff",
			hover: "rgba(180, 70, 110, 0.05)",
			active: "rgba(180, 70, 110, 0.1)",
			sidebar: "#fdeef2",
			itemActive: "#fbe0e8",
			itemHover: "#fce7ed",
			itemAccent: "rgba(232, 106, 146, 0.14)",
			bubble: "#fce4ea",
			bubbleHighlight: "#f9d6e0",
			input: "#ffffff",
			code: "#fdf1f4",
			inlineCode: "#fbe4eb",
			scrollbar: "#f2cbd6",
			scrollbarHover: "#eab3c2",
			error: "#e5484d",
			success: "#4caf7d",
			warn: "#c98a1b",
			toast: "#4a2733",
			tooltip: "#4a2733"
		}
	},
	{
		id: "paper",
		nameKey: "theme.paper",
		descKey: "theme.paper.desc",
		colorScheme: "light",
		preview: {
			base: "#f7f3e9",
			surface: "#fbf8f0",
			sidebar: "#f1ebdd",
			bubble: "#efe6d3",
			accent: "#8b6f47",
			text: "#3e3526"
		},
		palette: {
			base: "#f7f3e9",
			surface: "#fbf8f0",
			surface2: "#f3eddf",
			surface3: "#ece4d1",
			overlay: "#e4dbc5",
			module: "#f3eddf",
			border1: "rgba(90, 70, 40, 0.09)",
			border2: "rgba(90, 70, 40, 0.16)",
			border3: "rgba(90, 70, 40, 0.22)",
			accent: "#8b6f47",
			accentHover: "#7a6040",
			text: "#3e3526",
			textSecondary: "#6e624c",
			textTertiary: "#96896f",
			textOnAccent: "#fdfaf3",
			hover: "rgba(90, 70, 40, 0.05)",
			active: "rgba(90, 70, 40, 0.09)",
			sidebar: "#f1ebdd",
			itemActive: "#e9e1cf",
			itemHover: "#ede6d6",
			itemAccent: "rgba(139, 111, 71, 0.14)",
			bubble: "#efe6d3",
			bubbleHighlight: "#e7dcc4",
			input: "#fbf8f0",
			code: "#f1ebdd",
			inlineCode: "#ece1ca",
			scrollbar: "#dccfb4",
			scrollbarHover: "#cfc0a1",
			error: "#b3452e",
			success: "#5c7a4a",
			warn: "#a8791e",
			toast: "#3e3526",
			tooltip: "#3e3526"
		}
	},
	{
		id: "dark",
		nameKey: "theme.dark",
		descKey: "theme.dark.desc",
		builtin: true,
		colorScheme: "dark",
		tokens: {},
		preview: {
			base: "#15151b",
			surface: "#1b1b21",
			sidebar: "#1b1b21",
			bubble: "#232329",
			accent: "#5686fe",
			text: "#e6e8ee"
		}
	},
	{
		id: "claude-dark",
		nameKey: "theme.claudeDark",
		descKey: "theme.claudeDark.desc",
		colorScheme: "dark",
		preview: {
			base: "#201f1c",
			surface: "#262521",
			sidebar: "#1b1a17",
			bubble: "#33312c",
			accent: "#d97757",
			text: "#e9e6de"
		},
		palette: {
			base: "#201f1c",
			surface: "#262521",
			surface2: "#2c2b27",
			surface3: "#33322d",
			overlay: "#3a3934",
			module: "#33322d",
			border1: "rgba(255, 255, 255, 0.06)",
			border2: "rgba(255, 255, 255, 0.12)",
			border3: "rgba(255, 255, 255, 0.17)",
			accent: "#d97757",
			accentHover: "#e08b6e",
			text: "#e9e6de",
			textSecondary: "#b8b2a6",
			textTertiary: "#8e887b",
			textOnAccent: "#241a13",
			hover: "rgba(255, 255, 255, 0.05)",
			active: "rgba(255, 255, 255, 0.09)",
			sidebar: "#1b1a17",
			itemActive: "#2c2b27",
			itemHover: "#262521",
			itemAccent: "rgba(217, 119, 87, 0.16)",
			bubble: "#33312c",
			bubbleHighlight: "#3b3933",
			input: "#2c2b27",
			code: "#2c2b27",
			inlineCode: "#383630",
			scrollbar: "#4a4842",
			scrollbarHover: "#5a574f",
			error: "#ef8a70",
			success: "#7fbe8a",
			warn: "#d9a441",
			toast: "#3a3934",
			tooltip: "#3a3934"
		}
	},
	{
		id: "synthwave",
		nameKey: "theme.synthwave",
		descKey: "theme.synthwave.desc",
		colorScheme: "dark",
		preview: {
			base: "#150b2e",
			surface: "#1a0f38",
			sidebar: "#120927",
			bubble: "#2a1b52",
			accent: "#c084fc",
			text: "#ede9fe"
		},
		palette: {
			base: "#150b2e",
			surface: "#1a0f38",
			surface2: "#201346",
			surface3: "#261a54",
			overlay: "#2e2066",
			module: "#261a54",
			border1: "rgba(196, 181, 253, 0.09)",
			border2: "rgba(196, 181, 253, 0.16)",
			border3: "rgba(196, 181, 253, 0.24)",
			accent: "#c084fc",
			accentHover: "#d8b4fe",
			text: "#ede9fe",
			textSecondary: "#b7a8e8",
			textTertiary: "#8578b8",
			textOnAccent: "#1a0f38",
			hover: "rgba(196, 181, 253, 0.08)",
			active: "rgba(196, 181, 253, 0.14)",
			sidebar: "#120927",
			itemActive: "#2a1b52",
			itemHover: "#221445",
			itemAccent: "rgba(192, 132, 252, 0.18)",
			bubble: "#2a1b52",
			bubbleHighlight: "#352368",
			input: "#1a0f38",
			code: "#1a0f38",
			inlineCode: "#2b1b55",
			scrollbar: "#3b2a6e",
			scrollbarHover: "#4a3686",
			error: "#fb7185",
			success: "#34d399",
			warn: "#fbbf24",
			toast: "#2e2066",
			tooltip: "#2e2066"
		}
	},
	{
		id: "graphite",
		nameKey: "theme.graphite",
		descKey: "theme.graphite.desc",
		colorScheme: "dark",
		preview: {
			base: "#0e0e10",
			surface: "#151517",
			sidebar: "#0b0b0d",
			bubble: "#1b1b1e",
			accent: "#e4e4e7",
			text: "#f4f4f5"
		},
		palette: {
			base: "#0e0e10",
			surface: "#151517",
			surface2: "#1b1b1e",
			surface3: "#212124",
			overlay: "#2a2a2e",
			module: "#212124",
			border1: "rgba(255, 255, 255, 0.07)",
			border2: "rgba(255, 255, 255, 0.13)",
			border3: "rgba(255, 255, 255, 0.19)",
			accent: "#e4e4e7",
			accentHover: "#fafafa",
			text: "#f4f4f5",
			textSecondary: "#a1a1aa",
			textTertiary: "#71717a",
			textOnAccent: "#0e0e10",
			hover: "rgba(255, 255, 255, 0.05)",
			active: "rgba(255, 255, 255, 0.09)",
			sidebar: "#0b0b0d",
			itemActive: "#1b1b1e",
			itemHover: "#161618",
			itemAccent: "rgba(228, 228, 231, 0.1)",
			bubble: "#1b1b1e",
			bubbleHighlight: "#232326",
			input: "#151517",
			code: "#151517",
			inlineCode: "#1f1f22",
			scrollbar: "#2e2e33",
			scrollbarHover: "#3f3f46",
			error: "#f87171",
			success: "#4ade80",
			warn: "#facc15",
			toast: "#2a2a2e",
			tooltip: "#2a2a2e"
		}
	},
	{
		id: "tokyo-night",
		nameKey: "theme.tokyoNight",
		descKey: "theme.tokyoNight.desc",
		colorScheme: "dark",
		preview: {
			base: "#1a1b26",
			surface: "#1f2335",
			sidebar: "#16161e",
			bubble: "#2a2f45",
			accent: "#7aa2f7",
			text: "#c0caf5"
		},
		palette: {
			base: "#1a1b26",
			surface: "#1f2335",
			surface2: "#24283b",
			surface3: "#2a2f45",
			overlay: "#31364f",
			module: "#1f2335",
			border1: "rgba(192, 202, 245, 0.08)",
			border2: "rgba(192, 202, 245, 0.15)",
			border3: "rgba(192, 202, 245, 0.22)",
			accent: "#7aa2f7",
			accentHover: "#8fb4f8",
			text: "#c0caf5",
			textSecondary: "#a9b1d6",
			textTertiary: "#565f89",
			textOnAccent: "#1a1b26",
			hover: "rgba(192, 202, 245, 0.07)",
			active: "rgba(192, 202, 245, 0.12)",
			sidebar: "#16161e",
			itemActive: "#2a2f45",
			itemHover: "#232839",
			itemAccent: "rgba(122, 162, 247, 0.16)",
			bubble: "#2a2f45",
			bubbleHighlight: "#313a58",
			input: "#1f2335",
			code: "#1f2335",
			inlineCode: "#272c45",
			scrollbar: "#3b4263",
			scrollbarHover: "#4a5280",
			error: "#f7768e",
			success: "#9ece6a",
			warn: "#e0af68",
			toast: "#31364f",
			tooltip: "#31364f"
		}
	},
	{
		id: "monokai",
		nameKey: "theme.monokai",
		descKey: "theme.monokai.desc",
		colorScheme: "dark",
		preview: {
			base: "#272822",
			surface: "#1e1f1c",
			sidebar: "#1b1c19",
			bubble: "#33342e",
			accent: "#66d9ef",
			text: "#f8f8f2"
		},
		palette: {
			base: "#272822",
			surface: "#1e1f1c",
			surface2: "#2a2b26",
			surface3: "#33342e",
			overlay: "#3c3d36",
			module: "#1e1f1c",
			border1: "rgba(248, 248, 242, 0.07)",
			border2: "rgba(248, 248, 242, 0.13)",
			border3: "rgba(248, 248, 242, 0.19)",
			accent: "#66d9ef",
			accentHover: "#7ee0f2",
			text: "#f8f8f2",
			textSecondary: "#c8c8ba",
			textTertiary: "#7a7a6e",
			textOnAccent: "#1e1f1c",
			hover: "rgba(248, 248, 242, 0.05)",
			active: "rgba(248, 248, 242, 0.09)",
			sidebar: "#1b1c19",
			itemActive: "#33342e",
			itemHover: "#2a2b26",
			itemAccent: "rgba(102, 217, 239, 0.15)",
			bubble: "#33342e",
			bubbleHighlight: "#3c3d36",
			input: "#2a2b26",
			code: "#2a2b26",
			inlineCode: "#31322c",
			scrollbar: "#4a4b42",
			scrollbarHover: "#5c5d52",
			error: "#f92672",
			success: "#a6e22e",
			warn: "#fd971f",
			toast: "#3c3d36",
			tooltip: "#3c3d36"
		}
	},
	{
		id: "gruvbox",
		nameKey: "theme.gruvbox",
		descKey: "theme.gruvbox.desc",
		colorScheme: "dark",
		preview: {
			base: "#282828",
			surface: "#1d2021",
			sidebar: "#1c1e1d",
			bubble: "#3c3a37",
			accent: "#fe8019",
			text: "#ebdbb2"
		},
		palette: {
			base: "#282828",
			surface: "#1d2021",
			surface2: "#32302f",
			surface3: "#3c3a37",
			overlay: "#46423d",
			module: "#282828",
			border1: "rgba(235, 219, 178, 0.08)",
			border2: "rgba(235, 219, 178, 0.14)",
			border3: "rgba(235, 219, 178, 0.2)",
			accent: "#fe8019",
			accentHover: "#ff962e",
			text: "#ebdbb2",
			textSecondary: "#a89984",
			textTertiary: "#7d705a",
			textOnAccent: "#282828",
			hover: "rgba(235, 219, 178, 0.05)",
			active: "rgba(235, 219, 178, 0.09)",
			sidebar: "#1c1e1d",
			itemActive: "#3c3a37",
			itemHover: "#32302f",
			itemAccent: "rgba(254, 128, 25, 0.16)",
			bubble: "#3c3a37",
			bubbleHighlight: "#45413c",
			input: "#32302f",
			code: "#32302f",
			inlineCode: "#3a3834",
			scrollbar: "#504d48",
			scrollbarHover: "#625e57",
			error: "#fb4934",
			success: "#b8bb26",
			warn: "#fabd2f",
			toast: "#3c3a37",
			tooltip: "#3c3a37"
		}
	},
	{
		id: "wallpaper",
		nameKey: "theme.wallpaper",
		descKey: "theme.wallpaper.desc",
		colorScheme: "dark",
		wallpaper: true,
		preview: {
			base: "#10141c",
			surface: "rgba(255, 255, 255, 0.06)",
			sidebar: "rgba(8, 10, 14, 0.5)",
			bubble: "rgba(255, 255, 255, 0.08)",
			accent: "#8ab4ff",
			text: "#eceef2"
		},
		// The wallpaper surface palette: translucent layers over the image,
		// tuned per mode by wallpaperPaletteFor(mode) in wallpaper.ts.
		palette: null
	}
];

/** Look up a catalog entry by id. */
export function catalogOf(id) {
	return CATALOG.find((entry) => entry.id === id);
}

/** The catalog entries for one color scheme, in display order. */
export function catalogByScheme(scheme) {
	return CATALOG.filter((entry) => entry.colorScheme === scheme);
}

/** Materialize every palette-driven catalog entry into its token map. */
export function materializeCatalog() {
	return CATALOG.map((entry) => ({
		...entry,
		tokens: entry.palette === null || entry.palette === undefined ? entry.tokens : tokensOf(entry.palette)
	}));
}
