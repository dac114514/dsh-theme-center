/**
 * The theme parsing tool — the "解析工具" of the plugin.
 *
 * `parseThemeFile` turns user-provided text (file contents or pasted JSON)
 * into a validated `ThemeDef`, with precise error/warning messages in the
 * user's language. `serializeTheme` is the inverse: it renders a theme back
 * to the portable dsh-theme JSON envelope for export.
 *
 * Validation rules (mirrored by the host settings schema):
 *  - root must be an object with `format: "dsh-theme"` and `version: 1`;
 *  - `id` is optional on import (derived from the name when absent);
 *  - `name` is required, ≤ 64 chars;
 *  - `colorScheme` ∈ { light, dark };
 *  - `tokens` maps `--name` keys to ≤ 300-char string values;
 *  - `wallpaper` (optional) must be an image data URL ≤ 2.5 MB;
 *  - unknown keys are ignored with a warning (forward compatibility).
 */
import {
	BUILTIN_THEME_IDS,
	isImageDataUrl,
	MAX_CUSTOM_THEMES,
	MAX_IMPORT_FILE_BYTES,
	MAX_THEME_DESCRIPTION_LENGTH,
	MAX_THEME_NAME_LENGTH,
	MAX_TOKEN_VALUE_LENGTH,
	MAX_WALLPAPER_DATA_URL,
	THEME_FILE_FORMAT,
	THEME_FILE_VERSION,
	THEME_ID_PATTERN
} from "../shared/theme-file.ts";

/** A parsed theme definition (the internal, persisted shape). */
export class ThemeDef {
	format;
	version;
	id;
	name;
	description;
	colorScheme;
	tokens;
	wallpaper;
	source;

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
}

/** Result of one parse attempt. */
export class ParseResult {
	theme;
	warnings;

	constructor(theme, warnings) {
		this.theme = theme; // ThemeDef | null
		this.warnings = warnings; // string[]
	}
}

/**
 * Parse and validate a dsh-theme document.
 * @param text - the raw JSON text.
 * @param takenIds - ids already occupied (built-ins + existing customs).
 * @param locale - `"zh"` | `"en"` for message copy.
 * @returns a ParseResult; `theme` is null when the document is rejected.
 */
export function parseThemeFile(text, takenIds, locale = "zh") {
	const t = (zh, en) => (locale === "zh" ? zh : en);
	const errors = [];
	const warnings = [];

	if (typeof text !== "string") {
		return new ParseResult(null, [t("输入内容不是文本。", "Input is not text.")]);
	}
	if (text.length > MAX_IMPORT_FILE_BYTES) {
		return new ParseResult(null, [t(`文件过大（上限 ${Math.round(MAX_IMPORT_FILE_BYTES / 1e6)} MB）。`, `File too large (limit ${Math.round(MAX_IMPORT_FILE_BYTES / 1e6)} MB).`)]);
	}
	let raw;
	try {
		raw = JSON.parse(text);
	} catch (error) {
		return new ParseResult(null, [t(`不是有效的 JSON：${error.message}`, `Not valid JSON: ${error.message}`)]);
	}
	if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
		return new ParseResult(null, [t("主题文件根节点必须是 JSON 对象。", "The theme file root must be a JSON object.")]);
	}
	if (raw.format !== THEME_FILE_FORMAT) {
		return new ParseResult(null, [t(`缺少 format 字段（应为 "${THEME_FILE_FORMAT}"）。`, `Missing format field (expected "${THEME_FILE_FORMAT}").`)]);
	}
	if (raw.version !== THEME_FILE_VERSION) {
		return new ParseResult(null, [t(`不支持的版本：${JSON.stringify(raw.version)}（当前支持 ${THEME_FILE_VERSION}）。`, `Unsupported version: ${JSON.stringify(raw.version)} (current support: ${THEME_FILE_VERSION}).`)]);
	}

	// name (required)
	if (typeof raw.name !== "string" || raw.name.trim().length === 0) {
		return new ParseResult(null, [t("缺少 name 字段（主题名称）。", "Missing name field (theme name).")]);
	}
	const name = raw.name.trim();
	if (name.length > MAX_THEME_NAME_LENGTH) {
		return new ParseResult(null, [t(`主题名称过长（最多 ${MAX_THEME_NAME_LENGTH} 个字符）。`, `Theme name too long (max ${MAX_THEME_NAME_LENGTH} characters).`)]);
	}

	// id (optional; derived from name when absent)
	let id;
	if (raw.id !== undefined && raw.id !== null && String(raw.id).trim() !== "") {
		const candidate = String(raw.id).trim();
		if (!THEME_ID_PATTERN.test(candidate)) {
			return new ParseResult(null, [
				t(
					`id "${candidate}" 不合法：需小写字母开头，仅含小写字母、数字与连字符（最多 64 位）。`,
					`id "${candidate}" is invalid: must start with a lowercase letter and contain only lowercase letters, digits and hyphens (max 64).`
				)
			]);
		}
		id = candidate;
	} else {
		id = slugFromName(name);
		warnings.push(t(`未提供 id，已根据名称生成 "${id}"。`, `No id provided; derived "${id}" from the name.`));
	}
	if (takenIds.includes(id)) {
		return new ParseResult(null, [
			t(`主题 id "${id}" 已被占用，请修改 id 或名称后重试。`, `Theme id "${id}" is already taken; change the id or name and try again.`)
		]);
	}

	// colorScheme (required)
	if (raw.colorScheme !== "light" && raw.colorScheme !== "dark") {
		return new ParseResult(null, [t('colorScheme 必须是 "light" 或 "dark"。', 'colorScheme must be "light" or "dark".')]);
	}
	const colorScheme = raw.colorScheme;

	// description (optional)
	const description = typeof raw.description === "string" ? raw.description.slice(0, MAX_THEME_DESCRIPTION_LENGTH) : "";

	// tokens (optional; validated)
	const tokens = {};
	if (raw.tokens !== undefined && raw.tokens !== null) {
		if (typeof raw.tokens !== "object" || Array.isArray(raw.tokens)) {
			return new ParseResult(null, [t("tokens 必须是对象（CSS 变量名到值的映射）。", "tokens must be an object (CSS variable name to value).")]);
		}
		for (const [key, value] of Object.entries(raw.tokens)) {
			if (!/^--[a-z0-9-]+$/i.test(key)) {
				warnings.push(t(`已忽略不合法的变量名 "${key}"（需以 -- 开头）。`, `Ignored invalid variable name "${key}" (must start with --).`));
				continue;
			}
			if (typeof value !== "string") {
				warnings.push(t(`已忽略变量 ${key}：值必须是字符串。`, `Ignored variable ${key}: value must be a string.`));
				continue;
			}
			if (value.length > MAX_TOKEN_VALUE_LENGTH) {
				warnings.push(t(`已忽略变量 ${key}：值超过 ${MAX_TOKEN_VALUE_LENGTH} 字符。`, `Ignored variable ${key}: value exceeds ${MAX_TOKEN_VALUE_LENGTH} characters.`));
				continue;
			}
			tokens[key] = value;
		}
	}

	// wallpaper (optional; image data URL)
	let wallpaper = "";
	if (raw.wallpaper !== undefined && raw.wallpaper !== null && raw.wallpaper !== "") {
		if (typeof raw.wallpaper !== "string" || !isImageDataUrl(raw.wallpaper)) {
			return new ParseResult(null, [t("wallpaper 必须是图片的 data URL（data:image/...;base64,...）。", "wallpaper must be an image data URL (data:image/...;base64,...).")]);
		}
		if (raw.wallpaper.length > MAX_WALLPAPER_DATA_URL) {
			return new ParseResult(null, [t("壁纸图片过大（data URL 上限 2.5 MB）。", "Wallpaper image too large (data URL limit 2.5 MB).")]);
		}
		wallpaper = raw.wallpaper;
	}

	// unknown keys → warning (forward compatibility)
	const known = new Set(["format", "version", "id", "name", "description", "colorScheme", "tokens", "wallpaper"]);
	for (const key of Object.keys(raw)) {
		if (!known.has(key)) warnings.push(t(`已忽略未知字段 "${key}"。`, `Ignored unknown field "${key}".`));
	}

	return new ParseResult(new ThemeDef({ id, name, description, colorScheme, tokens, wallpaper }), warnings);
}

/** Check that an imported id would not collide with anything in use. */
export function isIdTaken(id, customThemes) {
	return BUILTIN_THEME_IDS.includes(id) || customThemes.some((theme) => theme.id === id);
}

/** Serialize a theme back to the portable JSON envelope. */
export function serializeTheme(theme) {
	const document = {
		format: THEME_FILE_FORMAT,
		version: THEME_FILE_VERSION,
		id: theme.id,
		name: theme.name,
		description: theme.description ?? "",
		colorScheme: theme.colorScheme,
		tokens: theme.tokens ?? {},
		...(theme.wallpaper ? { wallpaper: theme.wallpaper } : {})
	};
	return JSON.stringify(document, null, 2);
}

/** Download a theme as a `.dsh-theme.json` file. */
export function downloadTheme(theme) {
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

/** Lower-case slug from a name (the import-time id derivation). */
function slugFromName(name) {
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/[^\x00-\x7f]/g, "")
		.slice(0, 60)
		.replace(/-+$/g, "");
	const withStart = /^[a-z]/.test(slug) ? slug : `t-${slug}`;
	return withStart.replace(/-+$/g, "");
}
