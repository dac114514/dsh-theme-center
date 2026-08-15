/**
 * The dsh-theme file format — the portable, user-authored theme envelope.
 *
 * A theme file is a JSON document (UTF-8) with this shape:
 *
 * ```json
 * {
 *   "format": "dsh-theme",
 *   "version": 1,
 *   "id": "aurora",
 *   "name": "Aurora",
 *   "description": "A deep violet night sky.",
 *   "colorScheme": "dark",
 *   "tokens": {
 *     "--dsw-alias-bg-base": "#0d0b1e",
 *     "--dsw-alias-label-primary": "#e8e6f5"
 *   },
 *   "wallpaper": "data:image/jpeg;base64,...."   // optional
 * }
 * ```
 *
 * `tokens` maps CSS variable names to values. Every `--dsw-alias-*` /
 * `--dsw-specific-*` token declared by the web app's design platform is a
 * legal target; unknown variables are allowed too (they are simply carried
 * into the document as custom properties, which is how the wallpaper tokens
 * work). A `wallpaper` data URL is optional and must be an image data URL.
 *
 * Both the host (settings schema) and the client (import parser) validate
 * this format, so a file that imports successfully is guaranteed to be
 * persistable and re-appliable.
 */

/** Format marker required at the root of every theme file. */
export const THEME_FILE_FORMAT = "dsh-theme";

/** The only version this plugin understands. */
export const THEME_FILE_VERSION = 1;

/** Lowercase id pattern: a letter start, then letters/digits/hyphens. */
export const THEME_ID_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;

/** Upper bound on custom themes kept in the settings document. */
export const MAX_CUSTOM_THEMES = 30;

/** Upper bound for a wallpaper data URL (2.5 MB base64 ≈ 1.9 MB binary). */
export const MAX_WALLPAPER_DATA_URL = 2_500_000;

/** Upper bound for a raw theme file the user imports. */
export const MAX_IMPORT_FILE_BYTES = 4_000_000;

/** Upper bound for a single token value string. */
export const MAX_TOKEN_VALUE_LENGTH = 300;

/** Upper bound for a theme name. */
export const MAX_THEME_NAME_LENGTH = 64;

/** Upper bound for a theme description. */
export const MAX_THEME_DESCRIPTION_LENGTH = 200;

/** The settings namespace this plugin owns. */
export const SETTINGS_NAMESPACE = "theme-center";

/** Field names inside the settings namespace. */
export const FIELD_ACTIVE = "active";
export const FIELD_CUSTOM = "custom";
export const FIELD_WALLPAPER = "wallpaper";

/** Built-in theme ids plus the built-in preference values this plugin drives. */
export const BUILTIN_THEME_IDS = [
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

/** Theme ids that live in the ui-theme runtime already (no registration). */
export const ORIGINAL_THEME_IDS = ["light", "dark"];

/** The built-in preference values accepted by the ui-theme settings section. */
export const BUILTIN_PREFERENCES = ["light", "dark", "system"];

/** Field names inside the wallpaper record. */
export const WALLPAPER_NAME = "name";
export const WALLPAPER_DATA_URL = "dataUrl";
export const WALLPAPER_MODE = "mode";
export const WALLPAPER_WIDTH = "width";
export const WALLPAPER_HEIGHT = "height";
export const WALLPAPER_ZOOM = "zoom";
export const WALLPAPER_X = "x";
export const WALLPAPER_Y = "y";
export const WALLPAPER_OVERLAY = "overlay";
export const WALLPAPER_SURFACE = "surface";

/** Wallpaper overlay modes: how strong the readability tint is. */
export const WALLPAPER_MODES = ["light", "dark"];

/** Default wallpaper record (fills legacy documents field by field). */
export const WALLPAPER_DEFAULTS = {
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

/** Zoom bounds for the wallpaper crop editor. */
export const WALLPAPER_ZOOM_MIN = 1;
export const WALLPAPER_ZOOM_MAX = 3;

/** Surface-translucency bounds (1 = fully opaque surfaces). */
export const WALLPAPER_SURFACE_MIN = 0.3;
export const WALLPAPER_SURFACE_MAX = 1;

/** Overlay-opacity bounds. */
export const WALLPAPER_OVERLAY_MIN = 0;
export const WALLPAPER_OVERLAY_MAX = 0.85;

/** Clamp a number into [min, max]. */
export function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

/** `Number(value)` that yields `fallback` for NaN/undefined/non-numeric. */
function finiteNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Normalize an unknown wallpaper record into a complete, valid one.
 * @param value - raw value from the settings document (any shape).
 * @returns a record with every field filled and bounds applied.
 */
export function normalizeWallpaper(value) {
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

/** Custom properties this plugin itself defines (wallpaper surface). */
export const WALLPAPER_TOKENS = {
	image: "--dsh-wallpaper-image",
	overlay: "--dsh-wallpaper-overlay",
	sizeWidth: "--dsh-wallpaper-w",
	sizeHeight: "--dsh-wallpaper-h",
	positionX: "--dsh-wallpaper-x",
	positionY: "--dsh-wallpaper-y"
};

/** True when `value` is one of the three built-in theme preferences. */
export function isBuiltinPreference(value) {
	return BUILTIN_PREFERENCES.includes(value);
}

/** True when `value` is the wallpaper theme id. */
export function isWallpaperId(value) {
	return value === "wallpaper";
}

/**
 * Normalize an id candidate to a valid lower-case id: strip illegal
 * characters, force lower case, and guarantee a letter start. Falls back to
 * `"custom-theme"` when nothing usable remains.
 */
export function normalizeThemeId(candidate) {
	const slug = String(candidate ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	const withStart = /^[a-z]/.test(slug) ? slug : `t-${slug}`;
	const trimmed = withStart.slice(0, 64).replace(/-+$/g, "");
	return trimmed.length > 0 ? trimmed : "custom-theme";
}

/** Build a fresh id for an imported theme from its name. */
export function idFromName(name) {
	return normalizeThemeId(name);
}

/** True when the string looks like an image data URL. */
export function isImageDataUrl(value) {
	return (
		typeof value === "string" &&
		/^data:image\/(png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i.test(value)
	);
}
