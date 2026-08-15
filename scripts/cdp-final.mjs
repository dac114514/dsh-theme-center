/**
 * Final end-to-end verification: PNG previews, click-to-switch, persistence
 * across reload. Run: node scripts/cdp-final.mjs [debugPort] [appPort]
 */
const debugPort = process.argv[2] ?? "9222";
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

async function cardState() {
	return evaluate(`(() => {
		const root = document.querySelector('.dsh-tc-section');
		if (!root) return { found: false };
		const cards = [...root.querySelectorAll('.dsh-tc-card')];
		const imgs = [...root.querySelectorAll('.dsh-tc-preview-img')];
		return {
			found: true,
			cardCount: cards.length,
			imgCount: imgs.length,
			dataUrls: imgs.filter((img) => (img.getAttribute('src') || '').startsWith('data:image/png')).length,
			firstImgSrc: (imgs[0]?.getAttribute('src') || '').slice(0, 40),
			selected: cards.find((c) => c.getAttribute('data-selected') === 'true')?.querySelector('.dsh-tc-name')?.textContent ?? null
		};
	})()`);
}

// ── load + inspect previews ─────────────────────────────────────────────
await send("Page.navigate", { url: appUrl });
await sleep(10000);
await openThemes();
console.log("FIRST LOAD:", JSON.stringify(await cardState()));

// ── click Claude, verify persisted ──────────────────────────────────────
await evaluate(`(() => {
	const cards = [...document.querySelectorAll('.dsh-tc-card')];
	const target = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === 'Claude 风格');
	if (target) target.click();
	return 'ok';
})()`);
await sleep(2000);
console.log("AFTER CLICK:", JSON.stringify(await cardState()));

// ── reload, verify restore ──────────────────────────────────────────────
await send("Page.navigate", { url: appUrl });
await sleep(10000);
await openThemes();
console.log("AFTER RELOAD:", JSON.stringify(await cardState()));

// ── cleanup: back to system ─────────────────────────────────────────────
await evaluate(`(() => {
	const b = [...document.querySelectorAll('.dsh-tc-system')][0];
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1500);
console.log("RESET:", JSON.stringify(await cardState()));
process.exit(0);
