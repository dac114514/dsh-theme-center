/** Measure baseline scroll perf with the wallpaper switched off. */
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

await evaluate(`(() => {
	const cards = [...document.querySelectorAll('.dsh-tc-card')];
	const target = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '原版亮');
	if (target) target.click();
	return 'ok';
})()`);
await sleep(2000);

const perf = await evaluate(`(async () => {
	const scroller = [...document.querySelectorAll('*')].filter((el) => el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY === 'auto').pop() || document.scrollingElement;
	const frames = [];
	let last = performance.now();
	await new Promise((resolve) => {
		const step = (now) => {
			frames.push(now - last);
			last = now;
			if (scroller.scrollTop < scroller.scrollHeight - scroller.clientHeight) scroller.scrollTop += 60;
			else scroller.scrollTop = 0;
			if (frames.length < 150) requestAnimationFrame(step);
			else resolve();
		};
		requestAnimationFrame(step);
	});
	frames.shift();
	const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
	return {
		avgMs: avg.toFixed(2),
		worstMs: Math.max(...frames).toFixed(1),
		over33: frames.filter((f) => f > 33.4).length,
		total: frames.length,
		wallpaperAttr: document.body.hasAttribute('data-dsh-wallpaper')
	};
})()`);
console.log("BASELINE PERF:", JSON.stringify(perf));
process.exit(0);
