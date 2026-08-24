export function normalizeInterest(interest: string): string {
  return interest.toLowerCase().trim();
}

/** Topic-queued users stay out of the random pool until the interest timeout elapses. */
export function shouldJoinGeneralQueue(
  interests: string[],
  queuedAt: number | undefined,
  interestTimeoutSeconds: number,
  now = Date.now()
): boolean {
  if (interests.length === 0) return true;
  if (queuedAt == null) return false;
  return now - queuedAt >= interestTimeoutSeconds * 1000;
}
