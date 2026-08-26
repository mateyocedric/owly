import { isValidDeviceId } from "@owly/shared";

const STORAGE_KEY = "owly_device_id";

function createDeviceId(): string {
  return crypto.randomUUID();
}

/** Persistent, privacy-conscious browser device id (UUID in localStorage). */
export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && isValidDeviceId(existing)) {
      return existing;
    }
    const id = createDeviceId();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return createDeviceId();
  }
}
