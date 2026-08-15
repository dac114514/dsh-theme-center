/**
 * Smoke test: loads the built host + client bundles with minimal stubs and
 * exercises the controller (registry, restore, switching, theme/change
 * re-assert) without a browser. Run: `node scripts/smoke.mjs`.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

let failures = 0;
function check(condition, label) {
	if (condition) console.log(`  ok   ${label}`);
	else {
		failures += 1;
		console.error(`  FAIL ${label}`);
	}
}

/* ── DOM stub ─────────────────────────────────────────────────────────── */

function makeBody() {
	const styles = new Map();
	const attributes = new Map();
	return {
		style: {
			setProperty(name, value) {
				styles.set(name, value);
			},
			removeProperty(name) {
				styles.delete(name);
			}
		},
		setAttribute(name, value) {
			attributes.set(name, value);
		},
		removeAttribute(name) {
			attributes.delete(name);
		},
		_style: styles,
		_attrs: attributes
	};
}

function makeDocument() {
	const body = makeBody();
	const injectedTags = [];
	return {
		body,
		documentElement: { style: { colorScheme: "" } },
		createElement(tag) {
			return { tagName: tag, dataset: {}, textContent: "", style: {}, append() {}, remove() {} };
		},
		querySelector() {
			return null;
		},
		head: {
			appendChild(tag) {
				injectedTags.push(tag);
			}
		},
		_injectedTags: injectedTags
	};
}

/* ── external module stubs ────────────────────────────────────────────── */

const externals = {
	"react/jsx-runtime": { jsx: () => null, jsxs: () => null, Fragment: Symbol("fragment") },
	react: { useId: () => "smoke-id", useState: (v) => [v, () => {}], useRef: () => ({ current: null }) },
	"@deepseek-ai/dsh-client-runtime/client": {
		defineStore: (spec) => ({ spec, create: () => ({ actions: {}, getSnapshot: () => ({}), subscribe: () => () => {} }) })
	},
	"@deepseek-ai/dsh-client-ui-primitives": new Proxy(
		{},
		{ get: () => (props) => null }
	),
	"@deepseek-ai/dsh-client-ui-slots": {},
	"@deepseek-ai/dsh-client-ui-settings": {},
	"@deepseek-ai/dsh-client-ui-theme": {},
	"@deepseek-ai/dsh-client-connection": {},
	"@deepseek-ai/dsh-client-locale": {},
	"@deepseek-ai/dsh-api-remotes": {},
	"@deepseek-ai/cordis": {}
};

/* ── client bundle load (the __ModuleLoader__ envelope) ────────────────── */

let registered = null;
globalThis.window = {
	__ModuleLoader__: {
		load(record) {
			registered = record;
		}
	},
	innerWidth: 1280,
	innerHeight: 720,
	matchMedia: () => ({ matches: false }),
	addEventListener: () => {},
	removeEventListener: () => {}
};

const clientCode = readFileSync(join(root, "lib/client.js"), "utf8");
// Execute the envelope in this realm (it only registers the factory).
new Function("window", `${clientCode}\n`)(globalThis.window);
check(registered !== null && registered.id === "dsh-theme-center", "client bundle registers under dsh-theme-center");

const moduleExports = registered.factory((spec) => {
	if (!(spec in externals)) throw new Error(`smoke: unexpected external "${spec}"`);
	return externals[spec];
});
check(typeof moduleExports.apply === "function", "client exports apply");

/* ── fake theme runtime (mirrors dsh-client-ui-theme's ThemeRuntime) ───── */

function makeThemeRuntime(onPreferenceWrite) {
	const themes = [
		{ id: "light", colorScheme: "light", tokens: {} },
		{ id: "dark", colorScheme: "dark", tokens: {} }
	];
	let preference = "system";
	let revision = 0;
	const listeners = new Set();
	const snapshot = () => ({
		preference,
		active: themes.find((t) => t.id === (preference === "system" ? "light" : preference)),
		themes: [...themes],
		revision
	});
	const emit = () => {
		revision += 1;
		for (const listener of listeners) listener(snapshot());
	};
	return {
		themes,
		listeners,
		register(definition) {
			if (themes.some((t) => t.id === definition.id)) throw new Error(`duplicate theme ${definition.id}`);
			themes.push({ ...definition });
			emit();
			return () => {
				const index = themes.findIndex((t) => t.id === definition.id);
				if (index !== -1) themes.splice(index, 1);
				emit();
			};
		},
		setTheme(id) {
			if (preference === id) return;
			preference = id;
			emit();
			// Mirror the real wiring: setTheme writes the ui-theme settings
			// document, which notifies the ui-theme namespace scope.
			onPreferenceWrite?.(id);
		},
		getTheme() {
			return snapshot();
		},
		on(listener) {
			listeners.add(listener);
		}
	};
}

/* ── fake settings scope ──────────────────────────────────────────────── */

function makeScope(initial) {
	let value = initial;
	let revision = 0;
	const listeners = new Set();
	return {
		listeners,
		getSnapshot: () => ({ status: "ready", value, revision, base: value, user: value, writable: true }),
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		set(field, next) {
			value = { ...value, [field]: next };
			revision += 1;
			for (const listener of listeners) listener();
		},
		unset() {},
		load() {},
		_peek: () => value
	};
}

/* ── fake cordis ctx ──────────────────────────────────────────────────── */

function makeCtx() {
	const scopes = new Map();
	const theme = makeThemeRuntime((id) => {
		scopes.get("ui-theme")?.set("preference", id);
	});
	const effects = [];
	const changeListeners = [];
	const slotInjections = [];
	return {
		theme,
		scopes,
		effects,
		changeListeners,
		slotInjections,
		get(name) {
			if (name === "theme") return theme;
			throw new Error(`smoke: unexpected service get "${name}"`);
		},
		settingsScope: {
			bind(spec) {
				if (!scopes.has(spec.namespace)) {
					scopes.set(
						spec.namespace,
						makeScope(spec.namespace === "ui-theme" ? { preference: "system" } : { active: "system", custom: [], wallpaper: { name: "", dataUrl: "", mode: "dark" } })
					);
				}
				return scopes.get(spec.namespace);
			}
		},
		locale: {
			register() {},
			bind: () => (key) => key
		},
		slots: {
			register(options) {
				return options;
			},
			inject(key, callback) {
				slotInjections.push({ key, callback });
			}
		},
		on(event, listener) {
			if (event !== "theme/change") throw new Error(`smoke: unexpected event "${event}"`);
			changeListeners.push(listener);
		},
		effect(callback, label) {
			const disposer = callback();
			effects.push({ label, disposer });
			return disposer;
		}
	};
}

/* ── host bundle ──────────────────────────────────────────────────────── */

const host = await import(pathToFileURL(join(root, "lib/index.js")).href);
let registeredNs = null;
const hostCtx = {
	inject(deps, callback) {
		check(JSON.stringify(deps) === JSON.stringify(["settings"]), "host injects [settings]");
		callback({
			settings: {
				register(ns, schema) {
					registeredNs = { ns: String(ns), schema };
				}
			}
		});
	}
};
host.apply(hostCtx);
check(registeredNs !== null && registeredNs.ns === "theme-center", `host registers namespace ${registeredNs?.ns}`);
check(typeof registeredNs?.schema === "function" && registeredNs.schema.type === "object", "host schema is a schemastery object");
// The real settings provider resolves the schema against its own default
// before registering — a default that violates a field bound throws there
// (this exact bug killed persistence: wallpaper.width default 0 vs min 1).
let schemaDefaultResolved = true;
try {
	host.ThemeCenterSettingsSchema({});
} catch {
	schemaDefaultResolved = false;
}
check(schemaDefaultResolved, "host schema default resolves without throwing");

/* ── client apply + scenario ──────────────────────────────────────────── */

const document = makeDocument();
globalThis.document = document;
globalThis.btoa = (s) => Buffer.from(s, "binary").toString("base64");

const ctx = makeCtx();
moduleExports.apply(ctx);

check(ctx.theme.themes.length === 2 + 9, `catalog registered into theme runtime (${ctx.theme.themes.length - 2} new)`);
check(document.body._style.has("--dsw-alias-bg-base") === false, "no tokens applied before settings arrive");

// Deliver the settings document: active = "claude".
const scope = ctx.scopes.get("theme-center");
scope.set("active", "claude");
scope.set("custom", []);
scope.set("wallpaper", { name: "", dataUrl: "", mode: "dark" });

// The scheme-sync write (setTheme("light") during restore) already produced
// the first ui-theme scope notification (skipped by the latch; consumed by
// the next one). Deliver the initial-load notification for the pre-sync
// world: it must NOT be treated as user intent.
for (const listener of [...ctx.scopes.get("ui-theme").listeners]) listener();

check(ctx.theme.getTheme().preference === "system", "custom selection does not write the ui-theme preference (Appearance row is shadowed)");
check(document.documentElement.style.colorScheme === "light", "claude applies light color-scheme");
check(document.body._attrs.has("data-ds-dark-theme") === false, "claude removes the dark attribute");
check(document.body._style.get("--dsw-alias-bg-base") === "#faf9f5", "claude tokens applied to body");
check(scope._peek().active === "claude", "scheme sync did not clobber the custom selection");

// Presenter-style theme/change (built-in) → custom must be re-asserted.
for (const listener of ctx.changeListeners) listener(ctx.theme.getTheme());
check(document.body._style.get("--dsw-alias-bg-base") === "#faf9f5", "custom re-asserted after theme/change");

// Find the section registration and drive its inject face.
const section = ctx.slotInjections.find((entry) => entry.key === "settings.section");
check(section !== undefined, "settings.section slot injected");
const sectionOptions = section.callback();
check(sectionOptions?.id === "themes" && typeof sectionOptions.label === "function", `section id/label (${sectionOptions?.id})`);
const face = sectionOptions.inject({ sync: (patch) => {} });

face.setActive("tokyo-night");
// Persistence is debounced (400 ms); wait for the write to land.
await new Promise((resolve) => setTimeout(resolve, 450));
check(scope._peek().active === "tokyo-night", "selection persisted to settings (active=tokyo-night)");
check(document.documentElement.style.colorScheme === "dark", "tokyo-night applies dark color-scheme");
check(document.body._attrs.has("data-ds-dark-theme") === true, "tokyo-night sets the dark attribute");
check(document.body._style.get("--dsw-alias-bg-base") === "#1a1b26", "tokyo-night tokens applied");

// Built-in switch through the face.
face.setActive("light");
// paintBase repaints from the cached base palette — no preference round trip.
check(ctx.theme.getTheme().preference === "system", "built-in switch paints from the palette cache (no preference write)");
check(document.body._style.size === 0, "custom tokens retracted on built-in switch");

// Import a custom theme through the face.
const imported = face.importText(
	JSON.stringify({
		format: "dsh-theme",
		version: 1,
		name: "Smoke Theme",
		colorScheme: "dark",
		tokens: { "--dsw-alias-bg-base": "#123456", "--dsw-alias-label-primary": "#fedcba" }
	}),
	"en"
);
check(imported.ok === true, "theme file import accepted");
check(ctx.theme.themes.some((t) => t.id === "smoke-theme"), "imported theme registered (id from name)");
check(scope._peek().custom.length === 1, "imported theme persisted");
check(document.body._style.get("--dsw-alias-bg-base") === "#123456", "imported theme applied");

// Bad import rejected with a message.
const bad = face.importText('{"format":"dsh-theme","version":1,"colorScheme":"red"}', "en");
check(bad.ok === false && bad.message.length > 0, "invalid import rejected with message");

// Wallpaper switch.
face.setActive("wallpaper");
check(document.body._attrs.has("data-dsh-wallpaper") === true, "wallpaper attribute set");
check(document.body._style.has("--dsh-wallpaper-image") === true, "wallpaper image token applied");
check(document.body._style.has("--dsh-wallpaper-w") === true, "wallpaper cover-size token applied (viewport math)");

// Wallpaper crop/tint updates persist and re-apply.
face.updateWallpaper({ zoom: 1.5, x: 20, y: 80, overlay: 0.2, surface: 0.9 });
check(scope._peek().wallpaper.zoom === 1.5, "wallpaper zoom persisted");
check(scope._peek().wallpaper.surface === 0.9, "wallpaper surface persisted");
check(document.body._style.get("--dsh-wallpaper-x") === "20%", "wallpaper pan token re-applied");
check(document.body._style.get("--dsw-alias-bg-base") === "rgba(10, 12, 16, 0.900)", "surface opacity applied to tokens");

// A post-boot ui-theme write is a stale in-flight round trip: the Appearance
// row is shadowed (renders null) so it can never produce user intent, and the
// selection must not move. Wait for the wallpaper selection's debounced
// persist to land first.
await new Promise((resolve) => setTimeout(resolve, 450));
const themeScope = ctx.scopes.get("ui-theme");
themeScope.set("preference", "dark");
check(scope._peek().active === "wallpaper", "post-boot ui-theme write does not move the selection");

console.log(failures === 0 ? "\nSMOKE OK" : `\nSMOKE FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
