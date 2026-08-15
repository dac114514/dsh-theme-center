/**
 * PNG theme-card previews — the Edge-theme-card approach: one fixed mock
 * layout (sidebar + chat bubbles + accent bar) rendered into a canvas with
 * each theme's colors, returned as a PNG data URL. Cards simply show an
 * `<img>`, so preview rendering depends on zero CSS and works identically in
 * every engine. Results are cached per key; wallpaper images are decoded
 * once and reused.
 */
import { clamp } from "../shared/theme-file.ts";
import { WALLPAPER_PLACEHOLDER_IMAGE } from "./wallpaper.ts";

/** Canvas backing size (2× for crispness). The card displays it with cover. */
export const PREVIEW_WIDTH = 260;
export const PREVIEW_HEIGHT = 120;

const cache = new Map();
const decodedImages = new Map();

/** Decode (and cache) an image element for a data URL. */
function decodedImage(src) {
	const cached = decodedImages.get(src);
	if (cached !== undefined) return cached;
	const promise = new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error("wallpaper preview decode failed"));
		image.src = src;
	});
	decodedImages.set(src, promise);
	return promise;
}

/** Round a rect path. */
function roundRect(context, x, y, width, height, radius) {
	const r = Math.min(radius, width / 2, height / 2);
	context.beginPath();
	context.moveTo(x + r, y);
	context.arcTo(x + width, y, x + width, y + height, r);
	context.arcTo(x + width, y + height, x, y + height, r);
	context.arcTo(x, y + height, x, y, r);
	context.arcTo(x, y, x + width, y, r);
	context.closePath();
}

/**
 * Render a theme-card preview PNG.
 * @param preview - `{ base, surface, sidebar, bubble, accent, text }` swatches.
 * @param options - optional wallpaper image (data URL) drawn behind the mock,
 * with the crop centered on `x`/`y` percent, plus `scheme` for the shade.
 * @returns a promise of a PNG data URL (cached by key).
 */
export async function renderThemePreview(preview, options = { wallpaperImage: undefined, x: 50, y: 50, scheme: "dark" }) {
	const { wallpaperImage, x = 50, y = 50, scheme = "dark" } = options;
	const key = `${preview.base}|${preview.sidebar}|${preview.bubble}|${preview.accent}|${wallpaperImage ?? ""}|${x}|${y}|${scheme}`;
	const cached = cache.get(key);
	if (cached !== undefined) return cached;

	const canvas = document.createElement("canvas");
	canvas.width = PREVIEW_WIDTH;
	canvas.height = PREVIEW_HEIGHT;
	const context = canvas.getContext("2d");

	if (wallpaperImage !== undefined) {
		try {
			const image = await decodedImage(wallpaperImage);
			const scale = Math.max(PREVIEW_WIDTH / image.naturalWidth, PREVIEW_HEIGHT / image.naturalHeight);
			const drawW = image.naturalWidth * scale;
			const drawH = image.naturalHeight * scale;
			const offsetX = ((PREVIEW_WIDTH - drawW) * clamp(x, 0, 100)) / 100;
			const offsetY = ((PREVIEW_HEIGHT - drawH) * clamp(y, 0, 100)) / 100;
			context.drawImage(image, offsetX, offsetY, drawW, drawH);
		} catch {
			context.fillStyle = preview.base;
			context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
		}
		context.fillStyle = scheme === "dark" ? "rgba(8, 10, 14, 0.32)" : "rgba(250, 251, 253, 0.25)";
		context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
	} else {
		context.fillStyle = preview.base;
		context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
	}

	// Sidebar.
	const sidebarW = Math.round(PREVIEW_WIDTH * 0.26);
	context.fillStyle = preview.sidebar;
	context.fillRect(0, 0, sidebarW, PREVIEW_HEIGHT);
	// Sidebar dots (accent).
	context.fillStyle = preview.accent;
	for (const dotY of [18, 34]) {
		context.beginPath();
		context.arc(12, dotY, 4, 0, Math.PI * 2);
		context.fill();
	}

	// Chat bubbles.
	const bubbleX = sidebarW + 16;
	const bubbleW = PREVIEW_WIDTH - bubbleX - 14;
	context.fillStyle = preview.bubble;
	for (const [bubbleY, bubbleH, bubbleInset] of [
		[16, 18, 0.42],
		[42, 18, 0.2],
		[68, 18, 0.32]
	]) {
		roundRect(context, bubbleX + bubbleW * bubbleInset, bubbleY, bubbleW * (1 - bubbleInset), bubbleH, 9);
		context.fill();
	}

	// Accent bar.
	context.fillStyle = preview.accent;
	roundRect(context, bubbleX, PREVIEW_HEIGHT - 26, 64, 10, 5);
	context.fill();

	const dataUrl = canvas.toDataURL("image/png");
	cache.set(key, dataUrl);
	return dataUrl;
}

/** The placeholder-gradient image used by the wallpaper card/editor. */
export function wallpaperPlaceholderUrl() {
	return WALLPAPER_PLACEHOLDER_IMAGE;
}
