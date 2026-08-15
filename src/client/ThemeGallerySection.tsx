/**
 * ThemeGallerySection — the settings page behind the left-nav "主题" entry.
 *
 * Layout (right content column):
 *  - intro + toolbar (跟随系统 pill, import buttons);
 *  - 浅色 group: 3-column grid of light themes;
 *  - 暗色 group: 3-column grid of dark themes;
 *  - 自定义 group: the wallpaper card, a compact wallpaper row (更换图片 /
 *    编辑壁纸 → opens the second-level WallpaperDialog modal) and the paste
 *    import.
 *
 * Imported custom themes join the grid of their color scheme with a
 * 自定义 badge, plus per-card export/delete actions. Clicking any card
 * switches the theme immediately.
 *
 * Preview rendering follows the Edge-theme-card approach: each card's mock
 * (fixed layout + theme colors) is rendered into a PNG data URL on a canvas
 * and shown as a plain `<img>` — no CSS dependency, identical in every
 * engine.
 */
import { useEffect, useId, useRef, useState } from "react";
import {
	IconCheckOutline16,
	IconCloseOutline16,
	IconDownloadOutline16,
	IconEditOutline16,
	IconFollowsystemOutline16,
	IconPaperclipOutline16,
	IconPlusOutline16,
	IconTrashOutline16
} from "@deepseek-ai/dsh-client-ui-primitives";
import { CATALOG } from "./catalog.ts";
import { SETTINGS_NS } from "./locales.ts";
import { renderThemePreview } from "./preview.ts";
import { WALLPAPER_PLACEHOLDER_IMAGE } from "./wallpaper.ts";
import { WallpaperDialog } from "./WallpaperDialog.tsx";

/** Locale resolver used by actions that need copy outside the renderer. */
function localeOf() {
	const lang = typeof navigator !== "undefined" ? navigator.language : "zh";
	return lang.toLowerCase().startsWith("zh") ? "zh" : "en";
}

/** One grid card model. */
function cardModel(entry, t, custom) {
	const wallpaper = entry.id === "wallpaper";
	return {
		id: entry.id,
		name: wallpaper ? t("theme.wallpaper") : t(entry.nameKey),
		desc: wallpaper ? t("theme.wallpaper.desc") : t(entry.descKey),
		scheme: entry.colorScheme,
		preview: entry.preview,
		custom: custom === true
	};
}

/** Render the mini window mock inside a card (PNG data URL via canvas). */
function PreviewMock({ preview, wallpaperImage, wallpaper }) {
	const [url, setUrl] = useState(null);
	useEffect(() => {
		let cancelled = false;
		renderThemePreview(preview, {
			wallpaperImage,
			x: wallpaper?.x,
			y: wallpaper?.y,
			scheme: wallpaper?.mode
		}).then((dataUrl) => {
			if (!cancelled) setUrl(dataUrl);
		});
		return () => {
			cancelled = true;
		};
	}, [preview, wallpaperImage, wallpaper?.x, wallpaper?.y, wallpaper?.mode]);
	return (
		<div className="dsh-tc-preview">
			<img className="dsh-tc-preview-img" src={url ?? undefined} alt="" />
		</div>
	);
}

/**
 * Render the Theme settings section.
 * @param props - slot props: `t` (bound locale), `useStore` (state), plus the
 * inject face actions.
 * @returns the section element tree.
 */
export function ThemeGallerySection({ t, useStore, setActive, importText, removeCustom, exportTheme, pickWallpaper, updateWallpaper, setWallpaperMode, clearWallpaper }) {
	const state = useStore((value) => value);
	const locale = localeOf();
	const fileRef = useRef(null);
	const wallpaperFileRef = useRef(null);
	const [pasteOpen, setPasteOpen] = useState(false);
	const [pasteText, setPasteText] = useState("");
	const [feedback, setFeedback] = useState(null);
	const [wallpaperBusy, setWallpaperBusy] = useState(false);
	const [editorOpen, setEditorOpen] = useState(false);
	const formId = useId();

	const showFeedback = (kind, text) => setFeedback({ kind, text });

	// 浅色 / 深色 分区只展示内置主题（壁纸卡与导入主题除外，一律归「自定义」分区）。
	const lightCards = CATALOG.filter((entry) => entry.colorScheme === "light" && entry.id !== "wallpaper").map((entry) => cardModel(entry, t, false));
	const darkCards = CATALOG.filter((entry) => entry.colorScheme === "dark" && entry.id !== "wallpaper").map((entry) => cardModel(entry, t, false));
	const customCards = state.custom.map((theme) => ({
		id: theme.id,
		name: theme.name,
		desc: theme.description || t("custom"),
		scheme: theme.colorScheme,
		preview: previewOfCustom(theme),
		custom: true
	}));
	const wallpaperEntry = CATALOG.find((entry) => entry.id === "wallpaper");
	const wallpaperCard = wallpaperEntry === undefined ? null : cardModel(wallpaperEntry, t, false);

	const pickFile = (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (file === undefined) return;
		const reader = new FileReader();
		reader.onload = () => {
			const result = importText(String(reader.result), locale);
			if (result.ok) {
				showFeedback("ok", result.replaced ? t("import.replaced").replace("{name}", result.name) : t("import.ok").replace("{name}", result.name));
			} else {
				showFeedback("error", t("import.error").replace("{message}", result.message));
			}
		};
		reader.readAsText(file);
	};

	const parsePaste = () => {
		const result = importText(pasteText, locale);
		if (result.ok) {
			setPasteText("");
			setPasteOpen(false);
			showFeedback("ok", result.replaced ? t("import.replaced").replace("{name}", result.name) : t("import.ok").replace("{name}", result.name));
		} else {
			showFeedback("error", t("import.error").replace("{message}", result.message));
		}
	};

	const onRemove = (id, name) => {
		if (typeof window !== "undefined" && !window.confirm(t("delete.confirm").replace("{name}", name))) return;
		removeCustom(id, locale);
	};

	const onPickWallpaper = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (file === undefined) return;
		setWallpaperBusy(true);
		try {
			await pickWallpaper(file);
			showFeedback("ok", t("wallpaper.set"));
		} catch (error) {
			showFeedback("error", error instanceof Error ? error.message : String(error));
		} finally {
			setWallpaperBusy(false);
		}
	};

	const renderGrid = (cards) => (
		<div className="dsh-tc-grid">
			{cards.map((card) => {
				const selected = state.active === card.id;
				const wallpaperImage = card.id === "wallpaper" && state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : undefined;
				return (
					<button
						key={card.id}
						type="button"
						className="dsh-tc-card"
						data-selected={selected ? "true" : undefined}
						aria-pressed={selected}
						onClick={() => setActive(card.id)}
					>
						<PreviewMock
							preview={card.preview}
							wallpaperImage={wallpaperImage}
							wallpaper={card.id === "wallpaper" ? state.wallpaper : undefined}
						/>
						<div className="dsh-tc-meta">
							<span className="dsh-tc-name" title={card.desc}>
								{card.name}
							</span>
							{selected && (
								<span className="dsh-tc-badge" title={t("using")}>
									<IconCheckOutline16 size={12} />
								</span>
							)}
							<span className={card.custom ? "dsh-tc-badge dsh-tc-badge-custom" : "dsh-tc-badge"}>
								{card.custom ? t("custom") : t("builtin")}
							</span>
						</div>
						<p className="dsh-tc-desc">{card.desc}</p>
						{card.custom && (
							<div className="dsh-tc-card-actions">
								<button
									type="button"
									className="dsh-tc-icon-button"
									title={t("export.label")}
									onClick={(event) => {
										event.stopPropagation();
										exportTheme(card.id);
									}}
								>
									<IconDownloadOutline16 size={14} />
								</button>
								<button
									type="button"
									className="dsh-tc-icon-button dsh-tc-icon-button-danger"
									title={t("delete.label")}
									onClick={(event) => {
										event.stopPropagation();
										onRemove(card.id, card.name);
									}}
								>
									<IconTrashOutline16 size={14} />
								</button>
							</div>
						)}
					</button>
				);
			})}
		</div>
	);

	const systemActive = state.active === "system";

	return (
		<div className="dsh-tc-section">
			<div>
				<h2 className="dsh-tc-heading">{t("title")}</h2>
				<p className="dsh-tc-intro">{t("intro")}</p>
			</div>

			<div className="dsh-tc-toolbar">
				<button
					type="button"
					className="dsh-tc-system"
					data-active={systemActive ? "true" : undefined}
					onClick={() => setActive("system")}
				>
					<IconFollowsystemOutline16 size={14} />
					{t("followSystem")}
				</button>
				<span className="dsh-tc-toolbar-spacer" />
				<button type="button" className="dsh-tc-button" onClick={() => fileRef.current?.click()}>
					<IconPlusOutline16 size={14} />
					{t("import.open")}
				</button>
				<button type="button" className="dsh-tc-button" onClick={() => setPasteOpen((open) => !open)}>
					{pasteOpen ? <IconCloseOutline16 size={14} /> : <IconPaperclipOutline16 size={14} />}
					{pasteOpen ? t("import.cancel") : t("import.paste")}
				</button>
				<input
					ref={fileRef}
					type="file"
					accept=".json,application/json"
					style={{ display: "none" }}
					onChange={pickFile}
				/>
			</div>

			{pasteOpen && (
				<div className="dsh-tc-import">
					<label htmlFor={`${formId}-paste`} className="dsh-tc-wallpaper-hint">
						{t("import.pasteHint")}
					</label>
					<textarea
						id={`${formId}-paste`}
						className="dsh-tc-import-textarea"
						value={pasteText}
						placeholder={t("import.placeholder")}
						onChange={(event) => setPasteText(event.target.value)}
					/>
					<div>
						<button type="button" className="dsh-tc-button dsh-tc-button-primary" disabled={pasteText.trim() === ""} onClick={parsePaste}>
							{t("import.parse")}
						</button>
					</div>
				</div>
			)}

			{feedback !== null && (
				<p className={feedback.kind === "error" ? "dsh-tc-feedback dsh-tc-feedback-error" : "dsh-tc-feedback dsh-tc-feedback-ok"}>
					{feedback.text}
				</p>
			)}

			{lightCards.length > 0 && (
				<div className="dsh-tc-group">
					<h3 className="dsh-tc-group-title">{t("group.light")}</h3>
					{renderGrid(lightCards)}
				</div>
			)}

			{darkCards.length > 0 && (
				<div className="dsh-tc-group">
					<h3 className="dsh-tc-group-title">{t("group.dark")}</h3>
					{renderGrid(darkCards)}
				</div>
			)}

			<div className="dsh-tc-group">
				<h3 className="dsh-tc-group-title">{t("group.custom")}</h3>
				{wallpaperCard !== null && (
					<div className="dsh-tc-grid">
						<button
							type="button"
							className="dsh-tc-card"
							data-selected={state.active === "wallpaper" ? "true" : undefined}
							aria-pressed={state.active === "wallpaper"}
							onClick={() => setActive("wallpaper")}
						>
							<PreviewMock
								preview={wallpaperCard.preview}
								wallpaperImage={state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : undefined}
								wallpaper={state.wallpaper}
							/>
							<div className="dsh-tc-meta">
								<span className="dsh-tc-name">{wallpaperCard.name}</span>
								{state.active === "wallpaper" && (
									<span className="dsh-tc-badge">
										<IconCheckOutline16 size={12} />
									</span>
								)}
								<span className="dsh-tc-badge">{t("builtin")}</span>
							</div>
							<p className="dsh-tc-desc">{wallpaperCard.desc}</p>
						</button>
					</div>
				)}
				<div className="dsh-tc-wallpaper-row">
					<div
						className="dsh-tc-wallpaper-thumb"
						style={{
							backgroundImage: `url("${state.wallpaper.dataUrl !== "" ? state.wallpaper.dataUrl : WALLPAPER_PLACEHOLDER_IMAGE}")`,
							backgroundSize: "cover",
							backgroundPosition: "center"
						}}
					/>
					<div className="dsh-tc-wallpaper-info">
						<span className="dsh-tc-wallpaper-name">
							{state.wallpaper.dataUrl !== "" ? state.wallpaper.name : t("wallpaper.none")}
						</span>
						<span className="dsh-tc-wallpaper-hint">{t("wallpaper.hint")}</span>
					</div>
					<div className="dsh-tc-card-actions">
						<button type="button" className="dsh-tc-button" onClick={() => setEditorOpen(true)}>
							<IconEditOutline16 size={14} />
							{t("wallpaper.edit")}
						</button>
						<button type="button" className="dsh-tc-button" onClick={() => wallpaperFileRef.current?.click()} disabled={wallpaperBusy}>
							<IconPaperclipOutline16 size={14} />
							{t("wallpaper.set")}
						</button>
						{state.wallpaper.dataUrl !== "" && (
							<button
								type="button"
								className="dsh-tc-icon-button dsh-tc-icon-button-danger"
								title={t("wallpaper.clear")}
								onClick={() => clearWallpaper()}
							>
								<IconTrashOutline16 size={14} />
							</button>
						)}
					</div>
				</div>
				<input
					ref={wallpaperFileRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={onPickWallpaper}
				/>
				{editorOpen && (
					<WallpaperDialog
						t={t}
						wallpaper={state.wallpaper}
						updateWallpaper={updateWallpaper}
						setWallpaperMode={setWallpaperMode}
						clearWallpaper={clearWallpaper}
						pickWallpaper={pickWallpaper}
						onClose={() => setEditorOpen(false)}
					/>
				)}
				{customCards.length > 0 && (
					<>
						<h4 className="dsh-tc-group-sub">{t("group.imported")}</h4>
						{renderGrid(customCards)}
					</>
				)}
			</div>
		</div>
	);
}

/** Derive preview swatches from an imported theme's tokens. */
function previewOfCustom(theme) {
	const token = (name, fallback) => {
		const value = theme.tokens?.[name];
		return typeof value === "string" && value !== "" ? value : fallback;
	};
	return {
		base: token("--dsw-alias-bg-base", theme.colorScheme === "dark" ? "#16161a" : "#f5f5f5"),
		surface: token("--dsw-alias-bg-layer-1", token("--dsw-alias-bg-base", "#ffffff")),
		sidebar: token("--dsw-specific-sidebar-fill", token("--dsw-alias-bg-base", "#eeeeee")),
		bubble: token("--dsw-specific-bubble", token("--dsw-alias-bg-layer-2", "#dddddd")),
		accent: token("--dsw-alias-brand-primary", theme.colorScheme === "dark" ? "#8ab4ff" : "#4176e6"),
		text: token("--dsw-alias-label-primary", theme.colorScheme === "dark" ? "#e6e6ea" : "#16161a")
	};
}
