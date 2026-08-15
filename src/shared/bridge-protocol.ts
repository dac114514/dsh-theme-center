/**
 * Shared bridge protocol constants for the `theme-center` settings bridge.
 *
 * Both halves need the same route prefix: the host registers the loopback
 * routes under it (src/host/bridge.ts) and the browser falls back to them
 * through this prefix (src/client/compat-settings-scope.ts). Keeping the
 * literal in one place prevents the two sides from drifting.
 */

/** Bridge route prefix (same-origin, loopback-only). */
export const SETTINGS_BRIDGE_PREFIX = "/api/dsh-theme-center";
