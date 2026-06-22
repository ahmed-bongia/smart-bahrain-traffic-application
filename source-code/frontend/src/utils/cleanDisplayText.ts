const MOJIBAKE_MARKER =
  /[\u00c3\u00c2\u00e2\u00f0\u0192\u00a2\u20ac\u0153\u2122\u2039\u00c5\u00b8]/;

export function cleanDisplayText(value?: string | null, fallback = "-") {
  const raw = (value ?? "").trim();
  if (!raw) return fallback;

  const markerIndex = raw.search(MOJIBAKE_MARKER);
  const cleaned = markerIndex >= 0 ? raw.slice(0, markerIndex).trim() : raw;

  return cleaned || fallback;
}