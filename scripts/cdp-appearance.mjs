/**
 * Verify the General-settings Appearance row is gone (shadowed) while other
 * rows remain. Run: node scripts/cdp-appearance.mjs [debugPort] [appPort]
 */
const debugPort = process.argv[2] ?? "9223";
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
await send("Page.enable");

await send("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
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

// The General section is the default settings page; dump its rows.
const general = await evaluate(`(() => {
	const root = document.querySelector('[class*="GeneralSection"]');
	const text = root ? root.innerText : document.body.innerText;
	return {
		found: !!root,
		hasAppearance: text.includes('外观'),
		hasAppearanceEn: text.includes('Appearance'),
		hasLanguage: text.includes('语言') || text.includes('Language'),
		text: (root ? root.innerText : '').slice(0, 400)
	};
})()`);
console.log("GENERAL:", JSON.stringify(general, null, 2));
process.exit(0);
