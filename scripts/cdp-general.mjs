/** Dump the settings dialog content after clicking the General nav. */
const debugPort = process.argv[2] ?? "9224";

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

const clicked = await evaluate(`(() => {
	const nav = [...document.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '通用设置');
	if (!nav) return 'nav missing';
	nav.click();
	return 'clicked';
})()`);
console.log("nav:", clicked);
await sleep(2000);

const response = await send("Runtime.evaluate", {
	expression: `(() => {
		const dialogs = [...document.querySelectorAll('[role=dialog]')];
		const text = dialogs.length > 0 ? dialogs[0].innerText : document.body.innerText;
		return {
			dialogCount: dialogs.length,
			hasAppearance: text.includes('外观'),
			hasLanguage: text.includes('语言'),
			snippet: text.split('\\n').filter((line) => line.trim()).slice(0, 16).join(' | ')
		};
	})()`,
	returnByValue: true,
	awaitPromise: true
});
console.log("RAW:", JSON.stringify(response));
if (response.exceptionDetails) {
	console.log("EXC:", JSON.stringify(response.exceptionDetails).slice(0, 400));
}
const result = response.result?.value;
console.log("RESULT:", JSON.stringify(result, null, 2));
process.exit(0);
