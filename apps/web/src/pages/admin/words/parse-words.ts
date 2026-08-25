/** Parse comma-separated restricted words: trim, drop empties, lowercase, dedupe. */
export function parseCommaSeparatedWords(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of input.split(",")) {
    const word = part.trim().toLowerCase();
    if (!word || seen.has(word)) continue;
    seen.add(word);
    result.push(word);
  }

  return result;
}
