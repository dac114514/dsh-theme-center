/**
 * Persistence trace: click Claude → check wire → reload → check wire + DOM.
 * Run: node scripts/cdp-persist.mjs [debugPort] [appPort]
 */
const debugPort = process.argv[2] ?? "9223";
const appPort = process.argv[3] ?? "3090";
const appUrl = `http://127.0.0.1:${appPort}/`;

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

async function describeActive() {
	const body = JSON.stringify({ type: "client-request", rpcId: crypto.randomUUID(), method: "settings.describe", payload: {} });
	const response = await fetch(`http://127.0.0.1:${appPort}/api/settings.describe`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body
	});
	const json = await response.json();
	const tc = json.result.value.namespaces.find((namespace) => namespace.ns === "theme-center");
	return tc === undefined ? "MISSING" : tc.value.active;
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

async function openThemes() {
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
}

async function selectedName() {
	return evaluate(`(() => {
		const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => c.getAttribute('data-selected') === 'true');
		return card ? (card.querySelector('.dsh-tc-name') || {}).textContent : null;
	})()`);
}

await send("Page.navigate", { url: appUrl });
await sleep(10000);
await openThemes();
await evaluate(`(() => {
	const card = [...document.querySelectorAll('.dsh-tc-card')].find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === 'Claude 风格');
	if (card) card.click();
	return 'ok';
})()`);
await sleep(2500);
console.log("wire after click:", await describeActive());

await send("Page.navigate", { url: appUrl });
await sleep(10000);
console.log("wire after reload:", await describeActive());
await openThemes();
console.log("DOM selected after reload:", await selectedName());

// cleanup
await evaluate(`(() => {
	const b = [...document.querySelectorAll('.dsh-tc-system')][0];
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1500);
console.log("final wire:", await describeActive());
process.exit(0);
