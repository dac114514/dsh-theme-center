/**
 * CDP driver: opens the dsh web UI in headless Chrome, navigates to the
 * Theme Center settings section and dumps diagnostics (console errors, the
 * section DOM, computed styles of the preview area). Run:
 *   node scripts/cdp-inspect.mjs <port>
 */
import { readFileSync } from "node:fs";

const port = process.argv[2] ?? "3090";
const debugPort = process.argv[3] ?? "9222";
const appUrl = `http://127.0.0.1:${port}/`;

let nextId = 1;
const pending = new Map();
let socket;

function send(method, params = {}) {
	return new Promise((resolve, reject) => {
		const id = nextId++;
		pending.set(id, { resolve, reject });
		socket.send(JSON.stringify({ id, method, params }));
		setTimeout(() => {
			if (pending.has(id)) {
				pending.delete(id);
				reject(new Error(`CDP timeout: ${method}`));
			}
		}, 20000);
	});
}

async function evaluate(expression) {
	const result = await send("Runtime.evaluate", {
		expression,
		returnByValue: true,
		awaitPromise: true
	});
	if (result.exceptionDetails) {
		return { exception: result.exceptionDetails.text };
	}
	return result.result?.value;
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── connect ─────────────────────────────────────────────────────────────

let targets = [];
for (let attempt = 0; attempt < 30; attempt += 1) {
	try {
		const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
		targets = await response.json();
		if (targets.length > 0) break;
	} catch {
		// devtools not up yet
	}
	await sleep(1000);
}
if (targets.length === 0) {
	console.error("CDP: no targets");
	process.exit(1);
}
const page = targets.find((target) => target.type === "page");
socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
	socket.onopen = resolve;
	socket.onerror = reject;
});
socket.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.id !== undefined && pending.has(message.id)) {
		const { resolve, reject } = pending.get(message.id);
		pending.delete(message.id);
		if (message.error) reject(new Error(message.error.message));
		else resolve(message.result);
	}
};

const consoleMessages = [];
const exceptions = [];
socket.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.id !== undefined && pending.has(message.id)) {
		const { resolve, reject } = pending.get(message.id);
		pending.delete(message.id);
		if (message.error) reject(new Error(message.error.message));
		else resolve(message.result);
		return;
	}
	if (message.method === "Runtime.consoleAPICalled") {
		consoleMessages.push(
			`[console.${message.params.type}] ` +
				message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" ")
		);
	}
	if (message.method === "Runtime.exceptionThrown") {
		exceptions.push(message.params.exceptionDetails.text);
	}
};

await send("Runtime.enable");
await send("Page.enable");

// ── navigate ────────────────────────────────────────────────────────────

await send("Page.navigate", { url: appUrl });
await sleep(9000);

const ready = await evaluate("document.readyState");
console.log(`page readyState: ${ready}`);

// Wait for the shell to mount.
for (let i = 0; i < 30; i += 1) {
	const mounted = await evaluate("!!document.querySelector('button')");
	if (mounted) break;
	await sleep(1000);
}

// ── open settings ───────────────────────────────────────────────────────

// The sidebar may start collapsed (rail): open it first so the settings
// trigger (foot row) is reachable and labeled.
const openedRail = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const target = buttons.find((b) => (b.getAttribute('aria-label') || '').includes('打开侧边栏'));
	if (!target) return 'no rail button';
	target.click();
	return 'rail opened';
})()`);
console.log(`rail: ${openedRail}`);
await sleep(1500);

const clickedSettings = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const matches = (b) =>
		(b.textContent || '').includes('设置') ||
		(b.textContent || '').includes('Settings') ||
		(b.getAttribute('aria-label') || '').includes('设置') ||
		(b.title || '').includes('设置');
	const target = buttons.find(matches);
	if (!target) return 'no settings button';
	target.click();
	return 'clicked';
})()`);
console.log(`settings trigger: ${clickedSettings}`);
await sleep(2500);

const navClicked = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const target = buttons.find((b) => (b.textContent || '').trim() === '主题');
	if (!target) return 'no theme nav';
	target.click();
	return 'clicked theme nav';
})()`);
console.log(`theme nav: ${navClicked}`);
await sleep(1500);

// ── diagnostics ─────────────────────────────────────────────────────────

const section = await evaluate(`(() => {
	const root = document.querySelector('.dsh-tc-section');
	if (!root) return { found: false };
	const preview = root.querySelector('.dsh-tc-preview');
	const computed = preview ? getComputedStyle(preview) : null;
	const cards = [...root.querySelectorAll('.dsh-tc-card')];
	return {
		found: true,
		cardCount: cards.length,
		previewFound: !!preview,
		previewHeight: computed ? computed.height : null,
		previewBackground: computed ? computed.background : null,
		previewInlineVars: preview ? preview.getAttribute('style') : null,
		firstCardHtml: cards[0] ? cards[0].outerHTML.slice(0, 800) : null,
		sectionHtmlHead: root.outerHTML.slice(0, 400),
		styleTags: [...document.querySelectorAll('style')].map((s) => s.dataset.pluginCss ?? s.id ?? 'anon').filter(Boolean)
	};
})()`);
console.log("SECTION:", JSON.stringify(section, null, 2));

const screenshot = await send("Page.captureScreenshot", { format: "png" });
if (screenshot.data) {
	const { writeFileSync } = await import("node:fs");
	writeFileSync(new URL(`../inspect-${port}.png`, import.meta.url), Buffer.from(screenshot.data, "base64"));
	console.log(`screenshot saved: inspect-${port}.png`);
}

console.log("\nCONSOLE MESSAGES:");
for (const message of consoleMessages) console.log("  " + message);
console.log("EXCEPTIONS:");
for (const exception of exceptions) console.log("  " + exception);

process.exit(0);
