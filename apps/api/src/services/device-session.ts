import { DEVICE_SESSION, REDIS_KEYS, isValidDeviceId } from "@owly/shared";
import { redis } from "../lib/redis.js";
import { env } from "../env.js";
import { hashIP } from "../lib/token.js";
import {
  DEVICE_SESSION_ACQUIRE_SCRIPT,
  DEVICE_SESSION_REFRESH_SCRIPT,
  DEVICE_SESSION_RELEASE_SCRIPT,
} from "../lib/lua-scripts.js";

export interface DeviceSessionLockParams {
  sessionId: string;
  deviceId?: string;
  ip: string;
}

export interface DeviceSessionLockOptions {
  ttlSeconds?: number;
  ipLockEnabled?: boolean;
}

export function parseDeviceId(raw: string | null | undefined): string | undefined {
  if (!raw || !isValidDeviceId(raw)) return undefined;
  return raw;
}

export function deviceLockKey(deviceId: string): string {
  return `${REDIS_KEYS.ACTIVE_DEVICE}${deviceId}`;
}

export function ipLockKey(ip: string): string {
  return `${REDIS_KEYS.ACTIVE_IP}${hashIP(ip)}`;
}

function resolveOptions(options?: DeviceSessionLockOptions) {
  return {
    ttlSeconds: options?.ttlSeconds ?? env.DEVICE_SESSION_TTL_SECONDS,
    ipLockEnabled:
      options?.ipLockEnabled ?? env.DEVICE_SESSION_IP_LOCK_ENABLED,
  };
}

export function buildDeviceSessionLockKeys(
  params: DeviceSessionLockParams,
  options?: DeviceSessionLockOptions
): string[] {
  const { ipLockEnabled } = resolveOptions(options);
  const keys: string[] = [];
  const deviceId = parseDeviceId(params.deviceId);
  if (deviceId) {
    keys.push(deviceLockKey(deviceId));
  }
  if (ipLockEnabled && params.ip) {
    keys.push(ipLockKey(params.ip));
  }
  return keys;
}

async function evalLock(
  script: string,
  keys: string[],
  args: string[]
): Promise<number> {
  if (keys.length === 0) return 1;
  const result = await redis.eval(script, keys.length, ...keys, ...args);
  return Number(result);
}

export async function acquireDeviceSession(
  params: DeviceSessionLockParams,
  options?: DeviceSessionLockOptions
): Promise<boolean> {
  const { ttlSeconds } = resolveOptions(options);
  const keys = buildDeviceSessionLockKeys(params, options);
  const result = await evalLock(DEVICE_SESSION_ACQUIRE_SCRIPT, keys, [
    params.sessionId,
    String(ttlSeconds ?? DEVICE_SESSION.TTL_SECONDS),
  ]);
  return result === 1;
}

export async function refreshDeviceSession(
  params: DeviceSessionLockParams,
  options?: DeviceSessionLockOptions
): Promise<void> {
  const { ttlSeconds } = resolveOptions(options);
  const keys = buildDeviceSessionLockKeys(params, options);
  await evalLock(DEVICE_SESSION_REFRESH_SCRIPT, keys, [
    params.sessionId,
    String(ttlSeconds ?? DEVICE_SESSION.TTL_SECONDS),
  ]);
}

export async function releaseDeviceSession(
  params: DeviceSessionLockParams,
  options?: DeviceSessionLockOptions
): Promise<void> {
  const keys = buildDeviceSessionLockKeys(params, options);
  await evalLock(DEVICE_SESSION_RELEASE_SCRIPT, keys, [params.sessionId]);
}
