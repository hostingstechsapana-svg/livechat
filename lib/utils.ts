import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses a date string or timestamp into a Date object.
 * Handles null/undefined values and invalid dates gracefully.
 * @param dateInput - The date string, number, or Date object to parse
 * @param fallback - Optional fallback date if parsing fails
 * @returns A valid Date object or the fallback
 */
export function safeParseDate(dateInput: string | number | Date | null | undefined, fallback?: Date): Date {
  if (!dateInput) {
    return fallback || new Date();
  }

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? (fallback || new Date()) : dateInput;
  }

  const parsed = new Date(dateInput);
  return isNaN(parsed.getTime()) ? (fallback || new Date()) : parsed;
}

/**
 * Formats a date for display in chat messages.
 * Returns a safe time string or fallback text.
 * @param date - The date to format
 * @param fallbackText - Text to show if date is invalid
 * @returns Formatted time string
 */
export function formatMessageTime(date: Date | null | undefined, fallbackText: string = "N/A"): string {
  if (!date || isNaN(date.getTime())) {
    return fallbackText;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
