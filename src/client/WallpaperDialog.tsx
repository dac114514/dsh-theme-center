/**
 * WallpaperDialog — the "自定义壁纸" second-level window.
 *
 * A centered modal (primitives `Modal`, body-portaled) hosting the wallpaper
 * crop/tint editor. Streamlined compared to the old inline editor:
 *
 *  - the banner preview shows the ENTIRE image fitted, with a dashed frame
 *    marking the actual on-screen display area (the cover × zoom crop at the
 *    pan position); everything outside the frame is dimmed, so what you see
 *    inside the frame is exactly what the full-screen layer shows;
 *  - drag-to-pan moves the frame, wheel-zoom grows/shrinks it (position
 *    sliders were redundant with dragging and are gone);
 *  - three sliders remain: 缩放 (zoom), 遮罩 (overlay), 表面 (surface);
 *  - the tint mode is a two-way segmented control (暗色 / 亮色);
 *  - the footer holds 更换图片 / 清除壁纸 / 完成.
 *
 * Control styling is custom (track + thumb + segmented pill) rather than the
 * native range input look.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { IconPaperclipOutline16, IconTrashOutline16, Modal } from "@deepseek-ai/dsh-client-ui-primitives";
import {
	WALLPAPER_OVERLAY_MAX,
	WALLPAPER_SURFACE_MAX,
	WALLPAPER_SURFACE_MIN,
	WALLPAPER_ZOOM_MAX,
	WALLPAPER_ZOOM_MIN,
	clamp
} from "../shared/theme-file.ts";
import { WALLPAPER_PLACEHOLDER_IMAGE } from "./wallpaper.ts";

/** Measure an element's content box, updating on resize (for crop math). */
function useBoxSize(ref) {
	const [size, setSize] = useState({ width: 0, height: 0 });
	useLayoutEffect(() => {
		const element = ref.current;
		if (element === null) return;
		const update = () => {
			const rect = element.getBoundingClientRect();
			setSize((previous) =>
				previous.width === rect.width && previous.height === rect.height
					? previous
					: { width: rect.width, height: rect.height }
			);
		};
		update();
		const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
		observer?.observe(element);
		return () => observer?.disconnect();
	}, [ref]);
	return size;
}

/**
 * A slider whose thumb follows the pointer locally and commits to the store
 * on a short debounce. The store write round-trips through the settings
 * scope (host yaml → notification → re-render); without this draft layer a
 * controlled `value` would snap the thumb back to the pre-commit value on
 * every round trip — the "反复横跳" drag behavior.
 *
 * External changes (e.g. picking a new image resets zoom to 100%) still sync
 * the draft, because they change the store value away from the last commit.
 */
function useDraftSlider(storeValue, onChange) {
	const [draft, setDraft] = useState(storeValue);
	const lastRef = useRef(storeValue);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;
	const timerRef = useRef(undefined);
	useEffect(() => {
		if (storeValue !== lastRef.current) {
			lastRef.current = storeValue;
			setDraft(storeValue);
		}
	}, [storeValue]);
	useEffect(() => () => clearTimeout(timerRef.current), []);
	const commit = (value) => {
		setDraft(value);
		lastRef.current = value;
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => onChangeRef.current(value), 80);
	};
	const flush = () => {
		clearTimeout(timerRef.current);
		onChangeRef.current(lastRef.current);
	};
	return { draft, commit, flush };
}

/**
 * The wallpaper editor living inside the modal.
 * @param props - locale, wallpaper record, mutation actions.
 */
export function WallpaperDialog({
	t,
	wallpaper,
	updateWallpaper,
	setWallpaperMode,
	clearWallpaper,
	pickWallpaper,
	onClose
}) {
	const [dragging, setDragging] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const dragState = useRef(null);
	const boxRef = useRef(null);
	const fileRef = useRef(null);
	const box = useBoxSize(boxRef);

	const image = wallpaper.dataUrl !== "" ? wallpaper.dataUrl : WALLPAPER_PLACEHOLDER_IMAGE;
	const zoom = clamp(Number(wallpaper.zoom) ?? 1, WALLPAPER_ZOOM_MIN, WALLPAPER_ZOOM_MAX);
	const overlay = clamp(Number(wallpaper.overlay) ?? 0.45, 0, WALLPAPER_OVERLAY_MAX);
	const surface = clamp(Number(wallpaper.surface) ?? 0.65, WALLPAPER_SURFACE_MIN, WALLPAPER_SURFACE_MAX);
	const x = clamp(Number(wallpaper.x) ?? 50, 0, 100);
	const y = clamp(Number(wallpaper.y) ?? 50, 0, 100);

	// Local slider drafts: the thumb tracks the pointer immediately; the store
	// write is debounced, so the settings round trip never snaps it back.
	const zoomSlider = useDraftSlider(Math.round(zoom * 100), (value) => updateWallpaper({ zoom: value / 100 }));
	const overlaySlider = useDraftSlider(Math.round(overlay * 100), (value) => updateWallpaper({ overlay: value / 100 }));
	const surfaceSlider = useDraftSlider(Math.round(surface * 100), (value) => updateWallpaper({ surface: value / 100 }));

	// Banner preview geometry: the box shows the entire image fitted (aspect
	// preserved, centered) and a dashed frame marks the actual display area —
	// the cover × zoom crop at the pan position, the same math the
	// full-screen layer uses. Dragging pans the frame, the wheel resizes it.
	const imgW = Number(wallpaper.width) > 0 ? Number(wallpaper.width) : 16;
	const imgH = Number(wallpaper.height) > 0 ? Number(wallpaper.height) : 9;
	const fitted =
		box.width > 0 && box.height > 0
			? (() => {
					const fitScale = Math.min(box.width / imgW, box.height / imgH);
					const fitW = imgW * fitScale;
					const fitH = imgH * fitScale;
					const ox = (box.width - fitW) / 2;
					const oy = (box.height - fitH) / 2;
					const coverScale = Math.max(box.width / imgW, box.height / imgH) * zoom;
					const dispW = box.width / coverScale;
					const dispH = box.height / coverScale;
					return {
						fitW,
						fitH,
						ox,
						oy,
						frame: {
							left: ox + (imgW - dispW) * (x / 100) * fitScale,
							top: oy + (imgH - dispH) * (y / 100) * fitScale,
							width: dispW * fitScale,
							height: dispH * fitScale
						}
					};
				})()
			: null;

	const onPointerDown = (event) => {
		if (event.button !== 0) return;
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {
			// pointer capture is unavailable (synthetic events, edge cases)
		}
		event.preventDefault();
		dragState.current = { startX: event.clientX, startY: event.clientY, panX: x, panY: y };
		setDragging(true);
	};

	const onPointerMove = (event) => {
		const drag = dragState.current;
		const boxEl = boxRef.current;
		if (drag === null || boxEl === null || box.width <= 0 || box.height <= 0) return;
		const dx = ((event.clientX - drag.startX) / box.width) * 100;
		const dy = ((event.clientY - drag.startY) / box.height) * 100;
		updateWallpaper({ x: clamp(drag.panX + dx, 0, 100), y: clamp(drag.panY + dy, 0, 100) });
	};

	const onPointerUp = (event) => {
		dragState.current = null;
		setDragging(false);
		try {
			event.currentTarget.releasePointerCapture(event.pointerId);
		} catch {
			// capture may already be released
		}
	};

	const onWheel = (event) => {
		const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
		updateWallpaper({ zoom: clamp(zoom * factor, WALLPAPER_ZOOM_MIN, WALLPAPER_ZOOM_MAX) });
	};

	const onPick = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (file === undefined) return;
		setBusy(true);
		setError(null);
		try {
			await pickWallpaper(file);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setBusy(false);
		}
	};

	const field = (label, draft, displayText, min, max, step) => (
		<label className="dsh-tc-wp-field">
			<span className="dsh-tc-wp-field-label">
				{label}
				<span className="dsh-tc-wp-field-value">{displayText}</span>
			</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={String(draft.draft)}
				onChange={(event) => draft.commit(Number(event.target.value))}
				onPointerUp={draft.flush}
				onKeyUp={draft.flush}
				onBlur={draft.flush}
				style={
					{
						"--dsh-tc-wp-track": `linear-gradient(to right, var(--dsw-alias-brand-primary) 0%, var(--dsw-alias-brand-primary) ${Math.round(((draft.draft - min) / (max - min)) * 100)}%, var(--dsw-alias-border-l2) ${Math.round(((draft.draft - min) / (max - min)) * 100)}%, var(--dsw-alias-border-l2) 100%)`
					} as CSSProperties
				}
			/>
		</label>
	);

	return (
		<Modal
			open
			onClose={onClose}
			title={t("wallpaper.editorTitle")}
			closeLabel={t("wallpaper.close")}
			className="dsh-tc-wp-modal"
			contentClassName="dsh-tc-wp-content"
			footer={
				<div className="dsh-tc-wp-footer">
					<button type="button" className="dsh-tc-button" onClick={() => fileRef.current?.click()} disabled={busy}>
						<IconPaperclipOutline16 size={14} />
						{t("wallpaper.set")}
					</button>
					{wallpaper.dataUrl !== "" && (
						<button
							type="button"
							className="dsh-tc-button dsh-tc-button-danger"
							onClick={() => {
								clearWallpaper();
								onClose();
							}}
						>
							<IconTrashOutline16 size={14} />
							{t("wallpaper.clear")}
						</button>
					)}
					<span className="dsh-tc-toolbar-spacer" />
					<button type="button" className="dsh-tc-button dsh-tc-button-primary" onClick={onClose}>
						{t("wallpaper.done")}
					</button>
				</div>
			}
		>
			<div className="dsh-tc-wp-body">
				<div
					ref={boxRef}
					className={dragging ? "dsh-tc-editor-preview dsh-tc-wp-preview dsh-tc-dragging" : "dsh-tc-editor-preview dsh-tc-wp-preview"}
					style={
						fitted === null
							? { backgroundImage: `url("${image}")`, backgroundSize: "contain", backgroundPosition: "center" }
							: {
									backgroundImage: `url("${image}")`,
									backgroundSize: `${fitted.fitW}px ${fitted.fitH}px`,
									backgroundPosition: `${fitted.ox}px ${fitted.oy}px`
								}
					}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					onWheel={onWheel}
				>
					{fitted !== null && (
						<div
							className="dsh-tc-wp-frame"
							style={{
								left: fitted.frame.left,
								top: fitted.frame.top,
								width: fitted.frame.width,
								height: fitted.frame.height
							}}
						/>
					)}
					<p className="dsh-tc-editor-hint">{t("wallpaper.dragHint")}</p>
				</div>

				<div className="dsh-tc-wp-controls">
					<div className="dsh-tc-wp-sliders">
						{field(t("wallpaper.zoom"), zoomSlider, `${zoomSlider.draft}%`, WALLPAPER_ZOOM_MIN * 100, WALLPAPER_ZOOM_MAX * 100, 5)}
						{field(t("wallpaper.overlay"), overlaySlider, `${overlaySlider.draft}%`, 0, WALLPAPER_OVERLAY_MAX * 100, 1)}
						{field(t("wallpaper.surface"), surfaceSlider, `${surfaceSlider.draft}%`, WALLPAPER_SURFACE_MIN * 100, WALLPAPER_SURFACE_MAX * 100, 5)}
					</div>

					<div className="dsh-tc-wp-mode">
						<span className="dsh-tc-wp-mode-label">{t("wallpaper.mode")}</span>
						<div className="dsh-tc-wp-segmented" role="radiogroup" aria-label={t("wallpaper.mode")}>
							<button
								type="button"
								role="radio"
								aria-checked={wallpaper.mode === "dark"}
								data-active={wallpaper.mode === "dark" ? "true" : undefined}
								onClick={() => setWallpaperMode("dark")}
							>
								{t("wallpaper.mode.dark")}
							</button>
							<button
								type="button"
								role="radio"
								aria-checked={wallpaper.mode === "light"}
								data-active={wallpaper.mode === "light" ? "true" : undefined}
								onClick={() => setWallpaperMode("light")}
							>
								{t("wallpaper.mode.light")}
							</button>
						</div>
					</div>

					{error !== null && <p className="dsh-tc-feedback dsh-tc-feedback-error">{error}</p>}
				</div>

				<input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPick} />
			</div>
		</Modal>
	);
}
