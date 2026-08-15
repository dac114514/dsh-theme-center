/**
 * Browser-side settings-bridge fallback for the `theme-center` namespace.
 *
 * DSH 0.1.0-rc.6 host-apiproxy serves only its hard-coded settings allowlist,
 * so `ctx.settingsScope.bind({ namespace: "theme-center" })` answers
 * `settings-not-exposed` and settles on `unavailable` — the plugin would load
 * but never persist theme/wallpaper choices. This binder wraps the official
 * scope: when it reports the namespace `ready`, the wrapper is a pass-through;
 * when it reports `unavailable` on a loopback connection, a bridge controller
 * takes over and serves the same `SettingsScope` contract from the plugin's
 * host-side bridge routes (`/api/dsh-theme-center`, see src/host/bridge.ts).
 * Remote browsers (non-loopback) never use the bridge, matching the official
 * process-local policy. On hosts whose apiproxy already exposes the namespace,
 * the official scope stays the primary transport and the bridge never
 * activates.
 */
import type { Context } from "@deepseek-ai/cordis";
import type {
	SettingsScope,
	SettingsScopeSnapshot,
	SettingsScopeSpec,
	SnapshotStore
} from "@deepseek-ai/dsh-client-runtime/client";
import { createSnapshotStore } from "@deepseek-ai/dsh-client-runtime/client";
import type {} from "@deepseek-ai/dsh-client-ui-settings/client";
import { SETTINGS_BRIDGE_PREFIX } from "../shared/bridge-protocol.ts";

/** The settings wire face the bridge controller consumes (mirrors the official face). */
interface BridgeSettingsFace {
	settings: {
		describe: (payload: Record<string, never>) => Promise<{ result: BridgeDescribeResult }>;
		mutate: (payload: BridgeMutateRequest) => Promise<{ result: BridgeMutateResult }>;
	};
}

/** Describe result, shaped like an official RPC result envelope. */
interface BridgeDescribeValue {
	namespaces: BridgeNamespaceView[];
	writable: boolean;
}
type BridgeDescribeResult =
	| { ok: true; value: BridgeDescribeValue }
	| { ok: false; code: string; message: string };

/** Mutate result, shaped like an official RPC result envelope. */
type BridgeMutateResult =
	| { ok: true; value: BridgeNamespaceView }
	| { ok: false; code: string; message: string };

/** One settings namespace view on the wire. */
interface BridgeNamespaceView {
	ns: string;
	schema: unknown;
	value: unknown;
	base?: unknown;
	user?: unknown;
	revision: number;
}

/** Mutate request body. */
interface BridgeMutateRequest {
	ns: string;
	ops: { op: "set" | "unset"; path: readonly string[]; value?: unknown }[];
	expectedRevision?: number;
}

/** One settled bridge POST, always shaped as an RPC result envelope. */
interface EnvelopedResult {
	result: BridgeDescribeResult | BridgeMutateResult;
}

/**
 * Build the fetch-backed settings face for the bridge routes. Network and
 * HTTP failures collapse into an ok:false envelope so the controller keeps
 * its unavailable state instead of throwing into plugin activation.
 * @param fetchFn - the fetch implementation (the global fetch on loopback).
 * @returns the settings face.
 */
function createBridgeApi(fetchFn: typeof fetch): BridgeSettingsFace {
	const post = async (path: string, body: unknown): Promise<EnvelopedResult> => {
		try {
			const response = await fetchFn(SETTINGS_BRIDGE_PREFIX + path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body)
			});
			if (!response.ok) return { result: { ok: false, code: "internal", message: "bridge HTTP " + response.status } };
			return { result: await response.json() as BridgeDescribeResult | BridgeMutateResult };
		} catch {
			return { result: { ok: false, code: "internal", message: "settings bridge unreachable" } };
		}
	};
	return {
		settings: {
			describe: async payload => post("/describe", payload) as Promise<{ result: BridgeDescribeResult }>,
			mutate: async payload => post("/mutate", payload) as Promise<{ result: BridgeMutateResult }>
		}
	};
}

/** Whether the current page is served over loopback (bridge eligibility). */
function isLoopbackPage(): boolean {
	const hostname = window.location.hostname;
	return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

/**
 * A minimal `SettingsScope` over the bridge face. Mirrors the official
 * controller's ordering (serialized queue, revision-fenced writes, recovery
 * read after a refusal) but trusts the Host-seam value without re-running the
 * wire-schema validation: the seam already validated it, and the plugin binds
 * without a narrowing decoder.
 */
class BridgeScopeController<T> implements SettingsScope<T> {
	private readonly store: SnapshotStore<SettingsScopeSnapshot<T>>;
	private tail: Promise<void> = Promise.resolve();
	private disposed = false;

	constructor(
		private readonly api: BridgeSettingsFace,
		private readonly spec: SettingsScopeSpec<T>
	) {
		this.store = createSnapshotStore<SettingsScopeSnapshot<T>>({
			status: "loading",
			value: undefined,
			base: undefined,
			user: undefined,
			revision: undefined,
			writable: false,
			mode: "host"
		});
	}

	getSnapshot(): SettingsScopeSnapshot<T> {
		return this.store.getSnapshot();
	}

	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}

	/** Queue one Host refresh; a newer read or user write suppresses stale publication. */
	load(): Promise<void> {
		return this.enqueue(() => this.read());
	}

	/** Queue one field write (see {@link SettingsScope.set} for the contract). */
	set(field: string, value: unknown): Promise<void> {
		return this.write([{ op: "set", path: [field], value }]);
	}

	/** Queue one field clear (see {@link SettingsScope.unset} for the contract). */
	unset(field: string): Promise<void> {
		return this.write([{ op: "unset", path: [field] }]);
	}

	private enqueue(operation: () => Promise<void>): Promise<void> {
		if (this.disposed) return Promise.resolve();
		const task = this.tail.then(async () => {
			if (this.disposed) return;
			await operation();
		});
		this.tail = task.catch(() => {});
		return task;
	}

	private write(ops: BridgeMutateRequest["ops"]): Promise<void> {
		return this.enqueue(async () => {
			const snapshot = this.store.getSnapshot();
			const revision = snapshot.revision;
			let response: { result: BridgeMutateResult };
			try {
				response = await this.api.settings.mutate({
					ns: this.spec.namespace,
					ops,
					...(revision === undefined ? {} : { expectedRevision: revision })
				});
			} catch {
				await this.read();
				return;
			}
			const result = response.result;
			if (!result.ok) {
				// A refusal (e.g. conflict) reloads Host state instead of mutating.
				await this.read();
				return;
			}
			this.accept(result.value, true, true);
		});
	}

	private async read(): Promise<void> {
		let response: { result: BridgeDescribeResult };
		try {
			response = await this.api.settings.describe({});
		} catch {
			return;
		}
		if (!response.result.ok || this.disposed) return;
		const { namespaces, writable } = response.result.value;
		const view = namespaces.find(candidate => candidate.ns === this.spec.namespace);
		if (view === undefined) {
			this.store.update(draft => {
				draft.status = "unavailable";
				draft.writable = writable;
			});
			return;
		}
		this.accept(view, true, writable);
	}

	private accept(view: BridgeNamespaceView, publish: boolean, writable: boolean): void {
		if (!publish) return;
		const decoded = this.spec.decode ? this.spec.decode(view.value) : (view.value as T | undefined);
		this.store.update(draft => {
			draft.status = "ready";
			draft.value = decoded;
			draft.base = view.base;
			draft.user = view.user;
			draft.revision = view.revision;
			draft.writable = writable;
		});
	}
}

/**
 * Bind one namespace scope, preferring the official transport and falling
 * back to the plugin's loopback bridge when the official scope reports the
 * namespace unavailable.
 * @param ctx - client context (provides the official settingsScope service).
 * @param spec - namespace contract.
 * @returns the composited scope.
 */
export function bindCompatSettingsScope<T>(ctx: Context, spec: SettingsScopeSpec<T>): SettingsScope<T> {
	const official = ctx.settingsScope.bind(spec);
	// Prime the bridge controller but keep it dormant until needed.
	const bridge = new BridgeScopeController<T>(createBridgeApi(fetch), spec);
	let active = official;

	// Watch the official scope: once it settles ready, pass through forever;
	// on unavailable at loopback, switch to the bridge controller.
	const disposer = official.subscribe(() => {
		const snapshot = official.getSnapshot();
		if (snapshot.status === "ready") {
			active = official;
			return;
		}
		if (snapshot.status === "unavailable" && isLoopbackPage()) {
			if (active !== bridge) {
				active = bridge;
				void bridge.load();
			}
			return;
		}
	});
	// Teardown the official subscription alongside the composite's lifetime is
	// left to the caller; the bridge holds no external resources to release.
	void disposer;

	return {
		getSnapshot: () => active.getSnapshot(),
		subscribe: listener => active.subscribe(listener),
		set: (field, value) => active.set(field, value),
		unset: field => active.unset(field)
	};
}
