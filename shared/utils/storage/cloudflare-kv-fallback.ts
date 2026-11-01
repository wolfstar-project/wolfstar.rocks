import { defineDriver } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import memoryDriver from "unstorage/drivers/memory";

type CloudflareKVFallbackOptions = {
	/** Key prefix inside the namespace. */
	base?: string;
	/** Name of the Worker's KV namespace binding. */
	binding: string;
	/** Present when Nitro JSON-serializes the mount config into the driver factory. */
	driver?: string;
};

/**
 * Whether the Worker's bindings are reachable. Nitro's Cloudflare entry puts
 * them on `globalThis.__env__` when a request comes in, which is where the KV
 * driver looks for them.
 */
function hasBinding(name: string): boolean {
	const env: unknown = Reflect.get(globalThis, "__env__");
	return typeof env === "object" && env !== null && Reflect.get(env, name) !== undefined;
}

/**
 * Workers KV unstorage driver that falls back to memory while the binding is not
 * there. The build prerenders in Node with the same storage mounts, and a Worker
 * runs its plugins before the first request brings the bindings; there the KV
 * driver would throw on every call. The memory copy is per process, so it only
 * holds what those moments write.
 */
export default defineDriver((options: CloudflareKVFallbackOptions) => {
	const kv = cloudflareKVBindingDriver({
		binding: options.binding,
		...(options.base ? { base: options.base } : {}),
	});
	const memory = memoryDriver();
	const pick = () => (hasBinding(options.binding) ? kv : memory);

	return {
		name: "cloudflare-kv-fallback",
		options,
		hasItem: (key, opts) => pick().hasItem(key, opts),
		getItem: (key, opts) => pick().getItem(key, opts),
		setItem: (key, value, opts) => pick().setItem?.(key, value, opts),
		removeItem: (key, opts) => pick().removeItem?.(key, opts),
		getKeys: (base, opts) => pick().getKeys(base, opts),
		clear: (base, opts) => pick().clear?.(base, opts),
	};
});
