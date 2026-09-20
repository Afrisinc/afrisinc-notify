/** Parses a comma-separated Cc input into a clean list of addresses, or undefined if empty. */
export function parseEmailList(value: string): string[] | undefined {
  const addresses = value
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  return addresses.length > 0 ? addresses : undefined;
}
