/**
 * Detailed computed-style dump of every theme card preview. Run:
 *   node scripts/cdp-styles.mjs [debugPort]
 */
const debugPort = process.argv[2] ?? "9222";

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

const dump = await evaluate(`(() => {
	const root = document.querySelector('.dsh-tc-section');
	if (!root) return { found: false };
	const cards = [...root.querySelectorAll('.dsh-tc-card')];
	return {
		found: true,
		cards: cards.map((card, index) => {
			const name = (card.querySelector('.dsh-tc-name') || {}).textContent || '';
			const preview = card.querySelector('.dsh-tc-preview');
			const sidebar = card.querySelector('.dsh-tc-preview-sidebar');
			const bubble = card.querySelector('.dsh-tc-preview-bubble');
			const accent = card.querySelector('.dsh-tc-preview-accent');
			const cs = (el) => {
				if (!el) return null;
				const s = getComputedStyle(el);
				return { background: s.background, height: s.height, width: s.width, display: s.display, position: s.position };
			};
			return {
				index,
				name,
				preview: cs(preview),
				sidebar: cs(sidebar),
				bubble: cs(bubble),
				accent: cs(accent)
			};
		})
	};
})()`);
console.log(JSON.stringify(dump, null, 2));
process.exit(0);
