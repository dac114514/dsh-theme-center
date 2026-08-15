/**
 * Diagnose the 发送快捷键 (composer busy-Enter) persistence:
 * open General settings, find the row, toggle the behavior, then check the
 * wire value, the yaml file, and restore after reload.
 * Run: node scripts/cdp-enter.mjs [debugPort] [appPort]
 */
const debugPort = process.argv[2] ?? "9224";
const appPort = process.argv[3] ?? "3090";

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
	if (result.exceptionDetails) return { exception: result.exceptionDetails.text, text: result.exceptionDetails.text };
	return result.result?.value;
}

async function describeNs(ns) {
	const body = JSON.stringify({ type: "client-request", rpcId: crypto.randomUUID(), method: "settings.describe", payload: {} });
	const response = await fetch(`http://127.0.0.1:${appPort}/api/settings.describe`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body
	});
	const json = await response.json();
	const found = json.result.value.namespaces.find((namespace) => namespace.ns === ns);
	if (found === undefined) return "NOT-EXPOSED";
	return JSON.stringify(found.value);
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

async function openGeneral() {
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
	await sleep(2500);
}

await send("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
await sleep(10000);
await openGeneral();

// Find the 发送快捷键 row: look for the text and its selector button.
const row = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const hit = buttons.find((b) => (b.textContent || '').includes('发送') || (b.textContent || '').includes('回车') || (b.textContent || '').includes('Enter'));
	if (!hit) return { found: false, buttons: buttons.map((b) => (b.textContent || '').trim()).filter(Boolean).slice(0, 40) };
	const menuAnchor = hit.closest('[class]') ? hit : hit;
	return { found: true, text: (hit.textContent || '').trim(), rowText: (hit.parentElement?.parentElement?.innerText || '').slice(0, 120) };
})()`);
console.log("ROW:", JSON.stringify(row, null, 2));

console.log("wire before:", await describeNs("ui-conversation"));

// Click the selector, then pick the second option (steer).
if (row.found) {
	await evaluate(`(() => {
		const buttons = [...document.querySelectorAll('button')];
		const hit = buttons.find((b) => (b.textContent || '').includes('发送') || (b.textContent || '').includes('回车') || (b.textContent || '').includes('Enter'));
		if (hit) hit.click();
		return 'ok';
	})()`);
	await sleep(1200);
	const menu = await evaluate(`(() => {
		const items = [...document.querySelectorAll('[role=menuitem], [role=option], li')].map((el) => (el.textContent || '').trim()).filter(Boolean);
		return items.slice(0, 20);
	})()`);
	console.log("MENU ITEMS:", JSON.stringify(menu));
	// Click the last option in the popup menu.
	const clicked = await evaluate(`(() => {
		const items = [...document.querySelectorAll('[role=menuitem], [role=option]')];
		if (items.length === 0) return 'no menu items';
		items[items.length - 1].click();
		return 'clicked ' + (items[items.length - 1].textContent || '').trim();
	})()`);
	console.log("MENU CLICK:", clicked);
	await sleep(2000);
}

console.log("wire after click:", await describeNs("ui-conversation"));

// Reload and check restore + yaml is checked separately by the caller.
await send("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
await sleep(10000);
await openGeneral();
const restored = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')];
	const hit = buttons.find((b) => (b.textContent || '').includes('发送') || (b.textContent || '').includes('回车') || (b.textContent || '').includes('Enter'));
	return hit ? (hit.textContent || '').trim() : null;
})()`);
console.log("ROW AFTER RELOAD:", restored);
process.exit(0);
