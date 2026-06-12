import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(str: string, maxLength = 15) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}