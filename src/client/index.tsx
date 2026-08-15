/**
 * Theme Center — client half.
 *
 * Responsibilities:
 *  1. Register the curated catalog (and any imported custom themes) into the
 *     ui-theme runtime's theme registry, so every non-original theme is a
 *     first-class registered theme.
 *  2. Own the *selected* theme (persisted in the `theme-center` settings
 *     section). Built-in selections (`light`/`dark`/`system`) are delegated
 *     to the ui-theme runtime (`theme.setTheme`); custom themes are applied
 *     by this plugin directly (color-scheme + body palette attribute +
 *     token variables), because the runtime's preference field only accepts
 *     the three built-in values.
 *  3. Keep the DOM converging on the selected theme: ui-layout's presenter
 *     owns the built-in base palette, and this plugin re-applies the custom
 *     presentation after every `theme/change` while a custom theme is
 *     active. The General-settings Appearance row remains authoritative for
 *     the built-in preference: its writes surface through a scope on the
 *     `ui-theme` namespace (the first notification is the initial load and
 *     is ignored).
 *  4. Register the Theme settings section (left nav entry "主题") whose
 *     gallery grid (3 columns, light/dark separated) switches themes, plus
 *     import/export of dsh-theme files and the wallpaper picker.
 */
import { defineStore } from "@deepseek-ai/dsh-client-runtime/client";
import {
	BUILTIN_PREFERENCES,
	BUILTIN_THEME_IDS,
	FIELD_ACTIVE,
	FIELD_CUSTOM,
	FIELD_WALLPAPER,
	WALLPAPER_TOKENS,
	isBuiltinPreference,
	isWallpaperId,
	clamp,
	normalizeWallpaper,
	MAX_CUSTOM_THEMES,
	SETTINGS_NAMESPACE
} from "../shared/theme-file.ts";
import { CATALOG, catalogOf, materializeCatalog } from "./catalog.ts";
import { SETTINGS_NS, en, zh } from "./locales.ts";
import { ParseResult, downloadTheme, parseThemeFile, serializeTheme } from "./parser.ts";
import { injectStyles } from "./styles.ts";
import { ThemeGallerySection } from "./ThemeGallerySection.tsx";
import { buildWallpaperTheme, coverSizeFor, processWallpaperFile } from "./wallpaper.ts";

/** Dictionary namespace owned by this plugin. */
export { SETTINGS_NS };

/** Store shape mirrored into the gallery section. */
function createStore() {
	return defineStore({
		init: () => ({
			ready: false,
			active: "system",
			custom: [],
			wallpaper: normalizeWallpaper(undefined),
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

/** The body attribute selecting the dark base palette (mirrors ui-layout). */
const DARK_ATTRIBUTE = "data-ds-dark-theme";
/** The body attribute enabling the wallpaper surface (this plugin's stylesheet). */
const WALLPAPER_ATTRIBUTE = "data-dsh-wallpaper";

/** Materialized built-in catalog (palette → token maps), keyed by id. */
const CATALOG_BY_ID = new Map(materializeCatalog().map((entry) => [entry.id, entry]));

/**
 * Theme Center controller: owns state, the settings scopes, the theme
 * registry, and the DOM presentation. One instance per plugin fiber.
 */
class ThemeCenterController {
	/** Owning client context. */
	ctx;
	/** The ui-theme runtime (theme registry + built-in preference). */
	theme;
	/** Settings scope for this plugin's namespace. */
	scope;
	/** Read-only scope on the ui-theme namespace (Appearance-row intent). */
	themeScope;
	/** Controller-owned mirror state; the section store is synced on mount. */
	state;
	/** Bound store actions (available once the section mounts). */
	bound;
	/** Custom-theme registry disposers by theme id. */
	registered;
	/** Token variables this plugin wrote on <body> (its retraction set). */
	appliedTokens;
	/** First-notification latch for the ui-theme namespace scope. */
	themeScopeCount;
	/** Deferred persist timer for the active selection (debounced writes). */
	persistTimer;
	/** Timestamp of the user's freshest selection click (click-wins window). */
	lastUserSelectionAt;
	/** Timestamp of the freshest local wallpaper write (edit-wins window). */
	lastWallpaperWriteAt;

	constructor(ctx) {
		this.ctx = ctx;
		this.theme = ctx.get("theme");
		this.scope = ctx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
		this.themeScope = ctx.settingsScope.bind({ namespace: "ui-theme" });
		/** Controller-owned mirror state; the section store is synced on mount. */
		this.state = {
			ready: false,
			active: "system",
			custom: [],
			wallpaper: normalizeWallpaper(undefined),
			revision: 0
		};
		/** Bound store actions (available once the section mounts). */
		this.bound = undefined;
		/** Custom-theme registry disposers by theme id. */
		this.registered = new Map();
		/** Token variables this plugin wrote on <body> (its retraction set). */
		this.appliedTokens = [];
		/** First-notification latch for the ui-theme namespace scope. */
		this.themeScopeCount = 0;
		/** Deferred persist timer for the active selection (debounced writes). */
		this.persistTimer = undefined;
		/** Timestamp of the user's freshest selection click (click-wins window). */
		this.lastUserSelectionAt = 0;
		/** Timestamp of the freshest local wallpaper write (edit-wins window). */
		this.lastWallpaperWriteAt = 0;
	}

	/* ── store mirror ─────────────────────────────────────────────────── */

	publishState() {
		if (this.bound === undefined) return;
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
		if (catalogEntry !== undefined) return catalogEntry;
		return this.state.custom.find((theme) => theme.id === id);
	}

	/* ── theme registry ───────────────────────────────────────────────── */

	registerCustom(themeDef) {
		const previous = this.registered.get(themeDef.id);
		if (previous !== undefined) {
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
		if (disposer === undefined) return;
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
				// A sibling plugin may already own the id; the gallery keeps
				// working because selection applies tokens directly.
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

	/* ── selection ────────────────────────────────────────────────────── */

	/**
	 * Cache the shipped base palettes (light/dark token maps) from every
	 * `theme/change` snapshot the presenter applies. Corrections for stale
	 * ui-theme adoption repaint from this cache *without writing settings*,
	 * so a stale round trip can never amplify writes or flash a wrong palette.
	 */
	baseTokens = {};

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
		if (tokens === undefined) return false;
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
			// Paint the built-in palette from the cache when available — zero
			// settings writes, so rapid light/dark toggling never queues racing
			// round trips. On a cache miss the presenter paints via setTheme.
			if (this.paintBase(id)) return;
			this.retractCustom();
			const preference = this.theme.getTheme().preference;
			if (preference !== id) this.theme.setTheme(id);
			return;
		}
		const def = this.resolveDef(id);
		if (def === undefined) {
			// The selected id no longer resolves (deleted import): fall back
			// to the built-in preference so the UI never keeps a dead theme.
			this.setActive("system");
			return;
		}
		// Custom themes paint the document themselves. No scheme-sync write to
		// the ui-theme preference: that write round-tripped through the host
		// and the runtime's adopt() republished stale values, which fought the
		// selection during rapid switching (the flash). The Appearance row is
		// shadowed, so the preference's value is invisible anyway.
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
		if (snapshot.status !== "ready" || snapshot.value === undefined) return;
		const value = snapshot.value;
		const custom = Array.isArray(value.custom) ? value.custom : [];
		const wallpaper = normalizeWallpaper(value.wallpaper);
		const active = typeof value.active === "string" && value.active !== "" ? value.active : "system";
		const wallpaperChanged =
			wallpaper.dataUrl !== this.state.wallpaper.dataUrl || wallpaper.mode !== this.state.wallpaper.mode;
		this.state.custom = custom;
		this.state.ready = true;
		// Wallpaper edit-window: while a local wallpaper edit (slider drag,
		// pan, wheel zoom, pick, mode switch, clear) is in flight, the
		// notifications carry in-flight or stale copies of our own writes;
		// adopting them would revert the live preview and snap the editor
		// sliders back — the 滑块回弹 / 缩放回弹. The local state is
		// authoritative inside the window, exactly like the selection
		// click-wins window below.
		const recentWallpaperEdit = Date.now() - (this.lastWallpaperWriteAt ?? 0) < 400;
		if (!recentWallpaperEdit) {
			this.state.wallpaper = wallpaper;
			if (wallpaperChanged) this.refreshWallpaperRegistration();
		}
		this.publishState();
		this.reconcileCustom(custom);
		// Click-wins window: a notification carrying a value older than the
		// user's freshest click (an in-flight round trip landing late) must not
		// clobber the selection. Outside the window the document is adopted
		// freely (boot restore, remote browsers).
		const recentClick = Date.now() - (this.lastUserSelectionAt ?? 0) < 1000;
		if (!recentClick) {
			this.state.active = active;
			this.publishState();
			this.applyActive(active);
		}
	}

	/** ui-theme preference notifications (the first is the initial load). */
	adoptThemePreference() {
		this.themeScopeCount += 1;
		if (this.themeScopeCount === 1) return; // initial load, not user intent
		// The Appearance row is shadowed (renders null), custom themes never
		// write the preference, and built-ins paint from the palette cache, so
		// the preference is now fully derived from this plugin's own fallback
		// writes. A post-boot notification is always a stale in-flight write —
		// following it back would flip the selection (the switching flash).
	}

	/** Any theme/change: capture the base palette, then re-assert the selection. */
	onThemeChange(snapshot) {
		this.captureBase(snapshot);
		if (!this.state.ready) return;
		const active = this.state.active;
		if (isBuiltinPreference(active)) {
			// A stale ui-theme preference write (an in-flight settings round trip
			// from an earlier switch) can land after we switched: the runtime's
			// adopt() republishes the old scheme and the presenter paints it.
			// Repaint the selection from the cached base palette, write-free, in
			// the same dispatch — the wrong palette never survives a frame and
			// no correction write re-enters the round-trip queue (rapid
			// 自定义↔亮/暗 switching used to flicker and bounce back).
			if (snapshot.preference !== active) {
				if (!this.paintBase(active)) this.applyActive(active);
			}
			return;
		}
		const def = this.resolveDef(active);
		if (def !== undefined) this.applyCustom(def);
	}

	/* ── user actions (inject face) ───────────────────────────────────── */

	/** Import a dsh-theme document (file contents or pasted JSON). */
	importText(text, locale) {
		const taken = [...BUILTIN_THEME_IDS, ...this.state.custom.map((theme) => theme.id)];
		const result = parseThemeFile(text, taken, locale);
		if (result.theme === null) {
			return { ok: false, warnings: result.warnings, message: result.warnings[0] ?? "?" };
		}
		if (this.state.custom.length >= MAX_CUSTOM_THEMES && !this.state.custom.some((theme) => theme.id === result.theme.id)) {
			return { ok: false, warnings: [], message: locale === "zh" ? "自定义主题已达上限（30 个），请先删除一些。" : "Custom theme limit reached (30). Delete some first." };
		}
		const theme = result.theme;
		const replaced = this.state.custom.some((entry) => entry.id === theme.id);
		this.state.custom = replaced
			? this.state.custom.map((entry) => (entry.id === theme.id ? theme : entry))
			: [...this.state.custom, theme];
		this.publishState();
		this.reconcileCustom(this.state.custom);
		this.scope.set(FIELD_CUSTOM, this.state.custom);
		this.setActive(theme.id);
		return { ok: true, replaced, warnings: result.warnings, name: theme.name };
	}

	/** Remove an imported theme; the selection falls back to its scheme. */
	removeCustom(id, locale) {
		const theme = this.state.custom.find((entry) => entry.id === id);
		if (theme === undefined) return;
		this.state.custom = this.state.custom.filter((entry) => entry.id !== id);
		this.publishState();
		this.unregisterCustom(id);
		this.scope.set(FIELD_CUSTOM, this.state.custom);
		if (this.state.active === id) {
			// Fall back to the same color scheme's built-in; route through
			// setActive so the write shares the debounced persist path.
			const fallback = theme.colorScheme === "dark" ? "dark" : "light";
			this.setActive(fallback);
		}
	}

	/** Export an imported theme as a downloadable dsh-theme file. */
	exportTheme(id) {
		const theme = this.state.custom.find((entry) => entry.id === id);
		if (theme !== undefined) downloadTheme(theme);
	}

	/** Serialize a theme to text (used by the paste helper / preview). */
	serialize(id) {
		const theme = this.state.custom.find((entry) => entry.id === id);
		return theme === undefined ? null : serializeTheme(theme);
	}

	/** Downscale and store a picked wallpaper image (resets crop to fit). */
	async pickWallpaper(file) {
		const processed = (await processWallpaperFile(file)) as { dataUrl: string; width: number; height: number };
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
}

/** Required services (cordis fiber inject). */
export const inject = ["slots", "locale", "connection", "remote", "settingsScope", "theme"];

/**
 * Client plugin body.
 * @param ctx - client root context.
 */
export function apply(ctx) {
	injectStyles();
	const controller = new ThemeCenterController(ctx);
	const t = ctx.locale.bind(SETTINGS_NS);

	ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), "theme-center: section dictionaries");

	// Register the curated catalog + dynamic wallpaper theme into the
	// ui-theme registry (register() publishes; the presenter re-applies the
	// base palette and our change listener re-asserts custom themes).
	ctx.effect(() => {
		controller.registerBuiltins();
		return () => {
			clearTimeout(controller.persistTimer);
			for (const dispose of controller.registered.values()) dispose();
			controller.registered.clear();
			controller.retractCustom();
		};
	}, "theme-center: theme registry");

	// Seed the base-palette cache with the palette the presenter is currently
	// showing, then adopt the persisted settings immediately (the scope's
	// subscribe may not fire an initial notification, which would otherwise
	// leave the section on default wallpaper values after a reload).
	controller.captureBase(controller.theme.getTheme());
	controller.adoptSettings();

	// Settings document → state mirror (initial restore + own writes).
	ctx.effect(() => controller.scope.subscribe(() => controller.adoptSettings()), "theme-center: settings adoption");

	// ui-theme namespace → Appearance-row user intent (first notification is
	// the initial load and is skipped).
	ctx.effect(
		() => controller.themeScope.subscribe(() => controller.adoptThemePreference()),
		"theme-center: appearance preference adoption"
	);

	// theme/change → re-assert custom presentation (runs after ui-layout's
	// presenter because this plugin applies later in the roster).
	ctx.on("theme/change", (snapshot) => controller.onThemeChange(snapshot));

	// The Theme settings section (left nav "主题", gallery grid on the right).
	ctx.slots.inject("settings.section", () =>
		ctx.slots.register(
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

	// Viewport changes re-compute the wallpaper cover × zoom size while the
	// wallpaper theme is active (debounced).
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

	// Remove the shipped General-settings "外观" (Appearance) row: theme
	// selection now lives entirely in the 主题 section, and the row's three
	// cubes would otherwise fight the gallery for authority. The ui-theme
	// plugin registers it with default priority 0; registering the same cell
	// id at priority -1 shadows it (the slot system renders the lowest
	// priority winner), so the row renders nothing while the underlying
	// ui-theme.preference machinery stays intact (this plugin drives it).
	ctx.slots.inject("settings.general.item", () =>
		ctx.slots.register(
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
