# dsh-theme 主题文件格式

Theme Center 允许用户把自己编写的界面主题做成可移植的 JSON 文档 —— **dsh-theme
文件**。本文档是该格式的完整参考。

- 完整示例：[`examples/aurora.dsh-theme.json`](../examples/aurora.dsh-theme.json)
- 解析实现：[`src/client/parser.ts`](../src/client/parser.ts)
- 宿主端校验 schema：[`src/host/index.ts`](../src/host/index.ts)
- 可重新导入的内置主题存档：[`docs/archive/`](../docs/archive/)

---

## 1. 文件骨架

主题文件是一个 UTF-8 编码的 JSON 对象：

```json
{
  "format": "dsh-theme",
  "version": 1,
  "id": "aurora",
  "name": "Aurora",
  "description": "A deep violet night sky with a glowing accent.",
  "colorScheme": "dark",
  "tokens": {
    "--dsw-alias-bg-base": "#0d0b1e",
    "--dsw-alias-label-primary": "#ece9fb",
    "--dsw-specific-sidebar-fill": "#0a0918"
  },
  "wallpaper": "data:image/jpeg;base64,...."
}
```

## 2. 字段说明

| 字段 | 必填 | 类型 | 规则 |
| ---- | ---- | ---- | ---- |
| `format` | 是 | string | 必须是 `"dsh-theme"`。 |
| `version` | 是 | number | 必须是 `1`。 |
| `name` | 是 | string | 主题名称，最多 64 个字符。 |
| `id` | 否 | string | 小写 id：字母开头，仅含小写字母 / 数字 / 连字符，最多 64 位（`/^[a-z][a-z0-9-]{0,63}$/`）。缺省时按 `name` 自动生成（会给出提示）。不得与内置主题或已导入主题的 id 冲突。 |
| `description` | 否 | string | 最多 200 个字符。 |
| `colorScheme` | 是 | `"light"` \| `"dark"` | 主题所属的色系。 |
| `tokens` | 否 | object | CSS 变量名 → 值的映射（见 §3）。键必须以 `--` 开头；值为不超过 300 个字符的字符串。 |
| `wallpaper` | 否 | string | 图片 **data URL**（`data:image/png|jpeg|webp|gif|avif;base64,...`），上限 2.5 MB。可把背景图随主题一起内嵌。 |

未知字段会被**忽略并给出提示**（向前兼容）。

### 校验规则速览

导入解析器对不合法的文件会给出精确的中文 / 英文错误信息；只要导入成功，就保证
可以持久化并重新应用。要点：

- 根节点必须是 JSON 对象；
- `format` / `version` / `colorScheme` / `name` 必填且逐一校验；
- 非法的 `tokens` 键或值会被跳过并提示；
- `wallpaper` 存在时必须是合法图片 data URL 且不超过大小上限；
- 与内置或已导入主题同 id 会被拒绝。

## 3. tokens 详解

`tokens` 把 **CSS 自定义属性名**映射到值，合法目标分两类：

### 3.1 设计平台语义令牌（`--dsw-alias-*` / `--dsw-specific-*`）

这是 Web 应用设计平台（`lib/styles/design-platform.css`）声明的语义令牌，
也是**推荐**的换肤方式 —— 每个令牌对应一个具体界面表面。完整清单：

| 令牌 | 用途 | 示例值 |
| ---- | ---- | ------ |
| `--dsw-alias-bg-base` | 应用背景 | `#0d0b1e` |
| `--dsw-alias-bg-layer-1` | 一级表面 | `#121028` |
| `--dsw-alias-bg-layer-2` | 二级表面 | `#171434` |
| `--dsw-alias-bg-layer-3` | 三级表面 | `#1d1940` |
| `--dsw-alias-bg-overlay` | 弹层 / 遮罩背景 | `#241f4d` |
| `--dsw-alias-bg-module-platform` | 悬浮模块背景 | `#171434` |
| `--dsw-alias-bg-mask-1` | 强遮罩（壁纸可读性） | `rgba(0,0,0,0.24)` |
| `--dsw-alias-bg-mask-2` | 弱遮罩 | `rgba(0,0,0,0.12)` |
| `--dsw-alias-border-l1` | 发丝边框 | `rgba(196,181,253,0.08)` |
| `--dsw-alias-border-l2` | 常规边框 | `rgba(196,181,253,0.15)` |
| `--dsw-alias-border-l3` | 强边框 | `rgba(196,181,253,0.22)` |
| `--dsw-alias-brand-primary` | 品牌 / 强调色 | `#9f7aea` |
| `--dsw-alias-brand-text` | 品牌色文字 | `#9f7aea` |
| `--dsw-alias-button-primary-fill` | 主按钮填充 | `#7c5cd6` |
| `--dsw-alias-button-primary-hover` | 主按钮悬停 | `#9f7aea` |
| `--dsw-alias-button-elevated-fill` | 凸起按钮填充 | `#121028` |
| `--dsw-alias-button-floating-fill` | 悬浮按钮填充 | `#171434` |
| `--dsw-alias-button-floating-hover` | 悬浮按钮悬停 | `#1d1940` |
| `--dsw-alias-button-info-fill` | 信息按钮填充 | `#7c5cd6` |
| `--dsw-alias-button-info-hover` | 信息按钮悬停 | `#9f7aea` |
| `--dsw-alias-button-primary-dimmed` | 弱化主按钮 | `#1d1940` |
| `--dsw-alias-interactive-bg-hover` | 悬停高亮 | `rgba(196,181,253,0.06)` |
| `--dsw-alias-interactive-bg-active` | 激活高亮 | `rgba(196,181,253,0.1)` |
| `--dsw-alias-label-primary` | 一级文字 | `#ece9fb` |
| `--dsw-alias-label-secondary` | 二级文字 | `#a9a3cf` |
| `--dsw-alias-label-tertiary` | 三级文字 / 说明 | `#7b75a3` |
| `--dsw-alias-label-caption` | 标注文字 | `#7b75a3` |
| `--dsw-alias-label-primary-foreground` | 强调色上的文字 | `#ffffff` |
| `--dsw-alias-markdown-code-block` | 代码块背景 | `#171434` |
| `--dsw-alias-markdown-inline-code` | 行内代码背景 | `#1d1940` |
| `--dsw-alias-scrollbar-bg-l2` | 滚动条轨道 | `#1d1940` |
| `--dsw-alias-scrollbar-hover-l2` | 滚动条悬停 | `#262052` |
| `--dsw-alias-state-error-primary` | 错误色 | `#f87171` |
| `--dsw-alias-state-success-primary` | 成功色 | `#4ade80` |
| `--dsw-alias-state-warn-primary` | 警告色 | `#fbbf24` |
| `--dsw-alias-toast-bg` | Toast 背景 | `#241f4d` |
| `--dsw-alias-tooltip-bg` | 提示气泡背景 | `#241f4d` |
| `--dsw-specific-bubble` | 聊天气泡填充 | `#1d1940` |
| `--dsw-specific-bubble-highlight` | 高亮气泡 | `#262052` |
| `--dsw-specific-input-major` | 主要输入框填充 | `#121028` |
| `--dsw-specific-menu` | 菜单表面 | `#1d1940` |
| `--dsw-specific-sidebar-fill` | 侧边栏背景 | `#0a0918` |
| `--dsw-specific-sidebar-nav-item-active` | 侧边栏选中项 | `#1d1940` |
| `--dsw-specific-sidebar-nav-item-hover` | 侧边栏悬停项 | `#171434` |
| `--dsw-specific-sidebar-nav-item-active-accent` | 侧边栏选中强调 | `rgba(159,122,234,0.16)` |

> 表中示例值取自 `aurora` 示例，请使用你自己的配色。

### 3.2 自定义变量

任何其它 `--name` 变量同样合法，会被原样写入文档作为 CSS 自定义属性。这是高级
主题扩展平台的方式 —— 例如内置的**自定义壁纸**主题正是通过这类变量工作的：

```json
"tokens": {
  "--dsh-wallpaper-image": "url(data:image/jpeg;base64,....)",
  "--dsh-wallpaper-w": "1920px",
  "--dsh-wallpaper-h": "1080px",
  "--dsh-wallpaper-x": "50%",
  "--dsh-wallpaper-y": "50%",
  "--dsh-wallpaper-overlay": "rgba(8, 10, 14, 0.45)"
}
```

## 4. 从零编写一个主题

推荐按 §3.1 的语义令牌来构建调色板：

1. 选定**背景**（base）、2–3 个**表面**层级（surface）、**侧边栏**、**气泡**、
   **强调色**及其悬停色、**文字**颜色 —— 基本覆盖全部可见界面。
2. 映射到令牌上；边框 / 遮罩可用底色加透明度推导。
3. 在画廊里用「粘贴导入」即时验证 —— 解析结果与实时预览立即可见。

内置目录（`src/client/catalog.ts`）正是用扁平调色板 + 令牌展开来编写每个主题的，
是理解"一套协调配色长什么样"的最佳参考。

## 5. 导入 / 导出流程

- **导入** —— 设置 → 主题 →「导入主题」（选择 `.json` / `.dsh-theme.json` 文件）
  或「粘贴导入」（粘贴 JSON 文本后解析）。
- **导出** —— 每个导入主题的卡片都有「导出」按钮，会把主题重新下载为
  `{id}.dsh-theme.json`。
- **恢复存档主题** —— `docs/archive/*.dsh-theme.json` 是完整的 dsh-theme 文件，
  导入任意一个即可把该配色恢复为自定义主题。

## 6. 上限常量

| 常量 | 值 |
| ---- | -- |
| `THEME_FILE_VERSION` | `1` |
| `MAX_THEME_NAME_LENGTH` | 64 |
| `MAX_THEME_DESCRIPTION_LENGTH` | 200 |
| `MAX_TOKEN_VALUE_LENGTH` | 300 |
| `MAX_WALLPAPER_DATA_URL` | 2 500 000（约 1.9 MB 二进制） |
| `MAX_IMPORT_FILE_BYTES` | 4 000 000 |
| `MAX_CUSTOM_THEMES` | 30 |

权威常量与规范化工具见 [`src/shared/theme-file.ts`](../src/shared/theme-file.ts)。
