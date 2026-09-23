import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * fetch with a hard timeout (review finding F-07): a hung request — e.g. the
 * LLM-backed endpoints — must never leave UI state (spinners/disabled
 * buttons) stuck forever. Rejects with the standard AbortError, which
 * callers already surface through their existing error paths.
 */
export async function fetchWithTimeout(
  input: string,
  init?: RequestInit,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
