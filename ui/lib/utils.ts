import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SAFE_URL_PROTOCOLS = ["http:", "https:"]

/**
 * Return `url`'s href only if it is an absolute http(s) URL, otherwise `null`.
 * Documentation URLs are user-provided text that later flows into
 * `window.open`, so dangerous schemes (`javascript:`, `data:`, `vbscript:`)
 * must never reach a navigation call. Parsing via the URL constructor also
 * rejects scheme-less input and obfuscated schemes (leading whitespace, etc.).
 */
export function safeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol) ? parsed.href : null
  } catch {
    return null
  }
}
