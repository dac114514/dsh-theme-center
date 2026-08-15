/**
 * Wallpaper diagnostics: activates the wallpaper theme, inspects the
 * rendered background layer, and measures scroll frame times. Run:
 *   node scripts/cdp-wallpaper.mjs [debugPort]
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

// Click the wallpaper card (writes active=wallpaper to the real settings;
// the caller resets afterwards).
const clicked = await evaluate(`(() => {
	const root = document.querySelector('.dsh-tc-section');
	if (!root) return 'no section';
	const cards = [...root.querySelectorAll('.dsh-tc-card')];
	const wallpaper = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '自定义壁纸');
	if (!wallpaper) return 'no wallpaper card';
	wallpaper.click();
	return 'clicked wallpaper';
})()`);
console.log(`wallpaper: ${clicked}`);
await sleep(2500);

const layer = await evaluate(`(() => {
	const body = document.body;
	const before = getComputedStyle(body, '::before');
	const after = getComputedStyle(body, '::after');
	return {
		wallpaperAttr: body.hasAttribute('data-dsh-wallpaper'),
		darkAttr: body.hasAttribute('data-ds-dark-theme'),
		colorScheme: document.documentElement.style.colorScheme,
		before: {
			backgroundImage: before.backgroundImage.slice(0, 120),
			backgroundSize: before.backgroundSize,
			backgroundPosition: before.backgroundPosition,
			position: before.position,
			inset: before.inset,
			zIndex: before.zIndex
		},
		after: {
			background: after.background.slice(0, 120),
			zIndex: after.zIndex
		},
		baseToken: body.style.getPropertyValue('--dsw-alias-bg-base')
	};
})()`);
console.log("LAYER:", JSON.stringify(layer, null, 2));

// Scroll performance: scroll the settings dialog content for ~2.5s and
// count animation frames.
const perf = await evaluate(`(async () => {
	const scroller = (() => {
		const candidates = [...document.querySelectorAll('*')].filter((el) => el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY === 'auto');
		return candidates[candidates.length - 1] || document.scrollingElement;
	})();
	const frames = [];
	let last = performance.now();
	await new Promise((resolve) => {
		const step = (now) => {
			frames.push(now - last);
			last = now;
			if (scroller.scrollTop < scroller.scrollHeight - scroller.clientHeight) {
				scroller.scrollTop += 60;
			} else {
				scroller.scrollTop = 0;
			}
			if (frames.length < 150) requestAnimationFrame(step);
			else resolve();
		};
		requestAnimationFrame(step);
	});
	frames.shift();
	const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
	const worst = Math.max(...frames);
	const over33 = frames.filter((f) => f > 33.4).length;
	return { scrollerTag: scroller.tagName, avgMs: avg.toFixed(2), worstMs: worst.toFixed(1), framesOver33ms: over33, total: frames.length };
})()`);
console.log("PERF:", JSON.stringify(perf, null, 2));
process.exit(0);
