/**
 * Theme Center — host half.
 *
 * The host owns the durable settings section for this plugin: which theme is
 * active, the list of user-imported custom themes (full definitions, so the
 * browser can re-register them after a reload), and the wallpaper record.
 * The browser half reads and writes this section through the settings scope;
 * everything else (registry, presentation, gallery UI) is browser-side.
 *
 * The schema mirrors the dsh-theme file format (see src/shared/theme-file.ts)
 * so every value the import parser accepts is persistable by construction.
 */
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
import {
	FIELD_ACTIVE,
	FIELD_CUSTOM,
	FIELD_WALLPAPER,
	MAX_CUSTOM_THEMES,
	MAX_THEME_DESCRIPTION_LENGTH,
	MAX_THEME_NAME_LENGTH,
	MAX_TOKEN_VALUE_LENGTH,
	MAX_WALLPAPER_DATA_URL,
	SETTINGS_NAMESPACE,
	THEME_FILE_FORMAT,
	THEME_FILE_VERSION,
	THEME_ID_PATTERN,
	WALLPAPER_DATA_URL,
	WALLPAPER_HEIGHT,
	WALLPAPER_MODE,
	WALLPAPER_MODES,
	WALLPAPER_NAME,
	WALLPAPER_OVERLAY,
	WALLPAPER_SURFACE,
	WALLPAPER_WIDTH,
	WALLPAPER_X,
	WALLPAPER_Y,
	WALLPAPER_ZOOM
} from "../shared/theme-file.ts";

/** One persisted custom theme — the file format minus nothing. */
const ThemeDefSchema = z.object({
	format: z.string().default(THEME_FILE_FORMAT),
	version: z.number().default(THEME_FILE_VERSION),
	id: z.string().pattern(THEME_ID_PATTERN).default(""),
	name: z.string().max(MAX_THEME_NAME_LENGTH).default(""),
	description: z.string().max(MAX_THEME_DESCRIPTION_LENGTH).default(""),
	colorScheme: z.union(["light", "dark"]).default("dark"),
	tokens: z.dict(z.string().max(MAX_TOKEN_VALUE_LENGTH)).default({}),
	wallpaper: z.string().max(MAX_WALLPAPER_DATA_URL).default("")
});

/**
 * The wallpaper record: a downscaled image data URL plus its crop and tint
 * settings (zoom/pan/opacity/surface translucency).
 */
const WallpaperSchema = z.object({
	[WALLPAPER_NAME]: z.string().max(128).default(""),
	[WALLPAPER_DATA_URL]: z.string().max(MAX_WALLPAPER_DATA_URL).default(""),
	[WALLPAPER_MODE]: z.union(WALLPAPER_MODES).default("dark"),
	// 0 = dimensions unknown (legacy records / placeholder); the client falls
	// back to a 16:9 aspect. Must satisfy the schema's own default: register()
	// resolves the default first and a default violating `min` throws.
	[WALLPAPER_WIDTH]: z.number().min(0).max(10000).default(0),
	[WALLPAPER_HEIGHT]: z.number().min(0).max(10000).default(0),
	[WALLPAPER_ZOOM]: z.number().min(1).max(3).default(1),
	[WALLPAPER_X]: z.number().min(0).max(100).default(50),
	[WALLPAPER_Y]: z.number().min(0).max(100).default(50),
	[WALLPAPER_OVERLAY]: z.number().min(0).max(0.85).default(0.45),
	[WALLPAPER_SURFACE]: z.number().min(0.3).max(1).default(0.65)
});

/** The whole settings section owned by this plugin. */
export const ThemeCenterSettingsSchema = z.object({
	[FIELD_ACTIVE]: z.string().max(64).default("system"),
	[FIELD_CUSTOM]: z.array(ThemeDefSchema).max(MAX_CUSTOM_THEMES).default([]),
	[FIELD_WALLPAPER]: WallpaperSchema
});

/** Required services (cordis fiber inject). */
export const inject = ["settings"];

/**
 * Register the durable settings section when a settings provider is composed.
 * @param ctx - host context that may acquire the settings service.
 */
export function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(settingsNamespace(SETTINGS_NAMESPACE), ThemeCenterSettingsSchema);
	});
}
