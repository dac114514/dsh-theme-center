/**
 * End-to-end verification of the rebuilt plugin in headless Chrome:
 * reload → open settings/主题 → dump preview + editor DOM → activate the
 * wallpaper → verify crop tokens → measure scroll perf → reset selection.
 * Run: node scripts/cdp-verify.mjs [debugPort] [appPort]
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

// Reload to pick up the rebuilt bundle.
await send("Page.navigate", { url: appUrl });
await sleep(10000);
await evaluate(`(() => {
	const b = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('打开侧边栏'));
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1200);
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
await sleep(1200);

// ── previews + editor DOM ────────────────────────────────────────────────
const dom = await evaluate(`(() => {
	const root = document.querySelector('.dsh-tc-section');
	if (!root) return { found: false };
	const preview = root.querySelector('.dsh-tc-preview');
	const sidebar = root.querySelector('.dsh-tc-preview-sidebar');
	const cards = [...root.querySelectorAll('.dsh-tc-card')];
	const wallpaperCard = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '自定义壁纸');
	return {
		found: true,
		cardCount: cards.length,
		previewInline: preview ? preview.getAttribute('style') : null,
		previewBg: preview ? getComputedStyle(preview).backgroundColor : null,
		sidebarBg: sidebar ? getComputedStyle(sidebar).backgroundColor : null,
		wallpaperCardPreviewBgImage: wallpaperCard ? getComputedStyle(wallpaperCard.querySelector('.dsh-tc-preview')).backgroundImage.slice(0, 60) : null,
		editor: !!root.querySelector('.dsh-tc-editor'),
		editorPreview: !!root.querySelector('.dsh-tc-editor-preview'),
		sliders: [...root.querySelectorAll('.dsh-tc-editor input[type="range"]')].map((i) => ({ min: i.min, max: i.max, value: i.value })),
		dragHint: (root.querySelector('.dsh-tc-editor-hint') || {}).textContent || null
	};
})()`);
console.log("DOM:", JSON.stringify(dom, null, 2));

// ── activate the wallpaper, verify crop tokens + perf ────────────────────
await evaluate(`(() => {
	const cards = [...document.querySelectorAll('.dsh-tc-card')];
	const target = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '自定义壁纸');
	if (target) target.click();
	return 'ok';
})()`);
await sleep(2500);

const layer = await evaluate(`(() => {
	const body = document.body;
	const before = getComputedStyle(body, '::before');
	return {
		attr: body.hasAttribute('data-dsh-wallpaper'),
		size: before.backgroundSize,
		position: before.backgroundPosition,
		wToken: body.style.getPropertyValue('--dsh-wallpaper-w'),
		hToken: body.style.getPropertyValue('--dsh-wallpaper-h'),
		xToken: body.style.getPropertyValue('--dsh-wallpaper-x'),
		overlayToken: body.style.getPropertyValue('--dsh-wallpaper-overlay')
	};
})()`);
console.log("LAYER:", JSON.stringify(layer, null, 2));

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
	return { avgMs: avg.toFixed(2), over33: frames.filter((f) => f > 33.4).length, total: frames.length };
})()`);
console.log("PERF(wallpaper on):", JSON.stringify(perf));

// ── reset selection to system (leave the shared settings clean) ─────────
await evaluate(`(() => {
	const b = [...document.querySelectorAll('.dsh-tc-system')][0];
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1500);
const active = await evaluate(`(() => {
	const pills = [...document.querySelectorAll('.dsh-tc-system')];
	return { systemActive: pills.some((p) => p.getAttribute('data-active') === 'true'), wallpaperAttr: document.body.hasAttribute('data-dsh-wallpaper') };
})()`);
console.log("RESET:", JSON.stringify(active));
process.exit(0);
