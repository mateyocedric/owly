const CHANNEL_NAME = "owly-device-session";

export type DeviceSessionChannelMessage =
  | { type: "claimed" }
  | { type: "released" };

function canUseBroadcastChannel(): boolean {
  return typeof BroadcastChannel !== "undefined";
}

/** UX-only: other same-origin tabs learn a session was claimed or released. */
export function publishDeviceSession(type: DeviceSessionChannelMessage["type"]) {
  if (!canUseBroadcastChannel()) return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type } satisfies DeviceSessionChannelMessage);
  channel.close();
}

export function subscribeDeviceSessionChannel(
  onMessage: (message: DeviceSessionChannelMessage) => void
): () => void {
  if (!canUseBroadcastChannel()) return () => {};
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<DeviceSessionChannelMessage>) => {
    if (event.data?.type === "claimed" || event.data?.type === "released") {
      onMessage(event.data);
    }
  };
  return () => channel.close();
}
