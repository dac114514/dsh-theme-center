/**
 * Quick DOM probe: connects to the CDP page, waits, and reports what the app
 * shell looks like (buttons, root children, any error surface). Run:
 *   node scripts/cdp-probe.mjs [debugPort] [waitsMs]
 */
const debugPort = process.argv[2] ?? "9222";
const waitMs = Number(process.argv[3] ?? 8000);

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
if (!page) {
	console.error("no page target");
	process.exit(1);
}
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

console.log(`waiting ${waitMs}ms...`);
await sleep(waitMs);

const probe = await evaluate(`(() => {
	const buttons = [...document.querySelectorAll('button')].map((b) => ({
		text: (b.textContent || '').trim().slice(0, 40),
		title: b.title || '',
		aria: b.getAttribute('aria-label') || '',
		visible: b.offsetParent !== null
	}));
	const root = document.getElementById('root');
	return {
		title: document.title,
		bodyText: (document.body.innerText || '').slice(0, 300),
		buttonCount: buttons.length,
		buttons: buttons.slice(0, 25),
		rootChildren: root ? root.children.length : -1,
		hasErrorSurface: /出错了|错误|error/i.test(document.body.innerText || '')
	};
})()`);
console.log(JSON.stringify(probe, null, 2));
process.exit(0);
