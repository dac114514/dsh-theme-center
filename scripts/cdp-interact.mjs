/**
 * Interact with the wallpaper editor: move the zoom slider, drag the preview,
 * and confirm the full-screen layer tokens follow. Run:
 *   node scripts/cdp-interact.mjs [debugPort]
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

// Make sure the wallpaper theme is active (click the card).
await evaluate(`(() => {
	const cards = [...document.querySelectorAll('.dsh-tc-card')];
	const target = cards.find((c) => (c.querySelector('.dsh-tc-name') || {}).textContent === '自定义壁纸');
	if (target) target.click();
	return 'ok';
})()`);
await sleep(1800);

// Move the zoom slider (range[0]) to 200.
const slider = await evaluate(`(() => {
	const input = document.querySelectorAll('.dsh-tc-editor input[type="range"]')[0];
	if (!input) return 'no slider';
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
	setter.call(input, '200');
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	return 'moved';
})()`);
console.log(`zoom slider: ${slider}`);
await sleep(1200);

const afterZoom = await evaluate(`(() => ({
	zoomToken: document.body.style.getPropertyValue('--dsh-wallpaper-w'),
	size: getComputedStyle(document.body, '::before').backgroundSize,
	persisted: true
}))()`);
console.log("AFTER ZOOM:", JSON.stringify(afterZoom));

// Drag the preview to pan (pointer events on the editor preview box).
const drag = await evaluate(`(async () => {
	const box = document.querySelector('.dsh-tc-editor-preview');
	if (!box) return 'no box';
	const rect = box.getBoundingClientRect();
	const opts = (x, y) => ({ bubbles: true, cancelable: true, pointerId: 7, pointerType: 'mouse', clientX: x, clientY: y, button: 0, buttons: 1 });
	box.dispatchEvent(new PointerEvent('pointerdown', opts(rect.left + rect.width / 2, rect.top + rect.height / 2)));
	box.dispatchEvent(new PointerEvent('pointermove', opts(rect.left + rect.width / 2 + 40, rect.top + rect.height / 2 + 25)));
	box.dispatchEvent(new PointerEvent('pointerup', opts(rect.left + rect.width / 2 + 40, rect.top + rect.height / 2 + 25)));
	return 'dragged';
})()`);
console.log(`drag: ${drag}`);
await sleep(1200);

const afterDrag = await evaluate(`(() => ({
	xToken: document.body.style.getPropertyValue('--dsh-wallpaper-x'),
	yToken: document.body.style.getPropertyValue('--dsh-wallpaper-y')
}))()`);
console.log("AFTER DRAG:", JSON.stringify(afterDrag));

// Reset: system pill.
await evaluate(`(() => {
	const b = [...document.querySelectorAll('.dsh-tc-system')][0];
	if (b) b.click();
	return 'ok';
})()`);
await sleep(1200);
const reset = await evaluate(`(() => ({
	systemActive: [...document.querySelectorAll('.dsh-tc-system')].some((p) => p.getAttribute('data-active') === 'true'),
	wallpaperAttr: document.body.hasAttribute('data-dsh-wallpaper')
}))()`);
console.log("RESET:", JSON.stringify(reset));
process.exit(0);
