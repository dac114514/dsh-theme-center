/**
 * Build script for the dsh-theme-center plugin.
 *
 * Produces:
 *  - lib/client.js — the browser bundle, wrapped in the DSH client-module
 *    envelope (`window.__ModuleLoader__.load({ id, factory })`). Only
 *    `react`, `react/jsx-runtime` and `@deepseek-ai/*` stay external: those
 *    resolve from the shell's module registry at runtime.
 *  - lib/index.js  — the Node (host) entry. Bundled to ESM so the profile
 *    never has to resolve its internal imports; `@deepseek-ai/*` imports are
 *    also bundled in, keeping the installed package self-contained.
 *
 * Run with `pnpm build` (or `node build.mjs`). Output is deterministic:
 * `lib/client.js` carries no per-build hash, so a browser refresh after a
 * rebuild picks up the new bundle (HMR is disabled in the web profile).
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const CLIENT_ID = "dsh-theme-center";

/** Indent every line of a multi-line string by `pad` spaces. */
function indent(text, pad = "\t") {
	return text
		.split("\n")
		.map((line) => (line.length === 0 ? line : `${pad}${line}`))
		.join("\n");
}

/** Build the browser half and wrap it in the client-module envelope. */
async function buildClient() {
	const result = await build({
		entryPoints: [resolve(root, "src/client/index.tsx")],
		bundle: true,
		format: "cjs",
		platform: "browser",
		target: ["es2020"],
		jsx: "automatic",
		// Every `@deepseek-ai/*` import resolves from the shell's module
		// registry at runtime, exactly like the shipped bundles.
		external: [
			"react",
			"react/jsx-runtime",
			"@deepseek-ai/cordis",
			"@deepseek-ai/dsh-client-runtime/client",
			"@deepseek-ai/dsh-client-ui-primitives",
			"@deepseek-ai/dsh-client-ui-slots",
			"@deepseek-ai/dsh-client-ui-settings",
			"@deepseek-ai/dsh-client-ui-theme",
			"@deepseek-ai/dsh-client-connection",
			"@deepseek-ai/dsh-client-locale",
			"@deepseek-ai/dsh-api-remotes"
		],
		sourcemap: false,
		minify: false,
		logLevel: "warning",
		write: false
	});
	const code = result.outputFiles[0].text;
	const wrapped = [
		"window.__ModuleLoader__.load({",
		`\tid: ${JSON.stringify(CLIENT_ID)},`,
		"\tfactory: (require) => {",
		"\t\tvar module = { exports: {} };",
		"\t\tvar exports = module.exports;",
		'\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
		indent(code, "\t\t"),
		"\t\treturn module.exports;",
		"\t}",
		"});",
		""
	].join("\n");
	writeFileSync(resolve(root, "lib/client.js"), wrapped);
}

/** Build the Node half as self-contained ESM. */
async function buildHost() {
	const result = await build({
		entryPoints: [resolve(root, "src/host/index.ts")],
		bundle: true,
		format: "esm",
		platform: "node",
		target: ["node20"],
		sourcemap: false,
		minify: false,
		logLevel: "warning",
		write: false
	});
	writeFileSync(resolve(root, "lib/index.js"), result.outputFiles[0].text);
}

mkdirSync(resolve(root, "lib"), { recursive: true });
await buildClient();
await buildHost();
console.log("dsh-theme-center: lib/client.js + lib/index.js written");
