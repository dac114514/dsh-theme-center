/**
 * Verify scheme-sync: clicking a custom theme must also move the built-in
 * ui-theme preference to the theme's color scheme, and the Appearance row
 * must be able to override back. Run: node scripts/cdp-sync.mjs [debugPort]
 */
const debugPort = process.argv[2] ?? "9223";

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
		}, 30000);
	});
}

async function evaluate(expression) {
	const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
	if (result.exceptionDetails) return { exception: result.exceptionDetails.text };
	return result.result?.value;
}

async function describeValue(ns) {
	const body = JSON.stringify({ type: "client-request", rpcId: crypto.randomUUID(), method: "settings.describe", payload: {} });
	const response = await fetch("http://127.0.0.1:3090/api/settings.describe", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body
	});
	const json = await response.json();
	const found = json.result.value.namespaces.find((namespace) => namespace.ns === ns);
	return found === undefined ? null : found.value;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let targets = [];
for (let attempt = 0; attempt < 20; attempt += 1) {
	try {
		const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
		targets = await response.json();
		if (targets.length > 0) break;
	} catch {}
	await sleep(1000);
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
await send("Runtime.enable");
await send("Page.enable");

await send("Page.navigate", { url: "http://127.0.0.1:3090/" });
await sleep(10000);
await evaluate(`(() => {
	const b = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('打开侧边栏'));
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1000);
await evaluate(`(() => {
	const b = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').includes('设置'));
	if (b) b.click();
	return 'ok';
})()`);
await sleep(2000);
await evaluate(`(() => {
	const b = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '主题');
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1500);

console.log("ui-theme pref before:", JSON.stringify(await describeValue("ui-theme")));

await evaluate(`(() => {
	const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '午夜蓝');
	if (card) card.click();
	return 'ok';
})()`);
await sleep(2500);
const afterDark = await describeValue("ui-theme");
console.log("ui-theme pref after 午夜蓝 (expect dark):", JSON.stringify(afterDark));

await evaluate(`(() => {
	const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === 'Claude 风格');
	if (card) card.click();
	return 'ok';
})()`);
await sleep(2500);
const afterLight = await describeValue("ui-theme");
console.log("ui-theme pref after Claude (expect light):", JSON.stringify(afterLight));

const domSelected = await evaluate(`(() => {
	const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => c.getAttribute('data-selected') === 'true');
	return card ? (card.querySelector('.dsh-tc-name') || {}).textContent : null;
})()`);
console.log("DOM selected:", domSelected);

// Appearance-row override back to dark must win over the custom theme.
await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const dark = buttons.find((b) => (b.textContent || '').includes('深色'));
	if (dark) dark.click();
	return 'ok';
})()`);
await sleep(2500);
const afterAppearance = await describeValue("ui-theme");
const domAfter = await evaluate(`(() => {
	const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => c.getAttribute('data-selected') === 'true');
	return card ? (card.querySelector('.dsh-tc-name') || {}).textContent : null;
})()`);
console.log("ui-theme pref after Appearance 深色:", JSON.stringify(afterAppearance), "| DOM selected:", domAfter);

// cleanup
await evaluate(`(() => {
	const b = [...document.querySelectorAll('.dsh-tc-system')][0];
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1500);
console.log("final theme-center:", JSON.stringify(await describeValue("theme-center")));
process.exit(0);
