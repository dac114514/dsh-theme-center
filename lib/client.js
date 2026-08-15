window.__ModuleLoader__.load({
	id: "dsh-theme-center",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __export = (target, all) => {
		  for (var name in all)
		    __defProp(target, name, { get: all[name], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

		// src/client/index.tsx
		var index_exports = {};
		__export(index_exports, {
		  SETTINGS_NS: () => SETTINGS_NS,
		  apply: () => apply,
		  inject: () => inject
		});
		module.exports = __toCommonJS(index_exports);
		var import_client = require("@deepseek-ai/dsh-client-runtime/client");

		// src/shared/theme-file.ts
		var THEME_FILE_FORMAT = "dsh-theme";
		var THEME_FILE_VERSION = 1;
		var THEME_ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
		var MAX_CUSTOM_THEMES = 30;
		var MAX_WALLPAPER_DATA_URL = 25e5;
		var MAX_IMPORT_FILE_BYTES = 4e6;
		var MAX_TOKEN_VALUE_LENGTH = 300;
		var MAX_THEME_NAME_LENGTH = 64;
		var MAX_THEME_DESCRIPTION_LENGTH = 200;
		var SETTINGS_NAMESPACE = "theme-center";
		var FIELD_ACTIVE = "active";
		var FIELD_CUSTOM = "custom";
		var FIELD_WALLPAPER = "wallpaper";
		var BUILTIN_THEME_IDS = [
		  "light",
		  "dark",
		  "claude",
		  "claude-dark",
		  "sakura",
		  "paper",
		  "tokyo-night",
		  "graphite",
		  "monokai",
		  "gruvbox",
		  "wallpaper"
		];
		var BUILTIN_PREFERENCES = ["light", "dark", "system"];
		var WALLPAPER_NAME = "name";
		var WALLPAPER_DATA_URL = "dataUrl";
		var WALLPAPER_MODE = "mode";
		var WALLPAPER_WIDTH = "width";
		var WALLPAPER_HEIGHT = "height";
		var WALLPAPER_ZOOM = "zoom";
		var WALLPAPER_X = "x";
		var WALLPAPER_Y = "y";
		var WALLPAPER_OVERLAY = "overlay";
		var WALLPAPER_SURFACE = "surface";
		var WALLPAPER_MODES = ["light", "dark"];
		var WALLPAPER_DEFAULTS = {
		  [WALLPAPER_NAME]: "",
		  [WALLPAPER_DATA_URL]: "",
		  [WALLPAPER_MODE]: "dark",
		  [WALLPAPER_WIDTH]: 0,
		  [WALLPAPER_HEIGHT]: 0,
		  [WALLPAPER_ZOOM]: 1,
		  [WALLPAPER_X]: 50,
		  [WALLPAPER_Y]: 50,
		  [WALLPAPER_OVERLAY]: 0.45,
		  [WALLPAPER_SURFACE]: 0.65
		};
		var WALLPAPER_ZOOM_MIN = 1;
		var WALLPAPER_ZOOM_MAX = 3;
		var WALLPAPER_SURFACE_MIN = 0.3;
		var WALLPAPER_SURFACE_MAX = 1;
		var WALLPAPER_OVERLAY_MIN = 0;
		var WALLPAPER_OVERLAY_MAX = 0.85;
		function clamp(value, min, max) {
		  return Math.min(max, Math.max(min, value));
		}
		function finiteNumber(value, fallback) {
		  const parsed = Number(value);
		  return Number.isFinite(parsed) ? parsed : fallback;
		}
		function normalizeWallpaper(value) {
		  const raw = value ?? {};
		  const mode = WALLPAPER_MODES.includes(raw.mode) ? raw.mode : WALLPAPER_DEFAULTS[WALLPAPER_MODE];
		  const overlayDefault = mode === "dark" ? 0.45 : 0.35;
		  return {
		    [WALLPAPER_NAME]: typeof raw.name === "string" ? raw.name : WALLPAPER_DEFAULTS[WALLPAPER_NAME],
		    [WALLPAPER_DATA_URL]: typeof raw.dataUrl === "string" ? raw.dataUrl : WALLPAPER_DEFAULTS[WALLPAPER_DATA_URL],
		    [WALLPAPER_MODE]: mode,
		    [WALLPAPER_WIDTH]: finiteNumber(raw.width, WALLPAPER_DEFAULTS[WALLPAPER_WIDTH]),
		    [WALLPAPER_HEIGHT]: finiteNumber(raw.height, WALLPAPER_DEFAULTS[WALLPAPER_HEIGHT]),
		    [WALLPAPER_ZOOM]: clamp(finiteNumber(raw.zoom, WALLPAPER_DEFAULTS[WALLPAPER_ZOOM]), WALLPAPER_ZOOM_MIN, WALLPAPER_ZOOM_MAX),
		    [WALLPAPER_X]: clamp(finiteNumber(raw.x, WALLPAPER_DEFAULTS[WALLPAPER_X]), 0, 100),
		    [WALLPAPER_Y]: clamp(finiteNumber(raw.y, WALLPAPER_DEFAULTS[WALLPAPER_Y]), 0, 100),
		    [WALLPAPER_OVERLAY]: clamp(finiteNumber(raw.overlay, overlayDefault), WALLPAPER_OVERLAY_MIN, WALLPAPER_OVERLAY_MAX),
		    [WALLPAPER_SURFACE]: clamp(finiteNumber(raw.surface, WALLPAPER_DEFAULTS[WALLPAPER_SURFACE]), WALLPAPER_SURFACE_MIN, WALLPAPER_SURFACE_MAX)
		  };
		}
		var WALLPAPER_TOKENS = {
		  image: "--dsh-wallpaper-image",
		  overlay: "--dsh-wallpaper-overlay",
		  sizeWidth: "--dsh-wallpaper-w",
		  sizeHeight: "--dsh-wallpaper-h",
		  positionX: "--dsh-wallpaper-x",
		  positionY: "--dsh-wallpaper-y"
		};
		function isBuiltinPreference(value) {
		  return BUILTIN_PREFERENCES.includes(value);
		}
		function isWallpaperId(value) {
		  return value === "wallpaper";
		}
		function isImageDataUrl(value) {
		  return typeof value === "string" && /^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(value);
		}

		// src/client/catalog.ts
		function tokensOf(palette) {
		  const v = (key, fallbackKey = void 0) => {
		    const value = palette[key] ?? (fallbackKey === void 0 ? void 0 : palette[fallbackKey]);
		    if (value === void 0) throw new Error(`theme palette missing token "${key}"`);
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
		var CATALOG = [
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
		function materializeCatalog() {
		  return CATALOG.map((entry) => ({
		    ...entry,
		    tokens: entry.palette === null || entry.palette === void 0 ? entry.tokens : tokensOf(entry.palette)
		  }));
		}

		// src/client/locales.ts
		var SETTINGS_NS = "settings.theme-center";
		var zh = {
		  "nav": "\u4E3B\u9898",
		  "title": "\u4E3B\u9898",
		  "intro": "\u9009\u62E9\u754C\u9762\u4E3B\u9898\uFF1A\u6D45\u8272\u4E0E\u6DF1\u8272\u5206\u5F00\u5C55\u793A\uFF0C\u70B9\u51FB\u5361\u7247\u5373\u53EF\u5207\u6362\u3002\u4F60\u4E5F\u53EF\u4EE5\u5BFC\u5165\u81EA\u5DF1\u7F16\u5199\u7684 dsh-theme \u4E3B\u9898\u6587\u4EF6\uFF0C\u6216\u4F7F\u7528\u81EA\u5DF1\u7684\u56FE\u7247\u4F5C\u4E3A\u58C1\u7EB8\u3002",
		  "group.light": "\u6D45\u8272",
		  "group.dark": "\u6DF1\u8272",
		  "group.custom": "\u81EA\u5B9A\u4E49",
		  "group.imported": "\u5BFC\u5165\u7684\u4E3B\u9898",
		  "builtin": "\u5185\u7F6E",
		  "custom": "\u81EA\u5B9A\u4E49",
		  "using": "\u4F7F\u7528\u4E2D",
		  "theme.light": "\u539F\u7248\u4EAE",
		  "theme.light.desc": "\u7EAF\u767D \xB7 \u975B\u84DD \xB7 DeepSeek \u539F\u7248",
		  "theme.claude": "Claude \u98CE\u683C",
		  "theme.claude.desc": "\u6696\u7C73 \xB7 \u9676\u571F\u6A59 \xB7 Claude \u7F8E\u5B66",
		  "theme.sakura": "\u6A31\u82B1\u7C89",
		  "theme.sakura.desc": "\u67D4\u7C89 \xB7 \u73AB\u7470 \xB7 \u6625\u65E5\u6D6A\u6F2B",
		  "theme.paper": "\u7EB8\u5F20\u62A4\u773C",
		  "theme.paper.desc": "\u6696\u7EB8 \xB7 \u68D5\u8910 \xB7 \u62A4\u773C\u9605\u8BFB",
		  "theme.dark": "\u539F\u7248\u6697",
		  "theme.dark.desc": "\u70AD\u9ED1 \xB7 \u975B\u84DD \xB7 DeepSeek \u539F\u7248",
		  "theme.claudeDark": "Claude \u6697\u8272",
		  "theme.claudeDark.desc": "\u6696\u70AD \xB7 \u9676\u571F\u6A59 \xB7 Claude \u591C\u95F4",
		  "theme.graphite": "\u77F3\u58A8\u9ED1",
		  "theme.graphite.desc": "\u77F3\u58A8 \xB7 \u6708\u767D \xB7 \u9AD8\u5BF9\u6BD4\u5355\u8272",
		  "theme.tokyoNight": "\u4E1C\u4EAC\u4E4B\u591C",
		  "theme.tokyoNight.desc": "\u6DF1\u84DD \xB7 \u4EAE\u84DD \xB7 \u4E1C\u4EAC\u591C\u8272",
		  "theme.monokai": "Monokai",
		  "theme.monokai.desc": "\u58A8\u7EFF \xB7 \u9752\u7EFF \xB7 \u9AD8\u5BF9\u6BD4\u7ECF\u5178",
		  "theme.gruvbox": "Gruvbox",
		  "theme.gruvbox.desc": "\u6696\u68D5 \xB7 \u7425\u73C0 \xB7 \u590D\u53E4\u6000\u65E7",
		  "theme.wallpaper": "\u81EA\u5B9A\u4E49\u58C1\u7EB8",
		  "theme.wallpaper.desc": "\u81EA\u5B9A\u4E49\u56FE\u7247 \xB7 \u53EF\u8C03\u906E\u7F69 \xB7 \u58C1\u7EB8\u6A21\u5F0F",
		  "wallpaper.set": "\u9009\u62E9\u56FE\u7247",
		  "wallpaper.clear": "\u79FB\u9664\u58C1\u7EB8",
		  "wallpaper.edit": "\u7F16\u8F91\u58C1\u7EB8",
		  "wallpaper.editorTitle": "\u58C1\u7EB8\u8BBE\u7F6E",
		  "wallpaper.close": "\u5173\u95ED",
		  "wallpaper.done": "\u5B8C\u6210",
		  "wallpaper.hint": "\u56FE\u7247\u4F1A\u7B49\u6BD4\u7F29\u653E\u5230 1440px \u5E76\u53E0\u52A0\u53EF\u8BFB\u6027\u906E\u7F69\uFF1B\u5EFA\u8BAE\u4F7F\u7528\u6A2A\u5411\u5927\u56FE\u3002",
		  "wallpaper.none": "\u5C1A\u672A\u8BBE\u7F6E\u58C1\u7EB8\uFF0C\u5F53\u524D\u4F7F\u7528\u9ED8\u8BA4\u6E10\u53D8\u3002",
		  "wallpaper.mode.light": "\u4EAE\u8272\u906E\u7F69",
		  "wallpaper.mode.dark": "\u6697\u8272\u906E\u7F69",
		  "wallpaper.mode": "\u906E\u7F69\u6A21\u5F0F",
		  "wallpaper.zoom": "\u7F29\u653E",
		  "wallpaper.x": "\u6C34\u5E73\u4F4D\u7F6E",
		  "wallpaper.y": "\u5782\u76F4\u4F4D\u7F6E",
		  "wallpaper.overlay": "\u906E\u7F69\u4E0D\u900F\u660E\u5EA6",
		  "wallpaper.surface": "\u9762\u677F\u4E0D\u900F\u660E\u5EA6",
		  "wallpaper.dragHint": "\u62D6\u62FD\u79FB\u52A8 \xB7 \u6EDA\u8F6E\u7F29\u653E",
		  "import.open": "\u5BFC\u5165\u4E3B\u9898",
		  "import.paste": "\u7C98\u8D34\u5BFC\u5165",
		  "import.cancel": "\u6536\u8D77",
		  "import.pasteHint": "\u7C98\u8D34 dsh-theme JSON \u6587\u672C\u540E\u70B9\u51FB\u89E3\u6790\uFF1A",
		  "import.parse": "\u89E3\u6790",
		  "import.placeholder": '{\n  "format": "dsh-theme",\n  "version": 1,\n  "id": "aurora",\n  "name": "Aurora",\n  "colorScheme": "dark",\n  "tokens": {\n    "--dsw-alias-bg-base": "#0d0b1e"\n  }\n}',
		  "import.ok": "\u5BFC\u5165\u6210\u529F\uFF1A\u5DF2\u6DFB\u52A0\u5E76\u5E94\u7528\u300C{name}\u300D\u3002",
		  "import.replaced": "\u5DF2\u66FF\u6362\u540C\u540D\u4E3B\u9898\u300C{name}\u300D\u3002",
		  "import.error": "\u5BFC\u5165\u5931\u8D25\uFF1A{message}",
		  "import.warning": "\u63D0\u793A\uFF1A{message}",
		  "export.label": "\u5BFC\u51FA",
		  "delete.label": "\u5220\u9664",
		  "delete.confirm": "\u786E\u5B9A\u5220\u9664\u4E3B\u9898\u300C{name}\u300D\u5417\uFF1F\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002",
		  "delete.activeFallback": "\u5DF2\u5220\u9664\u300C{name}\u300D\uFF0C\u5DF2\u5207\u56DE\u540C\u8272\u7CFB\u7684\u9ED8\u8BA4\u4E3B\u9898\u3002",
		  "limit.custom": "\u81EA\u5B9A\u4E49\u4E3B\u9898\u5DF2\u8FBE\u4E0A\u9650\uFF0830 \u4E2A\uFF09\uFF0C\u8BF7\u5148\u5220\u9664\u4E00\u4E9B\u3002"
		};
		var en = {
		  "nav": "Themes",
		  "title": "Themes",
		  "intro": "Pick a theme for the interface \u2014 light and dark are separated, click a card to switch. You can also import your own dsh-theme files, or use your own image as a wallpaper.",
		  "group.light": "Light",
		  "group.dark": "Dark",
		  "group.custom": "Custom",
		  "group.imported": "Imported themes",
		  "builtin": "Built-in",
		  "custom": "Custom",
		  "using": "Active",
		  "theme.light": "Original Light",
		  "theme.light.desc": "Pure white \xB7 Indigo \xB7 DeepSeek original",
		  "theme.claude": "Claude Style",
		  "theme.claude.desc": "Warm cream \xB7 Terracotta \xB7 Claude aesthetic",
		  "theme.sakura": "Sakura",
		  "theme.sakura.desc": "Soft pink \xB7 Rose \xB7 Spring blossom",
		  "theme.paper": "Warm Paper",
		  "theme.paper.desc": "Warm paper \xB7 Sepia \xB7 Eye-friendly reading",
		  "theme.dark": "Original Dark",
		  "theme.dark.desc": "Charcoal \xB7 Indigo \xB7 DeepSeek original",
		  "theme.claudeDark": "Claude Dark",
		  "theme.claudeDark.desc": "Warm charcoal \xB7 Terracotta \xB7 Claude night",
		  "theme.graphite": "Graphite",
		  "theme.graphite.desc": "Graphite \xB7 Moon white \xB7 High-contrast monochrome",
		  "theme.tokyoNight": "Tokyo Night",
		  "theme.tokyoNight.desc": "Deep blue \xB7 Bright blue \xB7 Tokyo night",
		  "theme.monokai": "Monokai",
		  "theme.monokai.desc": "Dark olive \xB7 Cyan-green \xB7 Classic high contrast",
		  "theme.gruvbox": "Gruvbox",
		  "theme.gruvbox.desc": "Warm brown \xB7 Amber \xB7 Retro vintage",
		  "theme.wallpaper": "Custom Wallpaper",
		  "theme.wallpaper.desc": "Custom image \xB7 Adjustable tint \xB7 Wallpaper mode",
		  "wallpaper.set": "Choose image",
		  "wallpaper.clear": "Remove",
		  "wallpaper.edit": "Edit wallpaper",
		  "wallpaper.editorTitle": "Wallpaper settings",
		  "wallpaper.close": "Close",
		  "wallpaper.done": "Done",
		  "wallpaper.hint": "The image is scaled to 1440px; drag the canvas or use the sliders to adjust crop and opacity.",
		  "wallpaper.none": "No wallpaper set \u2014 a default gradient is used.",
		  "wallpaper.mode.light": "Light tint",
		  "wallpaper.mode.dark": "Dark tint",
		  "wallpaper.mode": "Tint mode",
		  "wallpaper.zoom": "Zoom",
		  "wallpaper.x": "Horizontal position",
		  "wallpaper.y": "Vertical position",
		  "wallpaper.overlay": "Overlay opacity",
		  "wallpaper.surface": "Surface opacity",
		  "wallpaper.dragHint": "Drag to pan \xB7 Wheel to zoom",
		  "import.open": "Import theme",
		  "import.paste": "Paste import",
		  "import.cancel": "Collapse",
		  "import.pasteHint": "Paste dsh-theme JSON and parse it:",
		  "import.parse": "Parse",
		  "import.placeholder": '{\n  "format": "dsh-theme",\n  "version": 1,\n  "id": "aurora",\n  "name": "Aurora",\n  "colorScheme": "dark",\n  "tokens": {\n    "--dsw-alias-bg-base": "#0d0b1e"\n  }\n}',
		  "import.ok": "Imported and applied: \u201C{name}\u201D.",
		  "import.replaced": "Replaced the theme with the same id: \u201C{name}\u201D.",
		  "import.error": "Import failed: {message}",
		  "import.warning": "Note: {message}",
		  "export.label": "Export",
		  "delete.label": "Delete",
		  "delete.confirm": "Delete theme \u201C{name}\u201D? This cannot be undone.",
		  "delete.activeFallback": "Deleted \u201C{name}\u201D, switched back to the default theme of the same scheme.",
		  "limit.custom": "Custom theme limit reached (30). Delete some first."
		};

		// src/client/parser.ts
		var ThemeDef = class {
		  constructor(init) {
		    this.format = THEME_FILE_FORMAT;
		    this.version = THEME_FILE_VERSION;
		    this.id = init.id;
		    this.name = init.name;
		    this.description = init.description ?? "";
		    this.colorScheme = init.colorScheme;
		    this.tokens = { ...init.tokens };
		    this.wallpaper = init.wallpaper ?? "";
		    this.source = init.source ?? "import";
		  }
		};
		var ParseResult = class {
		  constructor(theme, warnings) {
		    this.theme = theme;
		    this.warnings = warnings;
		  }
		};
		function parseThemeFile(text, takenIds, locale = "zh") {
		  const t = (zh2, en2) => locale === "zh" ? zh2 : en2;
		  const errors = [];
		  const warnings = [];
		  if (typeof text !== "string") {
		    return new ParseResult(null, [t("\u8F93\u5165\u5185\u5BB9\u4E0D\u662F\u6587\u672C\u3002", "Input is not text.")]);
		  }
		  if (text.length > MAX_IMPORT_FILE_BYTES) {
		    return new ParseResult(null, [t(`\u6587\u4EF6\u8FC7\u5927\uFF08\u4E0A\u9650 ${Math.round(MAX_IMPORT_FILE_BYTES / 1e6)} MB\uFF09\u3002`, `File too large (limit ${Math.round(MAX_IMPORT_FILE_BYTES / 1e6)} MB).`)]);
		  }
		  let raw;
		  try {
		    raw = JSON.parse(text);
		  } catch (error) {
		    return new ParseResult(null, [t(`\u4E0D\u662F\u6709\u6548\u7684 JSON\uFF1A${error.message}`, `Not valid JSON: ${error.message}`)]);
		  }
		  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
		    return new ParseResult(null, [t("\u4E3B\u9898\u6587\u4EF6\u6839\u8282\u70B9\u5FC5\u987B\u662F JSON \u5BF9\u8C61\u3002", "The theme file root must be a JSON object.")]);
		  }
		  if (raw.format !== THEME_FILE_FORMAT) {
		    return new ParseResult(null, [t(`\u7F3A\u5C11 format \u5B57\u6BB5\uFF08\u5E94\u4E3A "${THEME_FILE_FORMAT}"\uFF09\u3002`, `Missing format field (expected "${THEME_FILE_FORMAT}").`)]);
		  }
		  if (raw.version !== THEME_FILE_VERSION) {
		    return new ParseResult(null, [t(`\u4E0D\u652F\u6301\u7684\u7248\u672C\uFF1A${JSON.stringify(raw.version)}\uFF08\u5F53\u524D\u652F\u6301 ${THEME_FILE_VERSION}\uFF09\u3002`, `Unsupported version: ${JSON.stringify(raw.version)} (current support: ${THEME_FILE_VERSION}).`)]);
		  }
		  if (typeof raw.name !== "string" || raw.name.trim().length === 0) {
		    return new ParseResult(null, [t("\u7F3A\u5C11 name \u5B57\u6BB5\uFF08\u4E3B\u9898\u540D\u79F0\uFF09\u3002", "Missing name field (theme name).")]);
		  }
		  const name = raw.name.trim();
		  if (name.length > MAX_THEME_NAME_LENGTH) {
		    return new ParseResult(null, [t(`\u4E3B\u9898\u540D\u79F0\u8FC7\u957F\uFF08\u6700\u591A ${MAX_THEME_NAME_LENGTH} \u4E2A\u5B57\u7B26\uFF09\u3002`, `Theme name too long (max ${MAX_THEME_NAME_LENGTH} characters).`)]);
		  }
		  let id;
		  if (raw.id !== void 0 && raw.id !== null && String(raw.id).trim() !== "") {
		    const candidate = String(raw.id).trim();
		    if (!THEME_ID_PATTERN.test(candidate)) {
		      return new ParseResult(null, [
		        t(
		          `id "${candidate}" \u4E0D\u5408\u6CD5\uFF1A\u9700\u5C0F\u5199\u5B57\u6BCD\u5F00\u5934\uFF0C\u4EC5\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\u4E0E\u8FDE\u5B57\u7B26\uFF08\u6700\u591A 64 \u4F4D\uFF09\u3002`,
		          `id "${candidate}" is invalid: must start with a lowercase letter and contain only lowercase letters, digits and hyphens (max 64).`
		        )
		      ]);
		    }
		    id = candidate;
		  } else {
		    id = slugFromName(name);
		    warnings.push(t(`\u672A\u63D0\u4F9B id\uFF0C\u5DF2\u6839\u636E\u540D\u79F0\u751F\u6210 "${id}"\u3002`, `No id provided; derived "${id}" from the name.`));
		  }
		  if (takenIds.includes(id)) {
		    return new ParseResult(null, [
		      t(`\u4E3B\u9898 id "${id}" \u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u4FEE\u6539 id \u6216\u540D\u79F0\u540E\u91CD\u8BD5\u3002`, `Theme id "${id}" is already taken; change the id or name and try again.`)
		    ]);
		  }
		  if (raw.colorScheme !== "light" && raw.colorScheme !== "dark") {
		    return new ParseResult(null, [t('colorScheme \u5FC5\u987B\u662F "light" \u6216 "dark"\u3002', 'colorScheme must be "light" or "dark".')]);
		  }
		  const colorScheme = raw.colorScheme;
		  const description = typeof raw.description === "string" ? raw.description.slice(0, MAX_THEME_DESCRIPTION_LENGTH) : "";
		  const tokens = {};
		  if (raw.tokens !== void 0 && raw.tokens !== null) {
		    if (typeof raw.tokens !== "object" || Array.isArray(raw.tokens)) {
		      return new ParseResult(null, [t("tokens \u5FC5\u987B\u662F\u5BF9\u8C61\uFF08CSS \u53D8\u91CF\u540D\u5230\u503C\u7684\u6620\u5C04\uFF09\u3002", "tokens must be an object (CSS variable name to value).")]);
		    }
		    for (const [key, value] of Object.entries(raw.tokens)) {
		      if (!/^--[a-z0-9-]+$/i.test(key)) {
		        warnings.push(t(`\u5DF2\u5FFD\u7565\u4E0D\u5408\u6CD5\u7684\u53D8\u91CF\u540D "${key}"\uFF08\u9700\u4EE5 -- \u5F00\u5934\uFF09\u3002`, `Ignored invalid variable name "${key}" (must start with --).`));
		        continue;
		      }
		      if (typeof value !== "string") {
		        warnings.push(t(`\u5DF2\u5FFD\u7565\u53D8\u91CF ${key}\uFF1A\u503C\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u3002`, `Ignored variable ${key}: value must be a string.`));
		        continue;
		      }
		      if (value.length > MAX_TOKEN_VALUE_LENGTH) {
		        warnings.push(t(`\u5DF2\u5FFD\u7565\u53D8\u91CF ${key}\uFF1A\u503C\u8D85\u8FC7 ${MAX_TOKEN_VALUE_LENGTH} \u5B57\u7B26\u3002`, `Ignored variable ${key}: value exceeds ${MAX_TOKEN_VALUE_LENGTH} characters.`));
		        continue;
		      }
		      tokens[key] = value;
		    }
		  }
		  let wallpaper = "";
		  if (raw.wallpaper !== void 0 && raw.wallpaper !== null && raw.wallpaper !== "") {
		    if (typeof raw.wallpaper !== "string" || !isImageDataUrl(raw.wallpaper)) {
		      return new ParseResult(null, [t("wallpaper \u5FC5\u987B\u662F\u56FE\u7247\u7684 data URL\uFF08data:image/...;base64,...\uFF09\u3002", "wallpaper must be an image data URL (data:image/...;base64,...).")]);
		    }
		    if (raw.wallpaper.length > MAX_WALLPAPER_DATA_URL) {
		      return new ParseResult(null, [t("\u58C1\u7EB8\u56FE\u7247\u8FC7\u5927\uFF08data URL \u4E0A\u9650 2.5 MB\uFF09\u3002", "Wallpaper image too large (data URL limit 2.5 MB).")]);
		    }
		    wallpaper = raw.wallpaper;
		  }
		  const known = /* @__PURE__ */ new Set(["format", "version", "id", "name", "description", "colorScheme", "tokens", "wallpaper"]);
		  for (const key of Object.keys(raw)) {
		    if (!known.has(key)) warnings.push(t(`\u5DF2\u5FFD\u7565\u672A\u77E5\u5B57\u6BB5 "${key}"\u3002`, `Ignored unknown field "${key}".`));
		  }
		  return new ParseResult(new ThemeDef({ id, name, description, colorScheme, tokens, wallpaper }), warnings);
		}
		function serializeTheme(theme) {
		  const document2 = {
		    format: THEME_FILE_FORMAT,
		    version: THEME_FILE_VERSION,
		    id: theme.id,
		    name: theme.name,
		    description: theme.description ?? "",
		    colorScheme: theme.colorScheme,
		    tokens: theme.tokens ?? {},
		    ...theme.wallpaper ? { wallpaper: theme.wallpaper } : {}
		  };
		  return JSON.stringify(document2, null, 2);
		}
		function downloadTheme(theme) {
		  const blob = new Blob([serializeTheme(theme)], { type: "application/json" });
		  const url = URL.createObjectURL(blob);
		  const anchor = document.createElement("a");
		  anchor.href = url;
		  anchor.download = `${theme.id}.dsh-theme.json`;
		  document.body.append(anchor);
		  anchor.click();
		  anchor.remove();
		  URL.revokeObjectURL(url);
		}
		function slugFromName(name) {
		  const slug = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "").replace(/[^\x00-\x7f]/g, "").slice(0, 60).replace(/-+$/g, "");
		  const withStart = /^[a-z]/.test(slug) ? slug : `t-${slug}`;
		  return withStart.replace(/-+$/g, "");
		}

		// src/client/styles.ts
		var PLUGIN_CSS_TAG = "dsh-theme-center/styles.css";
		var PLUGIN_CSS = `
		/* \u2500\u2500 wallpaper surface \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
		body[data-dsh-wallpaper]::before {
			content: "";
			position: fixed;
			inset: 0;
			z-index: -1;
			pointer-events: none;
			transform: translateZ(0);
			will-change: transform;
			background-image: var(--dsh-wallpaper-image, none);
			background-size: var(--dsh-wallpaper-w, cover) var(--dsh-wallpaper-h, cover);
			background-position: var(--dsh-wallpaper-x, 50%) var(--dsh-wallpaper-y, 50%);
			background-repeat: no-repeat;
		}
		body[data-dsh-wallpaper]::after {
			content: "";
			position: fixed;
			inset: 0;
			z-index: -1;
			pointer-events: none;
			transform: translateZ(0);
			background: var(--dsh-wallpaper-overlay, transparent);
		}

		/* \u2500\u2500 gallery section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
		.dsh-tc-section {
			display: flex;
			flex-direction: column;
			gap: 20px;
			max-width: 860px;
		}
		.dsh-tc-heading {
			margin: 0;
			color: var(--dsw-alias-label-primary);
			font-size: 18px;
			font-weight: 600;
			line-height: 26px;
		}
		.dsh-tc-intro {
			margin: 4px 0 0;
			color: var(--dsw-alias-label-secondary);
			font-size: 13px;
			line-height: 20px;
		}
		.dsh-tc-toolbar {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 8px;
		}
		.dsh-tc-button {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			border: 1px solid var(--dsw-alias-border-l2);
			background: var(--dsw-alias-bg-layer-1);
			color: var(--dsw-alias-label-primary);
			font: inherit;
			font-size: 13px;
			line-height: 20px;
			border-radius: 8px;
			padding: 5px 12px;
			cursor: pointer;
			transition: background var(--ds-transition-duration) var(--ds-ease-in-out);
		}
		.dsh-tc-button:hover:not(:disabled) {
			background: var(--dsw-alias-interactive-bg-hover);
		}
		.dsh-tc-button:disabled {
			opacity: 0.55;
			cursor: default;
		}
		.dsh-tc-button-primary {
			border-color: transparent;
			background: var(--dsw-alias-button-primary-fill);
			color: var(--dsw-alias-label-primary-foreground);
		}
		.dsh-tc-button-primary:hover:not(:disabled) {
			background: var(--dsw-alias-button-primary-hover);
		}
		.dsh-tc-button[data-active="true"] {
			border-color: var(--dsw-alias-brand-primary);
			background: var(--dsw-alias-interactive-bg-hover-accent);
			color: var(--dsw-alias-label-primary);
		}
		.dsh-tc-system {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			border: 1px solid var(--dsw-alias-border-l2);
			background: transparent;
			color: var(--dsw-alias-label-secondary);
			font: inherit;
			font-size: 13px;
			line-height: 20px;
			border-radius: 999px;
			padding: 5px 14px;
			cursor: pointer;
			transition: background var(--ds-transition-duration) var(--ds-ease-in-out);
		}
		.dsh-tc-system:hover:not(:disabled) {
			background: var(--dsw-alias-interactive-bg-hover);
		}
		.dsh-tc-system[data-active="true"] {
			border-color: var(--dsw-alias-brand-primary);
			background: var(--dsw-alias-interactive-bg-hover-accent);
			color: var(--dsw-alias-label-primary);
		}
		.dsh-tc-group {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		.dsh-tc-group-title {
			margin: 0;
			display: flex;
			align-items: center;
			gap: 8px;
			color: var(--dsw-alias-label-primary);
			font-size: 14px;
			font-weight: 600;
			line-height: 20px;
		}
		.dsh-tc-group-title::after {
			content: "";
			flex: 1;
			height: 1px;
			background: var(--dsw-alias-border-l1);
		}
		.dsh-tc-group-sub {
			margin: 4px 0 0;
			color: var(--dsw-alias-label-secondary);
			font-size: 12px;
			font-weight: 600;
			line-height: 18px;
			letter-spacing: 0.03em;
			text-transform: uppercase;
		}
		.dsh-tc-grid {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 12px;
		}
		.dsh-tc-card {
			display: flex;
			flex-direction: column;
			gap: 8px;
			border: 1px solid var(--dsw-alias-border-l2);
			border-radius: 14px;
			background: var(--dsw-alias-bg-layer-1);
			padding: 10px;
			cursor: pointer;
			text-align: left;
			font: inherit;
			color: inherit;
			transition: border-color var(--ds-transition-duration) var(--ds-ease-in-out),
				background var(--ds-transition-duration) var(--ds-ease-in-out);
		}
		.dsh-tc-card:hover {
			background: var(--dsw-alias-interactive-bg-hover-solid);
			border-color: var(--dsw-alias-border-l3);
		}
		.dsh-tc-card[data-selected="true"] {
			border-color: var(--dsw-alias-brand-primary);
			box-shadow: 0 0 0 1px var(--dsw-alias-brand-primary);
		}
		.dsh-tc-preview {
			position: relative;
			overflow: hidden;
			border-radius: 8px;
			height: 96px;
			background-color: #f0f0f0;
			border: 1px solid var(--dsw-alias-border-l1);
		}
		.dsh-tc-preview-img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: left top;
		}
		.dsh-tc-meta {
			display: flex;
			align-items: center;
			gap: 6px;
			min-width: 0;
		}
		.dsh-tc-name {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--dsw-alias-label-primary);
			font-size: 13px;
			font-weight: 500;
			line-height: 20px;
		}
		.dsh-tc-badge {
			flex: none;
			display: inline-flex;
			align-items: center;
			gap: 2px;
			border-radius: 999px;
			background: var(--dsw-alias-bg-module-platform);
			color: var(--dsw-alias-label-secondary);
			padding: 1px 8px;
			font-size: 11px;
			line-height: 17px;
		}
		.dsh-tc-badge-custom {
			background: var(--dsw-alias-interactive-bg-hover-accent);
			color: var(--dsw-alias-brand-primary);
		}
		.dsh-tc-desc {
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--dsw-alias-label-tertiary);
			font-size: 12px;
			line-height: 18px;
		}
		.dsh-tc-card-actions {
			display: flex;
			gap: 6px;
		}
		.dsh-tc-icon-button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border: none;
			background: transparent;
			color: var(--dsw-alias-label-tertiary);
			padding: 4px;
			border-radius: 6px;
			cursor: pointer;
			font: inherit;
		}
		.dsh-tc-icon-button:hover {
			background: var(--dsw-alias-interactive-bg-hover);
			color: var(--dsw-alias-label-primary);
		}
		.dsh-tc-icon-button-danger:hover {
			background: var(--dsw-alias-interactive-bg-hover-danger);
			color: var(--dsw-alias-state-error-primary);
		}
		.dsh-tc-toolbar-spacer { flex: 1; }
		.dsh-tc-import {
			display: flex;
			flex-direction: column;
			gap: 8px;
			border: 1px solid var(--dsw-alias-border-l1);
			border-radius: 12px;
			background: var(--dsw-alias-bg-layer-2);
			padding: 12px 14px;
		}
		.dsh-tc-import-textarea {
			resize: vertical;
			min-height: 96px;
			border: 1px solid var(--dsw-alias-border-l2);
			border-radius: 8px;
			background: var(--dsw-alias-bg-layer-1);
			color: var(--dsw-alias-label-primary);
			font: inherit;
			font-family: var(--ds-font-family-code);
			font-size: 12px;
			line-height: 18px;
			padding: 8px 10px;
		}
		.dsh-tc-import-textarea:focus-visible {
			border-color: var(--dsw-alias-brand-primary);
			outline: none;
		}
		.dsh-tc-feedback {
			margin: 0;
			font-size: 12px;
			line-height: 18px;
		}
		.dsh-tc-feedback-ok { color: var(--dsw-alias-state-success-primary); }
		.dsh-tc-feedback-error { color: var(--dsw-alias-state-error-primary); }

		/* \u2500\u2500 wallpaper editor \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
		.dsh-tc-wallpaper-row {
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.dsh-tc-wallpaper-thumb {
			flex: none;
			width: 96px;
			height: 54px;
			border-radius: 8px;
			border: 1px solid var(--dsw-alias-border-l2);
			background-color: #10141c;
		}
		.dsh-tc-wallpaper-info {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: 2px;
		}
		.dsh-tc-wallpaper-name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--dsw-alias-label-primary);
			font-size: 13px;
			line-height: 20px;
		}
		.dsh-tc-wallpaper-hint {
			color: var(--dsw-alias-label-tertiary);
			font-size: 12px;
			line-height: 18px;
		}
		.dsh-tc-editor {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		.dsh-tc-editor-preview {
			position: relative;
			overflow: hidden;
			border-radius: 10px;
			border: 1px solid var(--dsw-alias-border-l2);
			height: 150px;
			cursor: grab;
			touch-action: none;
			background-color: #10141c;
		}
		.dsh-tc-editor-preview.dsh-tc-dragging {
			cursor: grabbing;
		}
		.dsh-tc-editor-preview::after {
			content: "";
			position: absolute;
			inset: 0;
			pointer-events: none;
			box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1);
			border-radius: 10px;
		}
		.dsh-tc-editor-hint {
			position: absolute;
			left: 10px;
			bottom: 8px;
			margin: 0;
			color: rgba(255, 255, 255, 0.75);
			background: rgba(8, 10, 14, 0.45);
			border-radius: 6px;
			padding: 2px 8px;
			font-size: 11px;
			line-height: 17px;
			pointer-events: none;
		}

		/* \u2500\u2500 wallpaper dialog (second-level window) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
		.dsh-tc-wp-modal {
			width: min(680px, calc(100vw - 48px));
		}
		.dsh-tc-wp-body {
			display: flex;
			flex-direction: column;
			gap: 14px;
		}
		.dsh-tc-wp-preview {
			height: 220px;
		}
		/* The dashed frame marking the actual display area on the banner preview:
		   everything outside it is dimmed, so "inside the frame" == on screen. */
		.dsh-tc-wp-frame {
			position: absolute;
			z-index: 1;
			border: 1.5px dashed rgba(255, 255, 255, 0.95);
			border-radius: 2px;
			box-shadow:
				0 0 0 9999px rgba(8, 10, 14, 0.34),
				inset 0 0 0 1px rgba(8, 10, 14, 0.6);
			pointer-events: none;
		}
		.dsh-tc-wp-controls {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		.dsh-tc-wp-sliders {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 8px 16px;
		}
		@media (max-width: 560px) {
			.dsh-tc-wp-sliders {
				grid-template-columns: 1fr;
			}
		}
		.dsh-tc-wp-field {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
		.dsh-tc-wp-field-label {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			gap: 8px;
			color: var(--dsw-alias-label-secondary);
			font-size: 12px;
			line-height: 18px;
		}
		.dsh-tc-wp-field-value {
			color: var(--dsw-alias-label-primary);
			font-variant-numeric: tabular-nums;
		}

		/* Custom range sliders: thin rounded track with a filled progress segment
		   (the fill is painted by an inline linear-gradient on the track) and a
		   pill thumb with a focus ring. */
		.dsh-tc-wp-field input[type="range"] {
			-webkit-appearance: none;
			appearance: none;
			width: 100%;
			height: 18px;
			margin: 0;
			background: transparent;
			cursor: pointer;
		}
		.dsh-tc-wp-field input[type="range"]::-webkit-slider-runnable-track {
			height: 4px;
			border-radius: 999px;
			background: var(--dsh-tc-wp-track, var(--dsw-alias-border-l2));
		}
		.dsh-tc-wp-field input[type="range"]::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 14px;
			height: 14px;
			margin-top: -5px;
			border-radius: 999px;
			background: var(--dsw-alias-label-primary);
			border: 2px solid var(--dsw-alias-bg-overlay);
			box-shadow: 0 0 0 1px var(--dsw-alias-border-l2);
			transition: box-shadow var(--ds-transition-duration) var(--ds-ease-in-out);
		}
		.dsh-tc-wp-field input[type="range"]:hover::-webkit-slider-thumb,
		.dsh-tc-wp-field input[type="range"]:focus-visible::-webkit-slider-thumb {
			box-shadow: 0 0 0 2px var(--dsw-alias-brand-primary);
		}
		.dsh-tc-wp-field input[type="range"]::-moz-range-track {
			height: 4px;
			border-radius: 999px;
			background: var(--dsh-tc-wp-track, var(--dsw-alias-border-l2));
		}
		.dsh-tc-wp-field input[type="range"]::-moz-range-thumb {
			width: 10px;
			height: 10px;
			border-radius: 999px;
			background: var(--dsw-alias-label-primary);
			border: 2px solid var(--dsw-alias-bg-overlay);
			box-shadow: 0 0 0 1px var(--dsw-alias-border-l2);
		}
		.dsh-tc-wp-field input[type="range"]:focus-visible {
			outline: none;
		}

		/* Tint-mode segmented control. */
		.dsh-tc-wp-mode {
			display: flex;
			align-items: center;
			gap: 10px;
		}
		.dsh-tc-wp-mode-label {
			color: var(--dsw-alias-label-secondary);
			font-size: 12px;
			line-height: 18px;
		}
		.dsh-tc-wp-segmented {
			display: inline-flex;
			gap: 2px;
			padding: 2px;
			border: 1px solid var(--dsw-alias-border-l2);
			border-radius: 8px;
			background: var(--dsw-alias-bg-module-platform);
		}
		.dsh-tc-wp-segmented button {
			border: none;
			background: transparent;
			color: var(--dsw-alias-label-secondary);
			font: inherit;
			font-size: 12px;
			line-height: 20px;
			padding: 2px 14px;
			border-radius: 6px;
			cursor: pointer;
			transition: background var(--ds-transition-duration) var(--ds-ease-in-out),
				color var(--ds-transition-duration) var(--ds-ease-in-out);
		}
		.dsh-tc-wp-segmented button:hover {
			color: var(--dsw-alias-label-primary);
		}
		.dsh-tc-wp-segmented button[data-active="true"] {
			background: var(--dsw-alias-bg-layer-3);
			color: var(--dsw-alias-label-primary);
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
		}

		/* Dialog footer actions. */
		.dsh-tc-wp-footer {
			display: flex;
			align-items: center;
			gap: 8px;
			width: 100%;
		}
		.dsh-tc-button-danger {
			border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, transparent);
			color: var(--dsw-alias-state-error-primary);
		}
		.dsh-tc-button-danger:hover:not(:disabled) {
			background: var(--dsw-alias-interactive-bg-hover-danger);
		}
		`;
		function injectStyles() {
		  if (typeof document === "undefined") return;
		  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(PLUGIN_CSS_TAG)}]`) !== null) return;
		  const tag = document.createElement("style");
		  tag.dataset.plugin = "dsh-theme-center";
		  tag.dataset.pluginCss = PLUGIN_CSS_TAG;
		  tag.textContent = PLUGIN_CSS;
		  document.head.appendChild(tag);
		}

		// src/client/ThemeGallerySection.tsx
		var import_react2 = require("react");
		var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

		// src/client/wallpaper.ts
		var WALLPAPER_MAX_EDGE = 1440;
		var WALLPAPER_JPEG_QUALITY = 0.72;
		var WALLPAPER_PLACEHOLDER_IMAGE = "data:image/svg+xml;base64," + btoa(
		  '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b1e5e"/><stop offset="0.55" stop-color="#1b3a6b"/><stop offset="1" stop-color="#0f2027"/></linearGradient></defs><rect width="1440" height="810" fill="url(#g)"/><circle cx="1120" cy="200" r="120" fill="#f5e9ff" opacity="0.85"/><circle cx="1030" cy="172" r="55" fill="#ffffff" opacity="0.5"/><path d="M0 580 Q 360 500 720 580 T 1440 580 L 1440 810 L 0 810 Z" fill="#0c1420" opacity="0.55"/></svg>'
		);
		function coverSizeFor(boxW, boxH, wallpaper) {
		  const imgW = Number(wallpaper.width) > 0 ? Number(wallpaper.width) : 16;
		  const imgH = Number(wallpaper.height) > 0 ? Number(wallpaper.height) : 9;
		  const zoom = clamp(Number(wallpaper.zoom) || 1, 1, 3);
		  const scale = Math.max(boxW / imgW, boxH / imgH) * zoom;
		  return {
		    width: Math.max(1, Math.round(imgW * scale)),
		    height: Math.max(1, Math.round(imgH * scale))
		  };
		}
		function buildWallpaperTheme(value) {
		  const wallpaper = normalizeWallpaper(value);
		  const dark = wallpaper.mode === "dark";
		  const surface = clamp(Number(wallpaper.surface) || 0.65, 0.3, 1);
		  const overlay = clamp(Number(wallpaper.overlay) ?? (dark ? 0.45 : 0.35), 0, 0.85);
		  const image = wallpaper.dataUrl ? `url("${wallpaper.dataUrl}")` : `url("${WALLPAPER_PLACEHOLDER_IMAGE}")`;
		  const surfaceColor = (r, g, b) => `rgba(${r}, ${g}, ${b}, ${surface.toFixed(3)})`;
		  const overlayColor = (r, g, b) => `rgba(${r}, ${g}, ${b}, ${overlay.toFixed(3)})`;
		  return {
		    id: "wallpaper",
		    name: wallpaper.name || "wallpaper",
		    colorScheme: wallpaper.mode,
		    wallpaper: true,
		    tokens: {
		      // Surfaces turn translucent so the image shows through; text and
		      // accents stay solid for readability. The user controls surface
		      // translucency and overlay strength.
		      "--dsw-alias-bg-base": dark ? surfaceColor(10, 12, 16) : surfaceColor(250, 251, 253),
		      "--dsw-alias-bg-layer-1": dark ? surfaceColor(16, 19, 26) : surfaceColor(255, 255, 255),
		      "--dsw-alias-bg-layer-2": dark ? surfaceColor(22, 26, 35) : surfaceColor(255, 255, 255),
		      "--dsw-alias-bg-layer-3": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
		      "--dsw-alias-bg-overlay": dark ? overlayColor(12, 15, 22) : overlayColor(235, 238, 244),
		      "--dsw-alias-bg-module-platform": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
		      "--dsw-alias-border-l1": dark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.07)",
		      "--dsw-alias-border-l2": dark ? "rgba(255, 255, 255, 0.13)" : "rgba(15, 23, 42, 0.13)",
		      "--dsw-alias-border-l3": dark ? "rgba(255, 255, 255, 0.18)" : "rgba(15, 23, 42, 0.18)",
		      "--dsw-alias-brand-primary": dark ? "#8ab4ff" : "#3b6fe0",
		      "--dsw-alias-brand-text": dark ? "#8ab4ff" : "#3b6fe0",
		      "--dsw-alias-button-primary-fill": dark ? "#5b8def" : "#3b6fe0",
		      "--dsw-alias-button-primary-hover": dark ? "#7aa6ff" : "#2f5ecb",
		      "--dsw-alias-button-info-fill": dark ? "#5b8def" : "#3b6fe0",
		      "--dsw-alias-button-info-hover": dark ? "#7aa6ff" : "#2f5ecb",
		      "--dsw-alias-button-elevated-fill": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
		      "--dsw-alias-button-floating-fill": dark ? surfaceColor(22, 26, 35) : surfaceColor(255, 255, 255),
		      "--dsw-alias-button-floating-hover": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
		      "--dsw-alias-button-primary-dimmed": dark ? "rgba(91, 141, 239, 0.22)" : "rgba(59, 111, 224, 0.16)",
		      "--dsw-alias-interactive-bg-hover": dark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.06)",
		      "--dsw-alias-interactive-bg-active": dark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.11)",
		      "--dsw-alias-label-primary": dark ? "#eceef2" : "#161a23",
		      "--dsw-alias-label-secondary": dark ? "#a7adb8" : "#5c6470",
		      "--dsw-alias-label-tertiary": dark ? "#6e7684" : "#8b93a1",
		      "--dsw-alias-label-caption": dark ? "#6e7684" : "#8b93a1",
		      "--dsw-alias-label-primary-foreground": dark ? "#0d1017" : "#ffffff",
		      "--dsw-alias-markdown-code-block": dark ? "rgba(0, 0, 0, 0.28)" : "rgba(15, 23, 42, 0.06)",
		      "--dsw-alias-markdown-inline-code": dark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)",
		      "--dsw-alias-scrollbar-bg-l2": dark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.14)",
		      "--dsw-alias-scrollbar-hover-l2": dark ? "rgba(255, 255, 255, 0.22)" : "rgba(15, 23, 42, 0.22)",
		      "--dsw-alias-state-error-primary": dark ? "#ff8a80" : "#d5382f",
		      "--dsw-alias-state-success-primary": dark ? "#69db7c" : "#1d9e54",
		      "--dsw-alias-state-warn-primary": dark ? "#ffd54f" : "#c98a1b",
		      "--dsw-alias-toast-bg": dark ? "rgba(20, 24, 32, 0.92)" : "rgba(22, 26, 35, 0.92)",
		      "--dsw-alias-tooltip-bg": dark ? "rgba(20, 24, 32, 0.92)" : "rgba(22, 26, 35, 0.92)",
		      "--dsw-specific-bubble": dark ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.55)",
		      "--dsw-specific-bubble-highlight": dark ? "rgba(255, 255, 255, 0.13)" : "rgba(255, 255, 255, 0.7)",
		      "--dsw-specific-input-major": dark ? surfaceColor(16, 19, 26) : surfaceColor(255, 255, 255),
		      "--dsw-specific-menu": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
		      "--dsw-specific-sidebar-fill": dark ? surfaceColor(8, 10, 14) : surfaceColor(235, 238, 244),
		      "--dsw-specific-sidebar-nav-item-active": dark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.07)",
		      "--dsw-specific-sidebar-nav-item-hover": dark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
		      "--dsw-specific-sidebar-nav-item-active-accent": dark ? "rgba(138, 180, 255, 0.2)" : "rgba(59, 111, 224, 0.14)",
		      [WALLPAPER_TOKENS.image]: image,
		      [WALLPAPER_TOKENS.overlay]: overlayColor(8, 10, 14)
		    }
		  };
		}
		function processWallpaperFile(file) {
		  return new Promise((resolve, reject) => {
		    if (!file || !/^image\//.test(file.type)) {
		      reject(new Error("\u8BF7\u9009\u62E9\u56FE\u7247\u6587\u4EF6\u3002 / Please choose an image file."));
		      return;
		    }
		    const reader = new FileReader();
		    reader.onerror = () => reject(new Error("\u65E0\u6CD5\u8BFB\u53D6\u6587\u4EF6\u3002 / Could not read the file."));
		    reader.onload = () => {
		      const image = new Image();
		      image.onerror = () => reject(new Error("\u65E0\u6CD5\u89E3\u7801\u56FE\u7247\u3002 / Could not decode the image."));
		      image.onload = () => {
		        try {
		          const scale = Math.min(1, WALLPAPER_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
		          const width = Math.max(1, Math.round(image.naturalWidth * scale));
		          const height = Math.max(1, Math.round(image.naturalHeight * scale));
		          const canvas = document.createElement("canvas");
		          canvas.width = width;
		          canvas.height = height;
		          const context = canvas.getContext("2d");
		          context.drawImage(image, 0, 0, width, height);
		          const flattened = document.createElement("canvas");
		          flattened.width = width;
		          flattened.height = height;
		          const flat = flattened.getContext("2d");
		          flat.fillStyle = "#10141c";
		          flat.fillRect(0, 0, width, height);
		          flat.drawImage(canvas, 0, 0);
		          resolve({
		            dataUrl: flattened.toDataURL("image/jpeg", WALLPAPER_JPEG_QUALITY),
		            width,
		            height
		          });
		        } catch (error) {
		          reject(error instanceof Error ? error : new Error(String(error)));
		        }
		      };
		      image.src = String(reader.result);
		    };
		    reader.readAsDataURL(file);
		  });
		}

		// src/client/preview.ts
		var PREVIEW_WIDTH = 260;
		var PREVIEW_HEIGHT = 120;
		var cache = /* @__PURE__ */ new Map();
		var decodedImages = /* @__PURE__ */ new Map();
		function decodedImage(src) {
		  const cached = decodedImages.get(src);
		  if (cached !== void 0) return cached;
		  const promise = new Promise((resolve, reject) => {
		    const image = new Image();
		    image.onload = () => resolve(image);
		    image.onerror = () => reject(new Error("wallpaper preview decode failed"));
		    image.src = src;
		  });
		  decodedImages.set(src, promise);
		  return promise;
		}
		function roundRect(context, x, y, width, height, radius) {
		  const r = Math.min(radius, width / 2, height / 2);
		  context.beginPath();
		  context.moveTo(x + r, y);
		  context.arcTo(x + width, y, x + width, y + height, r);
		  context.arcTo(x + width, y + height, x, y + height, r);
		  context.arcTo(x, y + height, x, y, r);
		  context.arcTo(x, y, x + width, y, r);
		  context.closePath();
		}
		async function renderThemePreview(preview, options = { wallpaperImage: void 0, x: 50, y: 50, scheme: "dark" }) {
		  const { wallpaperImage, x = 50, y = 50, scheme = "dark" } = options;
		  const key = `${preview.base}|${preview.sidebar}|${preview.bubble}|${preview.accent}|${wallpaperImage ?? ""}|${x}|${y}|${scheme}`;
		  const cached = cache.get(key);
		  if (cached !== void 0) return cached;
		  const canvas = document.createElement("canvas");
		  canvas.width = PREVIEW_WIDTH;
		  canvas.height = PREVIEW_HEIGHT;
		  const context = canvas.getContext("2d");
		  if (wallpaperImage !== void 0) {
		    try {
		      const image = await decodedImage(wallpaperImage);
		      const scale = Math.max(PREVIEW_WIDTH / image.naturalWidth, PREVIEW_HEIGHT / image.naturalHeight);
		      const drawW = image.naturalWidth * scale;
		      const drawH = image.naturalHeight * scale;
		      const offsetX = (PREVIEW_WIDTH - drawW) * clamp(x, 0, 100) / 100;
		      const offsetY = (PREVIEW_HEIGHT - drawH) * clamp(y, 0, 100) / 100;
		      context.drawImage(image, offsetX, offsetY, drawW, drawH);
		    } catch {
		      context.fillStyle = preview.base;
		      context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
		    }
		    context.fillStyle = scheme === "dark" ? "rgba(8, 10, 14, 0.32)" : "rgba(250, 251, 253, 0.25)";
		    context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
		  } else {
		    context.fillStyle = preview.base;
		    context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
		  }
		  const sidebarW = Math.round(PREVIEW_WIDTH * 0.26);
		  context.fillStyle = preview.sidebar;
		  context.fillRect(0, 0, sidebarW, PREVIEW_HEIGHT);
		  context.fillStyle = preview.accent;
		  for (const dotY of [18, 34]) {
		    context.beginPath();
		    context.arc(12, dotY, 4, 0, Math.PI * 2);
		    context.fill();
		  }
		  const bubbleX = sidebarW + 16;
		  const bubbleW = PREVIEW_WIDTH - bubbleX - 14;
		  context.fillStyle = preview.bubble;
		  for (const [bubbleY, bubbleH, bubbleInset] of [
		    [16, 18, 0.42],
		    [42, 18, 0.2],
		    [68, 18, 0.32]
		  ]) {
		    roundRect(context, bubbleX + bubbleW * bubbleInset, bubbleY, bubbleW * (1 - bubbleInset), bubbleH, 9);
		    context.fill();
		  }
		  context.fillStyle = preview.accent;
		  roundRect(context, bubbleX, PREVIEW_HEIGHT - 26, 64, 10, 5);
		  context.fill();
		  const dataUrl = canvas.toDataURL("image/png");
		  cache.set(key, dataUrl);
		  return dataUrl;
		}

		// src/client/WallpaperDialog.tsx
		var import_react = require("react");
		var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		var import_jsx_runtime = require("react/jsx-runtime");
		function useBoxSize(ref) {
		  const [size, setSize] = (0, import_react.useState)({ width: 0, height: 0 });
		  (0, import_react.useLayoutEffect)(() => {
		    const element = ref.current;
		    if (element === null) return;
		    const update = () => {
		      const rect = element.getBoundingClientRect();
		      setSize(
		        (previous) => previous.width === rect.width && previous.height === rect.height ? previous : { width: rect.width, height: rect.height }
		      );
		    };
		    update();
		    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : void 0;
		    observer?.observe(element);
		    return () => observer?.disconnect();
		  }, [ref]);
		  return size;
		}
		function useDraftSlider(storeValue, onChange) {
		  const [draft, setDraft] = (0, import_react.useState)(storeValue);
		  const lastRef = (0, import_react.useRef)(storeValue);
		  const onChangeRef = (0, import_react.useRef)(onChange);
		  onChangeRef.current = onChange;
		  const timerRef = (0, import_react.useRef)(void 0);
		  (0, import_react.useEffect)(() => {
		    if (storeValue !== lastRef.current) {
		      lastRef.current = storeValue;
		      setDraft(storeValue);
		    }
		  }, [storeValue]);
		  (0, import_react.useEffect)(() => () => clearTimeout(timerRef.current), []);
		  const commit = (value) => {
		    setDraft(value);
		    lastRef.current = value;
		    clearTimeout(timerRef.current);
		    timerRef.current = setTimeout(() => onChangeRef.current(value), 80);
		  };
		  const flush = () => {
		    clearTimeout(timerRef.current);
		    onChangeRef.current(lastRef.current);
		  };
		  return { draft, commit, flush };
		}
		function WallpaperDialog({
		  t,
		  wallpaper,
		  updateWallpaper,
		  setWallpaperMode,
		  clearWallpaper,
		  pickWallpaper,
		  onClose
		}) {
		  const [dragging, setDragging] = (0, import_react.useState)(false);
		  const [busy, setBusy] = (0, import_react.useState)(false);
		  const [error, setError] = (0, import_react.useState)(null);
		  const dragState = (0, import_react.useRef)(null);
		  const boxRef = (0, import_react.useRef)(null);
		  const fileRef = (0, import_react.useRef)(null);
		  const box = useBoxSize(boxRef);
		  const image = wallpaper.dataUrl !== "" ? wallpaper.dataUrl : WALLPAPER_PLACEHOLDER_IMAGE;
		  const zoom = clamp(Number(wallpaper.zoom) ?? 1, WALLPAPER_ZOOM_MIN, WALLPAPER_ZOOM_MAX);
		  const overlay = clamp(Number(wallpaper.overlay) ?? 0.45, 0, WALLPAPER_OVERLAY_MAX);
		  const surface = clamp(Number(wallpaper.surface) ?? 0.65, WALLPAPER_SURFACE_MIN, WALLPAPER_SURFACE_MAX);
		  const x = clamp(Number(wallpaper.x) ?? 50, 0, 100);
		  const y = clamp(Number(wallpaper.y) ?? 50, 0, 100);
		  const zoomSlider = useDraftSlider(Math.round(zoom * 100), (value) => updateWallpaper({ zoom: value / 100 }));
		  const overlaySlider = useDraftSlider(Math.round(overlay * 100), (value) => updateWallpaper({ overlay: value / 100 }));
		  const surfaceSlider = useDraftSlider(Math.round(surface * 100), (value) => updateWallpaper({ surface: value / 100 }));
		  const imgW = Number(wallpaper.width) > 0 ? Number(wallpaper.width) : 16;
		  const imgH = Number(wallpaper.height) > 0 ? Number(wallpaper.height) : 9;
		  const fitted = box.width > 0 && box.height > 0 ? (() => {
		    const fitScale = Math.min(box.width / imgW, box.height / imgH);
		    const fitW = imgW * fitScale;
		    const fitH = imgH * fitScale;
		    const ox = (box.width - fitW) / 2;
		    const oy = (box.height - fitH) / 2;
		    const coverScale = Math.max(box.width / imgW, box.height / imgH) * zoom;
		    const dispW = box.width / coverScale;
		    const dispH = box.height / coverScale;
		    return {
		      fitW,
		      fitH,
		      ox,
		      oy,
		      frame: {
		        left: ox + (imgW - dispW) * (x / 100) * fitScale,
		        top: oy + (imgH - dispH) * (y / 100) * fitScale,
		        width: dispW * fitScale,
		        height: dispH * fitScale
		      }
		    };
		  })() : null;
		  const onPointerDown = (event) => {
		    if (event.button !== 0) return;
		    try {
		      event.currentTarget.setPointerCapture(event.pointerId);
		    } catch {
		    }
		    event.preventDefault();
		    dragState.current = { startX: event.clientX, startY: event.clientY, panX: x, panY: y };
		    setDragging(true);
		  };
		  const onPointerMove = (event) => {
		    const drag = dragState.current;
		    const boxEl = boxRef.current;
		    if (drag === null || boxEl === null || box.width <= 0 || box.height <= 0) return;
		    const dx = (event.clientX - drag.startX) / box.width * 100;
		    const dy = (event.clientY - drag.startY) / box.height * 100;
		    updateWallpaper({ x: clamp(drag.panX + dx, 0, 100), y: clamp(drag.panY + dy, 0, 100) });
		  };
		  const onPointerUp = (event) => {
		    dragState.current = null;
		    setDragging(false);
		    try {
		      event.currentTarget.releasePointerCapture(event.pointerId);
		    } catch {
		    }
		  };
		  const onWheel = (event) => {
		    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
		    updateWallpaper({ zoom: clamp(zoom * factor, WALLPAPER_ZOOM_MIN, WALLPAPER_ZOOM_MAX) });
		  };
		  const onPick = async (event) => {
		    const file = event.target.files?.[0];
		    event.target.value = "";
		    if (file === void 0) return;
		    setBusy(true);
		    setError(null);
		    try {
		      await pickWallpaper(file);
		    } catch (err) {
		      setError(err instanceof Error ? err.message : String(err));
		    } finally {
		      setBusy(false);
		    }
		  };
		  const field = (label, draft, displayText, min, max, step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dsh-tc-wp-field", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-tc-wp-field-label", children: [
		      label,
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-tc-wp-field-value", children: displayText })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      "input",
		      {
		        type: "range",
		        min,
		        max,
		        step,
		        value: String(draft.draft),
		        onChange: (event) => draft.commit(Number(event.target.value)),
		        onPointerUp: draft.flush,
		        onKeyUp: draft.flush,
		        onBlur: draft.flush,
		        style: {
		          "--dsh-tc-wp-track": `linear-gradient(to right, var(--dsw-alias-brand-primary) 0%, var(--dsw-alias-brand-primary) ${Math.round((draft.draft - min) / (max - min) * 100)}%, var(--dsw-alias-border-l2) ${Math.round((draft.draft - min) / (max - min) * 100)}%, var(--dsw-alias-border-l2) 100%)`
		        }
		      }
		    )
		  ] });
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		    import_dsh_client_ui_primitives.Modal,
		    {
		      open: true,
		      onClose,
		      title: t("wallpaper.editorTitle"),
		      closeLabel: t("wallpaper.close"),
		      className: "dsh-tc-wp-modal",
		      contentClassName: "dsh-tc-wp-content",
		      footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-footer", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsh-tc-button", onClick: () => fileRef.current?.click(), disabled: busy, children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconPaperclipOutline16, { size: 14 }),
		          t("wallpaper.set")
		        ] }),
		        wallpaper.dataUrl !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "button",
		          {
		            type: "button",
		            className: "dsh-tc-button dsh-tc-button-danger",
		            onClick: () => {
		              clearWallpaper();
		              onClose();
		            },
		            children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 }),
		              t("wallpaper.clear")
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-tc-toolbar-spacer" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-tc-button dsh-tc-button-primary", onClick: onClose, children: t("wallpaper.done") })
		      ] }),
		      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-body", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		          "div",
		          {
		            ref: boxRef,
		            className: dragging ? "dsh-tc-editor-preview dsh-tc-wp-preview dsh-tc-dragging" : "dsh-tc-editor-preview dsh-tc-wp-preview",
		            style: fitted === null ? { backgroundImage: `url("${image}")`, backgroundSize: "contain", backgroundPosition: "center" } : {
		              backgroundImage: `url("${image}")`,
		              backgroundSize: `${fitted.fitW}px ${fitted.fitH}px`,
		              backgroundPosition: `${fitted.ox}px ${fitted.oy}px`
		            },
		            onPointerDown,
		            onPointerMove,
		            onPointerUp,
		            onPointerCancel: onPointerUp,
		            onWheel,
		            children: [
		              fitted !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "div",
		                {
		                  className: "dsh-tc-wp-frame",
		                  style: {
		                    left: fitted.frame.left,
		                    top: fitted.frame.top,
		                    width: fitted.frame.width,
		                    height: fitted.frame.height
		                  }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-tc-editor-hint", children: t("wallpaper.dragHint") })
		            ]
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-controls", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-sliders", children: [
		            field(t("wallpaper.zoom"), zoomSlider, `${zoomSlider.draft}%`, WALLPAPER_ZOOM_MIN * 100, WALLPAPER_ZOOM_MAX * 100, 5),
		            field(t("wallpaper.overlay"), overlaySlider, `${overlaySlider.draft}%`, 0, WALLPAPER_OVERLAY_MAX * 100, 1),
		            field(t("wallpaper.surface"), surfaceSlider, `${surfaceSlider.draft}%`, WALLPAPER_SURFACE_MIN * 100, WALLPAPER_SURFACE_MAX * 100, 5)
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-mode", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-tc-wp-mode-label", children: t("wallpaper.mode") }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-tc-wp-segmented", role: "radiogroup", "aria-label": t("wallpaper.mode"), children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "button",
		                {
		                  type: "button",
		                  role: "radio",
		                  "aria-checked": wallpaper.mode === "dark",
		                  "data-active": wallpaper.mode === "dark" ? "true" : void 0,
		                  onClick: () => setWallpaperMode("dark"),
		                  children: t("wallpaper.mode.dark")
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "button",
		                {
		                  type: "button",
		                  role: "radio",
		                  "aria-checked": wallpaper.mode === "light",
		                  "data-active": wallpaper.mode === "light" ? "true" : void 0,
		                  onClick: () => setWallpaperMode("light"),
		                  children: t("wallpaper.mode.light")
		                }
		              )
		            ] })
		          ] }),
		          error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-tc-feedback dsh-tc-feedback-error", children: error })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ref: fileRef, type: "file", accept: "image/*", style: { display: "none" }, onChange: onPick })
		      ] })
		    }
		  );
		}

		// src/client/ThemeGallerySection.tsx
		var import_jsx_runtime2 = require("react/jsx-runtime");
		function localeOf() {
		  const lang = typeof navigator !== "undefined" ? navigator.language : "zh";
		  return lang.toLowerCase().startsWith("zh") ? "zh" : "en";
		}
		function cardModel(entry, t, custom) {
		  const wallpaper = entry.id === "wallpaper";
		  return {
		    id: entry.id,
		    name: wallpaper ? t("theme.wallpaper") : t(entry.nameKey),
		    desc: wallpaper ? t("theme.wallpaper.desc") : t(entry.descKey),
		    scheme: entry.colorScheme,
		    preview: entry.preview,
		    custom: custom === true
		  };
		}
		function PreviewMock({ preview, wallpaperImage, wallpaper }) {
		  const [url, setUrl] = (0, import_react2.useState)(null);
		  (0, import_react2.useEffect)(() => {
		    let cancelled = false;
		    renderThemePreview(preview, {
		      wallpaperImage,
		      x: wallpaper?.x,
		      y: wallpaper?.y,
		      scheme: wallpaper?.mode
		    }).then((dataUrl) => {
		      if (!cancelled) setUrl(dataUrl);
		    });
		    return () => {
		      cancelled = true;
		    };
		  }, [preview, wallpaperImage, wallpaper?.x, wallpaper?.y, wallpaper?.mode]);
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-tc-preview", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("img", { className: "dsh-tc-preview-img", src: url ?? void 0, alt: "" }) });
		}
		function ThemeGallerySection({ t, useStore, setActive, importText, removeCustom, exportTheme, pickWallpaper, updateWallpaper, setWallpaperMode, clearWallpaper }) {
		  const state = useStore((value) => value);
		  const locale = localeOf();
		  const fileRef = (0, import_react2.useRef)(null);
		  const wallpaperFileRef = (0, import_react2.useRef)(null);
		  const [pasteOpen, setPasteOpen] = (0, import_react2.useState)(false);
		  const [pasteText, setPasteText] = (0, import_react2.useState)("");
		  const [feedback, setFeedback] = (0, import_react2.useState)(null);
		  const [wallpaperBusy, setWallpaperBusy] = (0, import_react2.useState)(false);
		  const [editorOpen, setEditorOpen] = (0, import_react2.useState)(false);
		  const formId = (0, import_react2.useId)();
		  const showFeedback = (kind, text) => setFeedback({ kind, text });
		  const lightCards = CATALOG.filter((entry) => entry.colorScheme === "light" && entry.id !== "wallpaper").map((entry) => cardModel(entry, t, false));
		  const darkCards = CATALOG.filter((entry) => entry.colorScheme === "dark" && entry.id !== "wallpaper").map((entry) => cardModel(entry, t, false));
		  const customCards = state.custom.map((theme) => ({
		    id: theme.id,
		    name: theme.name,
		    desc: theme.description || t("custom"),
		    scheme: theme.colorScheme,
		    preview: previewOfCustom(theme),
		    custom: true
		  }));
		  const wallpaperEntry = CATALOG.find((entry) => entry.id === "wallpaper");
		  const wallpaperCard = wallpaperEntry === void 0 ? null : cardModel(wallpaperEntry, t, false);
		  const pickFile = (event) => {
		    const file = event.target.files?.[0];
		    event.target.value = "";
		    if (file === void 0) return;
		    const reader = new FileReader();
		    reader.onload = () => {
		      const result = importText(String(reader.result), locale);
		      if (result.ok) {
		        showFeedback("ok", result.replaced ? t("import.replaced").replace("{name}", result.name) : t("import.ok").replace("{name}", result.name));
		      } else {
		        showFeedback("error", t("import.error").replace("{message}", result.message));
		      }
		    };
		    reader.readAsText(file);
		  };
		  const parsePaste = () => {
		    const result = importText(pasteText, locale);
		    if (result.ok) {
		      setPasteText("");
		      setPasteOpen(false);
		      showFeedback("ok", result.replaced ? t("import.replaced").replace("{name}", result.name) : t("import.ok").replace("{name}", result.name));
		    } else {
		      showFeedback("error", t("import.error").replace("{message}", result.message));
		    }
		  };
		  const onRemove = (id, name) => {
		    if (typeof window !== "undefined" && !window.confirm(t("delete.confirm").replace("{name}", name))) return;
		    removeCustom(id, locale);
		  };
		  const onPickWallpaper = async (event) => {
		    const file = event.target.files?.[0];
		    event.target.value = "";
		    if (file === void 0) return;
		    setWallpaperBusy(true);
		    try {
		      await pickWallpaper(file);
		      showFeedback("ok", t("wallpaper.set"));
		    } catch (error) {
		      showFeedback("error", error instanceof Error ? error.message : String(error));
		    } finally {
		      setWallpaperBusy(false);
		    }
		  };
		  const renderGrid = (cards) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-tc-grid", children: cards.map((card) => {
		    const selected = state.active === card.id;
		    const wallpaperImage = card.id === "wallpaper" && state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : void 0;
		    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		      "button",
		      {
		        type: "button",
		        className: "dsh-tc-card",
		        "data-selected": selected ? "true" : void 0,
		        "aria-pressed": selected,
		        onClick: () => setActive(card.id),
		        children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            PreviewMock,
		            {
		              preview: card.preview,
		              wallpaperImage,
		              wallpaper: card.id === "wallpaper" ? state.wallpaper : void 0
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-meta", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-name", title: card.desc, children: card.name }),
		            selected && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-badge", title: t("using"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconCheckOutline16, { size: 12 }) }),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: card.custom ? "dsh-tc-badge dsh-tc-badge-custom" : "dsh-tc-badge", children: card.custom ? t("custom") : t("builtin") })
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dsh-tc-desc", children: card.desc }),
		          card.custom && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-card-actions", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "dsh-tc-icon-button",
		                title: t("export.label"),
		                onClick: (event) => {
		                  event.stopPropagation();
		                  exportTheme(card.id);
		                },
		                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconDownloadOutline16, { size: 14 })
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		              "button",
		              {
		                type: "button",
		                className: "dsh-tc-icon-button dsh-tc-icon-button-danger",
		                title: t("delete.label"),
		                onClick: (event) => {
		                  event.stopPropagation();
		                  onRemove(card.id, card.name);
		                },
		                children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconTrashOutline16, { size: 14 })
		              }
		            )
		          ] })
		        ]
		      },
		      card.id
		    );
		  }) });
		  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-section", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "dsh-tc-heading", children: t("title") }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dsh-tc-intro", children: t("intro") })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-toolbar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-toolbar-spacer" }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsh-tc-button", onClick: () => fileRef.current?.click(), children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconPlusOutline16, { size: 14 }),
		        t("import.open")
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsh-tc-button", onClick: () => setPasteOpen((open) => !open), children: [
		        pasteOpen ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconCloseOutline16, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconPaperclipOutline16, { size: 14 }),
		        pasteOpen ? t("import.cancel") : t("import.paste")
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        "input",
		        {
		          ref: fileRef,
		          type: "file",
		          accept: ".json,application/json",
		          style: { display: "none" },
		          onChange: pickFile
		        }
		      )
		    ] }),
		    pasteOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-import", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { htmlFor: `${formId}-paste`, className: "dsh-tc-wallpaper-hint", children: t("import.pasteHint") }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        "textarea",
		        {
		          id: `${formId}-paste`,
		          className: "dsh-tc-import-textarea",
		          value: pasteText,
		          placeholder: t("import.placeholder"),
		          onChange: (event) => setPasteText(event.target.value)
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dsh-tc-button dsh-tc-button-primary", disabled: pasteText.trim() === "", onClick: parsePaste, children: t("import.parse") }) })
		    ] }),
		    feedback !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: feedback.kind === "error" ? "dsh-tc-feedback dsh-tc-feedback-error" : "dsh-tc-feedback dsh-tc-feedback-ok", children: feedback.text }),
		    lightCards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-group", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "dsh-tc-group-title", children: t("group.light") }),
		      renderGrid(lightCards)
		    ] }),
		    darkCards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-group", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "dsh-tc-group-title", children: t("group.dark") }),
		      renderGrid(darkCards)
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-group", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "dsh-tc-group-title", children: t("group.custom") }),
		      wallpaperCard !== null && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "dsh-tc-grid", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
		        "button",
		        {
		          type: "button",
		          className: "dsh-tc-card",
		          "data-selected": state.active === "wallpaper" ? "true" : void 0,
		          "aria-pressed": state.active === "wallpaper",
		          onClick: () => setActive("wallpaper"),
		          children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		              PreviewMock,
		              {
		                preview: wallpaperCard.preview,
		                wallpaperImage: state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : void 0,
		                wallpaper: state.wallpaper
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-meta", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-name", children: wallpaperCard.name }),
		              state.active === "wallpaper" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-badge", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconCheckOutline16, { size: 12 }) }),
		              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-badge", children: t("builtin") })
		            ] }),
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dsh-tc-desc", children: wallpaperCard.desc })
		          ]
		        }
		      ) }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-wallpaper-row", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		          "div",
		          {
		            className: "dsh-tc-wallpaper-thumb",
		            style: {
		              backgroundImage: `url("${state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : WALLPAPER_PLACEHOLDER_IMAGE}")`,
		              backgroundSize: "cover",
		              backgroundPosition: "center"
		            }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-wallpaper-info", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-wallpaper-name", children: state.wallpaper.dataUrl !== "" ? state.wallpaper.name : t("wallpaper.none") }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dsh-tc-wallpaper-hint", children: t("wallpaper.hint") })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dsh-tc-card-actions", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsh-tc-button", onClick: () => setEditorOpen(true), children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconEditOutline16, { size: 14 }),
		            t("wallpaper.edit")
		          ] }),
		          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dsh-tc-button", onClick: () => wallpaperFileRef.current?.click(), disabled: wallpaperBusy, children: [
		            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconPaperclipOutline16, { size: 14 }),
		            t("wallpaper.set")
		          ] }),
		          state.wallpaper.dataUrl !== "" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		            "button",
		            {
		              type: "button",
		              className: "dsh-tc-icon-button dsh-tc-icon-button-danger",
		              title: t("wallpaper.clear"),
		              onClick: () => clearWallpaper(),
		              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_dsh_client_ui_primitives2.IconTrashOutline16, { size: 14 })
		            }
		          )
		        ] })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        "input",
		        {
		          ref: wallpaperFileRef,
		          type: "file",
		          accept: "image/*",
		          style: { display: "none" },
		          onChange: onPickWallpaper
		        }
		      ),
		      editorOpen && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
		        WallpaperDialog,
		        {
		          t,
		          wallpaper: state.wallpaper,
		          updateWallpaper,
		          setWallpaperMode,
		          clearWallpaper,
		          pickWallpaper,
		          onClose: () => setEditorOpen(false)
		        }
		      ),
		      customCards.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { className: "dsh-tc-group-sub", children: t("group.imported") }),
		        renderGrid(customCards)
		      ] })
		    ] })
		  ] });
		}
		function previewOfCustom(theme) {
		  const token = (name, fallback) => {
		    const value = theme.tokens?.[name];
		    return typeof value === "string" && value !== "" ? value : fallback;
		  };
		  return {
		    base: token("--dsw-alias-bg-base", theme.colorScheme === "dark" ? "#16161a" : "#f5f5f5"),
		    surface: token("--dsw-alias-bg-layer-1", token("--dsw-alias-bg-base", "#ffffff")),
		    sidebar: token("--dsw-specific-sidebar-fill", token("--dsw-alias-bg-base", "#eeeeee")),
		    bubble: token("--dsw-specific-bubble", token("--dsw-alias-bg-layer-2", "#dddddd")),
		    accent: token("--dsw-alias-brand-primary", theme.colorScheme === "dark" ? "#8ab4ff" : "#4176e6"),
		    text: token("--dsw-alias-label-primary", theme.colorScheme === "dark" ? "#e6e6ea" : "#16161a")
		  };
		}

		// src/client/index.tsx
		function createStore() {
		  return (0, import_client.defineStore)({
		    init: () => ({
		      ready: false,
		      active: "system",
		      custom: [],
		      wallpaper: normalizeWallpaper(void 0),
		      revision: 0
		    }),
		    actions: {
		      sync: (draft, patch) => {
		        Object.assign(draft, patch);
		        draft.revision += 1;
		      }
		    }
		  });
		}
		var DARK_ATTRIBUTE = "data-ds-dark-theme";
		var WALLPAPER_ATTRIBUTE = "data-dsh-wallpaper";
		var CATALOG_BY_ID = new Map(materializeCatalog().map((entry) => [entry.id, entry]));
		var ThemeCenterController = class {
		  constructor(ctx) {
		    /* ── selection ────────────────────────────────────────────────────── */
		    /**
		     * Cache the shipped base palettes (light/dark token maps) from every
		     * `theme/change` snapshot the presenter applies. Corrections for stale
		     * ui-theme adoption repaint from this cache *without writing settings*,
		     * so a stale round trip can never amplify writes or flash a wrong palette.
		     */
		    this.baseTokens = {};
		    this.ctx = ctx;
		    this.theme = ctx.get("theme");
		    this.scope = ctx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
		    this.themeScope = ctx.settingsScope.bind({ namespace: "ui-theme" });
		    this.state = {
		      ready: false,
		      active: "system",
		      custom: [],
		      wallpaper: normalizeWallpaper(void 0),
		      revision: 0
		    };
		    this.bound = void 0;
		    this.registered = /* @__PURE__ */ new Map();
		    this.appliedTokens = [];
		    this.themeScopeCount = 0;
		    this.persistTimer = void 0;
		    this.lastUserSelectionAt = 0;
		    this.lastWallpaperWriteAt = 0;
		  }
		  /* ── store mirror ─────────────────────────────────────────────────── */
		  publishState() {
		    if (this.bound === void 0) return;
		    this.bound.sync({
		      ready: this.state.ready,
		      active: this.state.active,
		      custom: this.state.custom,
		      wallpaper: this.state.wallpaper
		    });
		  }
		  attach(actions) {
		    this.bound = actions;
		    this.publishState();
		  }
		  /* ── theme definition resolution ──────────────────────────────────── */
		  /** Resolve the full definition of any selectable theme id. */
		  resolveDef(id) {
		    if (isWallpaperId(id)) return buildWallpaperTheme(this.state.wallpaper);
		    const catalogEntry = CATALOG_BY_ID.get(id);
		    if (catalogEntry !== void 0) return catalogEntry;
		    return this.state.custom.find((theme) => theme.id === id);
		  }
		  /* ── theme registry ───────────────────────────────────────────────── */
		  registerCustom(themeDef) {
		    const previous = this.registered.get(themeDef.id);
		    if (previous !== void 0) {
		      previous();
		      this.registered.delete(themeDef.id);
		    }
		    const disposer = this.theme.register({
		      id: themeDef.id,
		      colorScheme: themeDef.colorScheme,
		      tokens: themeDef.tokens
		    });
		    this.registered.set(themeDef.id, disposer);
		  }
		  unregisterCustom(id) {
		    const disposer = this.registered.get(id);
		    if (disposer === void 0) return;
		    disposer();
		    this.registered.delete(id);
		  }
		  /** Register catalog themes + the wallpaper once at boot. */
		  registerBuiltins() {
		    for (const entry of CATALOG) {
		      if (entry.builtin) continue;
		      if (this.registered.has(entry.id)) continue;
		      const def = CATALOG_BY_ID.get(entry.id);
		      try {
		        this.registered.set(
		          entry.id,
		          this.theme.register({ id: def.id, colorScheme: def.colorScheme, tokens: def.tokens })
		        );
		      } catch (error) {
		        console.warn(`theme-center: register "${def.id}" failed`, error);
		      }
		    }
		    this.refreshWallpaperRegistration();
		  }
		  /** Re-register the dynamic wallpaper theme from the current record. */
		  refreshWallpaperRegistration() {
		    this.unregisterCustom("wallpaper");
		    const def = buildWallpaperTheme(this.state.wallpaper);
		    try {
		      this.registered.set(
		        "wallpaper",
		        this.theme.register({ id: "wallpaper", colorScheme: def.colorScheme, tokens: def.tokens })
		      );
		    } catch (error) {
		      console.warn("theme-center: wallpaper register failed", error);
		    }
		  }
		  /** Bring the registry in line with the persisted custom list. */
		  reconcileCustom(list) {
		    const live = new Set(list.map((theme) => theme.id));
		    for (const id of [...this.registered.keys()]) {
		      if (CATALOG_BY_ID.has(id) || id === "wallpaper") continue;
		      if (!live.has(id)) this.unregisterCustom(id);
		    }
		    for (const themeDef of list) {
		      try {
		        this.registerCustom(themeDef);
		      } catch (error) {
		        console.warn(`theme-center: register "${themeDef.id}" failed`, error);
		      }
		    }
		  }
		  /* ── DOM presentation ─────────────────────────────────────────────── */
		  /** Remove everything this plugin painted on <body>. */
		  retractCustom() {
		    const body = document.body;
		    for (const name of this.appliedTokens) body.style.removeProperty(name);
		    this.appliedTokens = [];
		    body.removeAttribute(WALLPAPER_ATTRIBUTE);
		  }
		  /** Apply a custom theme's presentation directly (scheme + tokens). */
		  applyCustom(def) {
		    const scheme = def.colorScheme === "dark" ? "dark" : "light";
		    document.documentElement.style.colorScheme = scheme;
		    const body = document.body;
		    if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
		    else body.removeAttribute(DARK_ATTRIBUTE);
		    this.retractCustom();
		    const tokens = { ...def.tokens };
		    if (def.wallpaper === true) this.fillWallpaperSizing(tokens);
		    for (const [name, value] of Object.entries(tokens)) {
		      body.style.setProperty(name, String(value));
		      this.appliedTokens.push(name);
		    }
		    if (def.wallpaper === true) body.setAttribute(WALLPAPER_ATTRIBUTE, "");
		  }
		  /**
		   * Fill the viewport-dependent wallpaper tokens (cover × zoom size, pan
		   * position). Called at apply time and on window resize while the
		   * wallpaper theme is active.
		   */
		  fillWallpaperSizing(tokens) {
		    const wallpaper = normalizeWallpaper(this.state.wallpaper);
		    const viewport = { width: window.innerWidth, height: window.innerHeight };
		    const size = coverSizeFor(viewport.width, viewport.height, wallpaper);
		    tokens[WALLPAPER_TOKENS.sizeWidth] = `${size.width}px`;
		    tokens[WALLPAPER_TOKENS.sizeHeight] = `${size.height}px`;
		    tokens[WALLPAPER_TOKENS.positionX] = `${clamp(Number(wallpaper.x) ?? 50, 0, 100)}%`;
		    tokens[WALLPAPER_TOKENS.positionY] = `${clamp(Number(wallpaper.y) ?? 50, 0, 100)}%`;
		  }
		  /** Re-apply the wallpaper sizing after a viewport change (debounced). */
		  onViewportChange() {
		    if (!this.state.ready || this.state.active !== "wallpaper") return;
		    this.applyActive("wallpaper");
		  }
		  /** Capture the base palette of the snapshot just applied by the presenter. */
		  captureBase(snapshot) {
		    const scheme = snapshot.active?.colorScheme;
		    if ((scheme === "light" || scheme === "dark") && typeof snapshot.active.tokens === "object" && snapshot.active.tokens !== null) {
		      this.baseTokens[scheme] = snapshot.active.tokens;
		    }
		  }
		  /** The scheme `system` resolves to right now (media query). */
		  systemScheme() {
		    return typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		  }
		  /**
		   * Repaint a built-in selection's base palette from the cache, write-free.
		   * @returns false when the palette is not cached yet (caller falls back to
		   * the regular apply path, which lets the presenter paint it).
		   */
		  paintBase(id) {
		    const scheme = id === "system" ? this.systemScheme() : id;
		    const tokens = this.baseTokens[scheme];
		    if (tokens === void 0) return false;
		    document.documentElement.style.colorScheme = scheme;
		    const body = document.body;
		    if (scheme === "dark") body.setAttribute(DARK_ATTRIBUTE, "");
		    else body.removeAttribute(DARK_ATTRIBUTE);
		    this.retractCustom();
		    for (const [name, value] of Object.entries(tokens)) {
		      body.style.setProperty(name, String(value));
		      this.appliedTokens.push(name);
		    }
		    return true;
		  }
		  /** Apply the selected theme id to the world (registry + DOM). */
		  applyActive(id) {
		    if (isBuiltinPreference(id)) {
		      if (this.paintBase(id)) return;
		      this.retractCustom();
		      const preference = this.theme.getTheme().preference;
		      if (preference !== id) this.theme.setTheme(id);
		      return;
		    }
		    const def = this.resolveDef(id);
		    if (def === void 0) {
		      this.setActive("system");
		      return;
		    }
		    this.applyCustom(def);
		  }
		  /** Persist the selection, debounced: a rapid burst writes once, latest wins. */
		  schedulePersist() {
		    clearTimeout(this.persistTimer);
		    this.persistTimer = setTimeout(() => {
		      this.scope.set(FIELD_ACTIVE, this.state.active);
		    }, 400);
		  }
		  /** Persist a new selection and apply it. */
		  setActive(id) {
		    this.lastUserSelectionAt = Date.now();
		    this.state.active = id;
		    this.state.ready = true;
		    this.publishState();
		    this.applyActive(id);
		    this.schedulePersist();
		  }
		  /* ── settings document ────────────────────────────────────────────── */
		  /** Adopt a settings snapshot (initial load and every write). */
		  adoptSettings() {
		    const snapshot = this.scope.getSnapshot();
		    if (snapshot.status !== "ready" || snapshot.value === void 0) return;
		    const value = snapshot.value;
		    const custom = Array.isArray(value.custom) ? value.custom : [];
		    const wallpaper = normalizeWallpaper(value.wallpaper);
		    const active = typeof value.active === "string" && value.active !== "" ? value.active : "system";
		    const wallpaperChanged = wallpaper.dataUrl !== this.state.wallpaper.dataUrl || wallpaper.mode !== this.state.wallpaper.mode;
		    this.state.custom = custom;
		    this.state.ready = true;
		    const recentWallpaperEdit = Date.now() - (this.lastWallpaperWriteAt ?? 0) < 400;
		    if (!recentWallpaperEdit) {
		      this.state.wallpaper = wallpaper;
		      if (wallpaperChanged) this.refreshWallpaperRegistration();
		    }
		    this.publishState();
		    this.reconcileCustom(custom);
		    const recentClick = Date.now() - (this.lastUserSelectionAt ?? 0) < 1e3;
		    if (!recentClick) {
		      this.state.active = active;
		      this.publishState();
		      this.applyActive(active);
		    }
		  }
		  /** ui-theme preference notifications (the first is the initial load). */
		  adoptThemePreference() {
		    this.themeScopeCount += 1;
		    if (this.themeScopeCount === 1) return;
		  }
		  /** Any theme/change: capture the base palette, then re-assert the selection. */
		  onThemeChange(snapshot) {
		    this.captureBase(snapshot);
		    if (!this.state.ready) return;
		    const active = this.state.active;
		    if (isBuiltinPreference(active)) {
		      if (snapshot.preference !== active) {
		        if (!this.paintBase(active)) this.applyActive(active);
		      }
		      return;
		    }
		    const def = this.resolveDef(active);
		    if (def !== void 0) this.applyCustom(def);
		  }
		  /* ── user actions (inject face) ───────────────────────────────────── */
		  /** Import a dsh-theme document (file contents or pasted JSON). */
		  importText(text, locale) {
		    const taken = [...BUILTIN_THEME_IDS, ...this.state.custom.map((theme2) => theme2.id)];
		    const result = parseThemeFile(text, taken, locale);
		    if (result.theme === null) {
		      return { ok: false, warnings: result.warnings, message: result.warnings[0] ?? "?" };
		    }
		    if (this.state.custom.length >= MAX_CUSTOM_THEMES && !this.state.custom.some((theme2) => theme2.id === result.theme.id)) {
		      return { ok: false, warnings: [], message: locale === "zh" ? "\u81EA\u5B9A\u4E49\u4E3B\u9898\u5DF2\u8FBE\u4E0A\u9650\uFF0830 \u4E2A\uFF09\uFF0C\u8BF7\u5148\u5220\u9664\u4E00\u4E9B\u3002" : "Custom theme limit reached (30). Delete some first." };
		    }
		    const theme = result.theme;
		    const replaced = this.state.custom.some((entry) => entry.id === theme.id);
		    this.state.custom = replaced ? this.state.custom.map((entry) => entry.id === theme.id ? theme : entry) : [...this.state.custom, theme];
		    this.publishState();
		    this.reconcileCustom(this.state.custom);
		    this.scope.set(FIELD_CUSTOM, this.state.custom);
		    this.setActive(theme.id);
		    return { ok: true, replaced, warnings: result.warnings, name: theme.name };
		  }
		  /** Remove an imported theme; the selection falls back to its scheme. */
		  removeCustom(id, locale) {
		    const theme = this.state.custom.find((entry) => entry.id === id);
		    if (theme === void 0) return;
		    this.state.custom = this.state.custom.filter((entry) => entry.id !== id);
		    this.publishState();
		    this.unregisterCustom(id);
		    this.scope.set(FIELD_CUSTOM, this.state.custom);
		    if (this.state.active === id) {
		      const fallback = theme.colorScheme === "dark" ? "dark" : "light";
		      this.setActive(fallback);
		    }
		  }
		  /** Export an imported theme as a downloadable dsh-theme file. */
		  exportTheme(id) {
		    const theme = this.state.custom.find((entry) => entry.id === id);
		    if (theme !== void 0) downloadTheme(theme);
		  }
		  /** Serialize a theme to text (used by the paste helper / preview). */
		  serialize(id) {
		    const theme = this.state.custom.find((entry) => entry.id === id);
		    return theme === void 0 ? null : serializeTheme(theme);
		  }
		  /** Downscale and store a picked wallpaper image (resets crop to fit). */
		  async pickWallpaper(file) {
		    const processed = await processWallpaperFile(file);
		    this.state.wallpaper = normalizeWallpaper({
		      name: String(file?.name ?? ""),
		      dataUrl: String(processed?.dataUrl ?? ""),
		      width: processed?.width ?? 0,
		      height: processed?.height ?? 0,
		      mode: this.state.wallpaper.mode,
		      zoom: 1,
		      x: 50,
		      y: 50
		    });
		    this.publishState();
		    this.refreshWallpaperRegistration();
		    this.lastWallpaperWriteAt = Date.now();
		    this.scope.set(FIELD_WALLPAPER, this.state.wallpaper);
		    if (this.state.active === "wallpaper") this.applyActive("wallpaper");
		    return processed;
		  }
		  /** Update one or more wallpaper crop/tint fields (zoom, pan, opacity…). */
		  updateWallpaper(patch) {
		    const next = normalizeWallpaper({ ...this.state.wallpaper, ...patch });
		    if (JSON.stringify(next) === JSON.stringify(this.state.wallpaper)) return;
		    this.state.wallpaper = next;
		    this.publishState();
		    this.refreshWallpaperRegistration();
		    this.lastWallpaperWriteAt = Date.now();
		    this.scope.set(FIELD_WALLPAPER, this.state.wallpaper);
		    if (this.state.active === "wallpaper") this.applyActive("wallpaper");
		  }
		  /** Switch the wallpaper readability tint mode. */
		  setWallpaperMode(mode) {
		    this.updateWallpaper({ mode });
		  }
		  /** Clear the wallpaper back to the placeholder gradient. */
		  clearWallpaper() {
		    if (this.state.wallpaper.dataUrl === "") return;
		    this.state.wallpaper = normalizeWallpaper({ ...this.state.wallpaper, name: "", dataUrl: "" });
		    this.publishState();
		    this.refreshWallpaperRegistration();
		    this.lastWallpaperWriteAt = Date.now();
		    this.scope.set(FIELD_WALLPAPER, this.state.wallpaper);
		    if (this.state.active === "wallpaper") this.applyActive("wallpaper");
		  }
		};
		var inject = ["slots", "locale", "connection", "remote", "settingsScope", "theme"];
		function apply(ctx) {
		  injectStyles();
		  const controller = new ThemeCenterController(ctx);
		  const t = ctx.locale.bind(SETTINGS_NS);
		  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "theme-center: section dictionaries");
		  ctx.effect(() => {
		    controller.registerBuiltins();
		    return () => {
		      clearTimeout(controller.persistTimer);
		      for (const dispose of controller.registered.values()) dispose();
		      controller.registered.clear();
		      controller.retractCustom();
		    };
		  }, "theme-center: theme registry");
		  controller.captureBase(controller.theme.getTheme());
		  controller.adoptSettings();
		  ctx.effect(() => controller.scope.subscribe(() => controller.adoptSettings()), "theme-center: settings adoption");
		  ctx.effect(
		    () => controller.themeScope.subscribe(() => controller.adoptThemePreference()),
		    "theme-center: appearance preference adoption"
		  );
		  ctx.on("theme/change", (snapshot) => controller.onThemeChange(snapshot));
		  ctx.slots.inject(
		    "settings.section",
		    () => ctx.slots.register(
		      {
		        name: "settings.section",
		        id: "themes",
		        order: 10,
		        label: () => t("nav"),
		        locale: SETTINGS_NS,
		        store: createStore,
		        inject: (actions) => {
		          controller.attach(actions);
		          return {
		            setActive: (id) => controller.setActive(id),
		            importText: (text, locale) => controller.importText(text, locale),
		            removeCustom: (id, locale) => controller.removeCustom(id, locale),
		            exportTheme: (id) => controller.exportTheme(id),
		            pickWallpaper: (file) => controller.pickWallpaper(file),
		            updateWallpaper: (patch) => controller.updateWallpaper(patch),
		            setWallpaperMode: (mode) => controller.setWallpaperMode(mode),
		            clearWallpaper: () => controller.clearWallpaper()
		          };
		        }
		      },
		      ThemeGallerySection
		    )
		  );
		  ctx.effect(() => {
		    let timer;
		    const onResize = () => {
		      clearTimeout(timer);
		      timer = setTimeout(() => controller.onViewportChange(), 120);
		    };
		    window.addEventListener("resize", onResize);
		    return () => {
		      clearTimeout(timer);
		      window.removeEventListener("resize", onResize);
		    };
		  }, "theme-center: wallpaper viewport listener");
		  ctx.slots.inject(
		    "settings.general.item",
		    () => ctx.slots.register(
		      {
		        name: "settings.general.item",
		        id: "appearance",
		        priority: -1,
		        order: 10
		      },
		      () => null
		    )
		  );
		}

		return module.exports;
	}
});
