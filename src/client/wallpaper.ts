/**
 * Wallpaper theme machinery.
 *
 * The wallpaper theme is built on demand from the persisted wallpaper record
 * (`{ name, dataUrl, mode, width, height, zoom, x, y, overlay, surface }`):
 * a translucent surface palette (so the image shows through every panel) plus
 * image tokens the injected stylesheet consumes.
 *
 * Cropping model: the image is rendered at "cover" size × zoom, positioned by
 * pan percentages (0% = left/top edge aligned, 100% = right/bottom edge
 * aligned). The exact pixel size depends on the viewport, so the controller
 * fills `--dsh-wallpaper-w/--dsh-wallpaper-h` at apply time (and on resize).
 * The picker pipeline (`processWallpaperFile`) downscales the chosen image on
 * a canvas and records its natural dimensions, keeping the settings document
 * small and the crop math exact.
 */
import {
	WALLPAPER_TOKENS,
	clamp,
	normalizeWallpaper
} from "../shared/theme-file.ts";

/** Max output width/height for a stored wallpaper (keeps settings.yaml sane). */
export const WALLPAPER_MAX_EDGE = 1440;

/** JPEG quality for the stored wallpaper. */
export const WALLPAPER_JPEG_QUALITY = 0.72;

/** The default wallpaper placeholder (rendered when no image was picked). */
export const WALLPAPER_PLACEHOLDER_IMAGE =
	"data:image/svg+xml;base64," +
	btoa(
		'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">' +
			'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
			'<stop offset="0" stop-color="#2b1e5e"/><stop offset="0.55" stop-color="#1b3a6b"/>' +
			'<stop offset="1" stop-color="#0f2027"/></linearGradient></defs>' +
			'<rect width="1440" height="810" fill="url(#g)"/>' +
			'<circle cx="1120" cy="200" r="120" fill="#f5e9ff" opacity="0.85"/>' +
			'<circle cx="1030" cy="172" r="55" fill="#ffffff" opacity="0.5"/>' +
			'<path d="M0 580 Q 360 500 720 580 T 1440 580 L 1440 810 L 0 810 Z" fill="#0c1420" opacity="0.55"/>' +
			"</svg>"
	);

/**
 * Compute the rendered pixel size of the wallpaper for one box.
 * Cover math: scale = max(boxW/imgW, boxH/imgH) × zoom.
 * @param boxW - container width in px.
 * @param boxH - container height in px.
 * @param wallpaper - normalized wallpaper record.
 * @returns `{ width, height }` in px.
 */
export function coverSizeFor(boxW, boxH, wallpaper) {
	const imgW = Number(wallpaper.width) > 0 ? Number(wallpaper.width) : 16;
	const imgH = Number(wallpaper.height) > 0 ? Number(wallpaper.height) : 9;
	const zoom = clamp(Number(wallpaper.zoom) || 1, 1, 3);
	const scale = Math.max(boxW / imgW, boxH / imgH) * zoom;
	return {
		width: Math.max(1, Math.round(imgW * scale)),
		height: Math.max(1, Math.round(imgH * scale))
	};
}

/**
 * Build the wallpaper theme definition for a wallpaper record.
 * Size tokens are placeholders here (`--dsh-wallpaper-w/h` are computed per
 * viewport by the controller at apply time).
 * @param value - the persisted wallpaper record (any shape; normalized here).
 * @returns a ThemeDef-shaped object with a translucent palette + image tokens.
 */
export function buildWallpaperTheme(value) {
	const wallpaper = normalizeWallpaper(value);
	const dark = wallpaper.mode === "dark";
	const surface = clamp(Number(wallpaper.surface) || 0.65, 0.3, 1);
	const overlay = clamp(Number(wallpaper.overlay) ?? (dark ? 0.45 : 0.35), 0, 0.85);
	const image = wallpaper.dataUrl ? `url("${wallpaper.dataUrl}")` : `url("${WALLPAPER_PLACEHOLDER_IMAGE}")`;
	// Translucent surface helper: rgba with the user's surface alpha.
	const surfaceColor = (r, g, b) => `rgba(${r}, ${g}, ${b}, ${surface.toFixed(3)})`;
	const overlayColor = (r, g, b) => `rgba(${r}, ${g}, ${b}, ${overlay.toFixed(3)})`;
	return {
		id: "wallpaper",
		name: wallpaper.name || "wallpaper",
		colorScheme: wallpaper.mode,
		wallpaper: true,
		tokens: {
			// Surfaces turn translucent so the image shows through; text and
			// accents stay solid for readability. The user controls surface
			// translucency and overlay strength.
			"--dsw-alias-bg-base": dark ? surfaceColor(10, 12, 16) : surfaceColor(250, 251, 253),
			"--dsw-alias-bg-layer-1": dark ? surfaceColor(16, 19, 26) : surfaceColor(255, 255, 255),
			"--dsw-alias-bg-layer-2": dark ? surfaceColor(22, 26, 35) : surfaceColor(255, 255, 255),
			"--dsw-alias-bg-layer-3": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
			"--dsw-alias-bg-overlay": dark ? overlayColor(12, 15, 22) : overlayColor(235, 238, 244),
			"--dsw-alias-bg-module-platform": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
			"--dsw-alias-border-l1": dark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.07)",
			"--dsw-alias-border-l2": dark ? "rgba(255, 255, 255, 0.13)" : "rgba(15, 23, 42, 0.13)",
			"--dsw-alias-border-l3": dark ? "rgba(255, 255, 255, 0.18)" : "rgba(15, 23, 42, 0.18)",
			"--dsw-alias-brand-primary": dark ? "#8ab4ff" : "#3b6fe0",
			"--dsw-alias-brand-text": dark ? "#8ab4ff" : "#3b6fe0",
			"--dsw-alias-button-primary-fill": dark ? "#5b8def" : "#3b6fe0",
			"--dsw-alias-button-primary-hover": dark ? "#7aa6ff" : "#2f5ecb",
			"--dsw-alias-button-info-fill": dark ? "#5b8def" : "#3b6fe0",
			"--dsw-alias-button-info-hover": dark ? "#7aa6ff" : "#2f5ecb",
			"--dsw-alias-button-elevated-fill": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
			"--dsw-alias-button-floating-fill": dark ? surfaceColor(22, 26, 35) : surfaceColor(255, 255, 255),
			"--dsw-alias-button-floating-hover": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
			"--dsw-alias-button-primary-dimmed": dark ? "rgba(91, 141, 239, 0.22)" : "rgba(59, 111, 224, 0.16)",
			"--dsw-alias-interactive-bg-hover": dark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.06)",
			"--dsw-alias-interactive-bg-active": dark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.11)",
			"--dsw-alias-label-primary": dark ? "#eceef2" : "#161a23",
			"--dsw-alias-label-secondary": dark ? "#a7adb8" : "#5c6470",
			"--dsw-alias-label-tertiary": dark ? "#6e7684" : "#8b93a1",
			"--dsw-alias-label-caption": dark ? "#6e7684" : "#8b93a1",
			"--dsw-alias-label-primary-foreground": dark ? "#0d1017" : "#ffffff",
			"--dsw-alias-markdown-code-block": dark ? "rgba(0, 0, 0, 0.28)" : "rgba(15, 23, 42, 0.06)",
			"--dsw-alias-markdown-inline-code": dark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)",
			"--dsw-alias-scrollbar-bg-l2": dark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.14)",
			"--dsw-alias-scrollbar-hover-l2": dark ? "rgba(255, 255, 255, 0.22)" : "rgba(15, 23, 42, 0.22)",
			"--dsw-alias-state-error-primary": dark ? "#ff8a80" : "#d5382f",
			"--dsw-alias-state-success-primary": dark ? "#69db7c" : "#1d9e54",
			"--dsw-alias-state-warn-primary": dark ? "#ffd54f" : "#c98a1b",
			"--dsw-alias-toast-bg": dark ? "rgba(20, 24, 32, 0.92)" : "rgba(22, 26, 35, 0.92)",
			"--dsw-alias-tooltip-bg": dark ? "rgba(20, 24, 32, 0.92)" : "rgba(22, 26, 35, 0.92)",
			"--dsw-specific-bubble": dark ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.55)",
			"--dsw-specific-bubble-highlight": dark ? "rgba(255, 255, 255, 0.13)" : "rgba(255, 255, 255, 0.7)",
			"--dsw-specific-input-major": dark ? surfaceColor(16, 19, 26) : surfaceColor(255, 255, 255),
			"--dsw-specific-menu": dark ? surfaceColor(28, 33, 44) : surfaceColor(255, 255, 255),
			"--dsw-specific-sidebar-fill": dark ? surfaceColor(8, 10, 14) : surfaceColor(235, 238, 244),
			"--dsw-specific-sidebar-nav-item-active": dark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.07)",
			"--dsw-specific-sidebar-nav-item-hover": dark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)",
			"--dsw-specific-sidebar-nav-item-active-accent": dark ? "rgba(138, 180, 255, 0.2)" : "rgba(59, 111, 224, 0.14)",
			[WALLPAPER_TOKENS.image]: image,
			[WALLPAPER_TOKENS.overlay]: overlayColor(8, 10, 14)
		}
	};
}

/**
 * Read, downscale and encode a chosen image file.
 * @param file - the picked image file.
 * @returns a promise of `{ dataUrl, width, height }`, or an error message.
 */
export function processWallpaperFile(file) {
	return new Promise((resolve, reject) => {
		if (!file || !/^image\//.test(file.type)) {
			reject(new Error("请选择图片文件。 / Please choose an image file."));
			return;
		}
		const reader = new FileReader();
		reader.onerror = () => reject(new Error("无法读取文件。 / Could not read the file."));
		reader.onload = () => {
			const image = new Image();
			image.onerror = () => reject(new Error("无法解码图片。 / Could not decode the image."));
			image.onload = () => {
				try {
					const scale = Math.min(1, WALLPAPER_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
					const width = Math.max(1, Math.round(image.naturalWidth * scale));
					const height = Math.max(1, Math.round(image.naturalHeight * scale));
					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const context = canvas.getContext("2d");
					context.drawImage(image, 0, 0, width, height);
					// Flatten transparency onto a dark base so JPEG never
					// turns transparent pixels black.
					const flattened = document.createElement("canvas");
					flattened.width = width;
					flattened.height = height;
					const flat = flattened.getContext("2d");
					flat.fillStyle = "#10141c";
					flat.fillRect(0, 0, width, height);
					flat.drawImage(canvas, 0, 0);
					resolve({
						dataUrl: flattened.toDataURL("image/jpeg", WALLPAPER_JPEG_QUALITY),
						width,
						height
					});
				} catch (error) {
					reject(error instanceof Error ? error : new Error(String(error)));
				}
			};
			image.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	});
}
