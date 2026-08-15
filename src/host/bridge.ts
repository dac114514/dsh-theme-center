/**
 * Host-side settings bridge for the `theme-center` namespace.
 *
 * DSH 0.1.0-rc.6 host-apiproxy serves only its hard-coded settings allowlist
 * (`WEB_SETTINGS_NAMESPACES`), so a third-party namespace like `theme-center`
 * answers `settings-not-exposed` at the RPC boundary and the browser half
 * cannot persist theme/wallpaper choices. This bridge re-serves the namespace
 * through the host settings seam over a same-origin, loopback-only HTTP pair,
 * so the plugin persists on an unpatched host without editing
 * dsh-host-apiproxy. The handlers ride `ctx.settings`, which keeps the
 * official schema validation, revision fencing, persistence, and event
 * emission for free; the bridge only adds the exposure gate the apiproxy
 * normally provides. Error codes mirror the official RPC codes so the client
 * controller treats refusals exactly like an apiproxy answer. On hosts whose
 * apiproxy already exposes the namespace, the official settings scope stays
 * the primary transport and the client never touches the bridge.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import {
	SettingsConflictError,
	settingsNamespace,
	type SettingsDescriptor,
	type SettingsPathOp,
	type SettingsProvider
} from "@deepseek-ai/dsh-settings";
import type { WebRoute } from "@deepseek-ai/dsh-host-webserver";
import { SETTINGS_NAMESPACE } from "../shared/theme-file.ts";
import { SETTINGS_BRIDGE_PREFIX } from "../shared/bridge-protocol.ts";

/** Bridge route prefix (re-exported for callers that import from the host). */
export { SETTINGS_BRIDGE_PREFIX } from "../shared/bridge-protocol.ts";

/** One path-addressed settings edit, mirroring the official mutate op. */
interface BridgeSettingsOp {
	/** set stores a value at the path; unset drops the leaf. */
	op: "set" | "unset";
	/** Field path inside the namespace section. */
	path: readonly string[];
	/** Value for op set (absent for unset). */
	value?: unknown;
}

/** Wire view of one settings namespace (mirrors the official apiproxy view). */
export interface BridgeNamespaceView {
	/** The settings namespace name. */
	ns: string;
	/** Serialized schemastery schema (schema.toJSON()). */
	schema: unknown;
	/** Current resolved value (secrets redacted). */
	value: unknown;
	/** Registrant's composition base layer, when declared. */
	base?: unknown;
	/** Raw user section, when present and well-formed. */
	user?: unknown;
	/** Schema-declared secret positions (present under redaction). */
	secrets?: { path: readonly string[]; set: boolean }[];
	/** Monotonic revision of the user section this view was read at. */
	revision: number;
}

/** Describe result, shaped like an official RPC result envelope. */
export type BridgeDescribeResult =
	| { ok: true; value: { namespaces: BridgeNamespaceView[]; writable: boolean } }
	| { ok: false; code: string; message: string };

/** Mutate result, shaped like an official RPC result envelope. */
export type BridgeMutateResult =
	| { ok: true; value: BridgeNamespaceView }
	| { ok: false; code: string; message: string };

/** One settled bridge POST, always shaped as an RPC result envelope. */
export interface BridgeMutateRequest {
	/** The settings namespace to mutate (must be `theme-center`). */
	ns: string;
	/** Ordered path operations to apply. */
	ops: BridgeSettingsOp[];
	/** Revision the caller read; a namespace that moved past it refuses. */
	expectedRevision?: number;
}

/** Cap on JSON request bodies (a single mutate is tiny). */
const MAX_JSON_BODY_BYTES = 64 * 1024;

/** Loopback literal check plus browser same-origin markers. */
function isLoopbackRequest(request: IncomingMessage): boolean {
	const address = request.socket.remoteAddress;
	if (address !== "127.0.0.1" && address !== "::1" && address !== "::ffff:127.0.0.1") return false;
	const host = request.headers.host;
	if (typeof host !== "string") return false;
	let hostUrl: URL;
	try {
		hostUrl = new URL("http://" + host);
	} catch {
		return false;
	}
	if (hostUrl.hostname !== "127.0.0.1" && hostUrl.hostname !== "localhost" && hostUrl.hostname !== "[::1]") return false;
	if (request.headers["sec-fetch-site"] === "cross-site") return false;
	const origin = request.headers.origin;
	if (origin === undefined) return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}

/** One JSON response. */
function writeJson(res: ServerResponse, status: number, body: unknown): void {
	const payload = JSON.stringify(body);
	res.writeHead(status, { "content-type": "application/json; charset=utf-8", "referrer-policy": "no-referrer" });
	res.end(payload);
}

/** Read a JSON request body (undefined when too large or unparseable). */
async function readJsonBody(req: IncomingMessage): Promise<unknown> {
	const chunks: Buffer[] = [];
	let size = 0;
	for await (const chunk of req) {
		const buffer = chunk as Buffer;
		size += buffer.length;
		if (size > MAX_JSON_BODY_BYTES) return undefined;
		chunks.push(buffer);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
	} catch {
		return undefined;
	}
}

/** Project one settings descriptor onto the bridge wire view. */
function toView(descriptor: SettingsDescriptor): BridgeNamespaceView {
	return {
		ns: String(descriptor.ns),
		schema: descriptor.schema,
		value: descriptor.value,
		...descriptor.base === undefined ? {} : { base: descriptor.base },
		...descriptor.user === undefined ? {} : { user: descriptor.user },
		...descriptor.secrets === undefined ? {} : {
			secrets: descriptor.secrets.map(secret => ({ path: [...secret.path], set: secret.set }))
		},
		revision: descriptor.revision
	};
}

/** Map a seam failure onto the official-shaped refusal envelope. */
function failureOf(error: unknown): { ok: false; code: string; message: string } {
	if (error instanceof SettingsConflictError) {
		return { ok: false, code: "settings-conflict", message: error.message };
	}
	const message = error instanceof Error ? error.message : String(error);
	return { ok: false, code: "settings-rejected", message };
}

/** Dependencies of the bridge handlers. */
export interface BridgeDeps {
	/** The host settings seam (already injected). */
	settings: SettingsProvider;
}

/** The describe and mutate handlers the routes wrap. */
export interface BridgeHandlers {
	describe(): Promise<BridgeDescribeResult>;
	mutate(request: unknown): Promise<BridgeMutateResult>;
}

/**
 * Build the bridge handlers. Only the plugin's own namespace is ever served;
 * there is no external allowlist to read, because the bridge exists precisely
 * to expose the namespace an unpatched apiproxy refuses.
 * @param deps - the settings seam.
 * @returns the handlers.
 */
export function makeBridgeHandlers(deps: BridgeDeps): BridgeHandlers {
	return {
		async describe() {
			const descriptors = deps.settings.describe({ redactSecrets: true });
			const namespace = descriptors.find(descriptor => String(descriptor.ns) === SETTINGS_NAMESPACE);
			return {
				ok: true,
				value: {
					namespaces: namespace === undefined ? [] : [toView(namespace)],
					writable: deps.settings.writable !== false
				}
			};
		},
		async mutate(request) {
			const body = request as Partial<BridgeMutateRequest> | null;
			if (body === null || typeof body !== "object" || body.ns !== SETTINGS_NAMESPACE || !Array.isArray(body.ops)) {
				return { ok: false, code: "settings-rejected", message: "malformed bridge settings request" };
			}
			const expectedRevision = typeof body.expectedRevision === "number" ? body.expectedRevision : undefined;
			try {
				await deps.settings.mutate(
					settingsNamespace(SETTINGS_NAMESPACE),
					body.ops as SettingsPathOp[],
					expectedRevision
				);
			} catch (error) {
				return failureOf(error);
			}
			const descriptor = deps.settings.describe({ redactSecrets: true })
				.find(candidate => String(candidate.ns) === SETTINGS_NAMESPACE);
			if (descriptor === undefined) {
				return { ok: false, code: "internal", message: `settings namespace "${SETTINGS_NAMESPACE}" was disposed after the mutate` };
			}
			return { ok: true, value: toView(descriptor) };
		}
	};
}

/**
 * Build the loopback-only bridge routes.
 * @param deps - handler dependencies.
 * @returns the exact-path route registrations.
 */
export function makeBridgeRoutes(deps: BridgeDeps): WebRoute[] {
	const handlers = makeBridgeHandlers(deps);
	const guard = (req: IncomingMessage, res: ServerResponse): boolean => {
		if (!isLoopbackRequest(req)) {
			writeJson(res, 403, { error: "loopback requests only" });
			return false;
		}
		if (req.method !== "POST") {
			writeJson(res, 405, { error: "method not allowed: " + (req.method ?? "") });
			return false;
		}
		return true;
	};
	return [
		{
			kind: "exact",
			path: SETTINGS_BRIDGE_PREFIX + "/describe",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				writeJson(res, 200, await handlers.describe());
			}
		},
		{
			kind: "exact",
			path: SETTINGS_BRIDGE_PREFIX + "/mutate",
			handler: async (req, res) => {
				if (!guard(req, res)) return;
				const body = await readJsonBody(req);
				if (body === undefined) {
					writeJson(res, 400, { ok: false, code: "settings-rejected", message: "unreadable JSON body" });
					return;
				}
				writeJson(res, 200, await handlers.mutate(body));
			}
		}
	];
}
