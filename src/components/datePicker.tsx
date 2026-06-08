import { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '../utils/cn'

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  min?: string
  className?: string
  placeholder?: string
}

const inputClassName =
  'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors placeholder:text-green-700/60 focus:border-green-500'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

function formatDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function isBeforeDay(a: Date, b: Date) {
  return a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() < b.getDate())
}

export default function DatePicker({
  value,
  onChange,
  min,
  className,
  placeholder,
}: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = min ? new Date(min + 'T00:00:00') : today

  const parsed = parseDate(value)
  const [viewDate, setViewDate] = useState(parsed ?? today)
  const [open, setOpen] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)


  const handlePrev = () => setViewDate(new Date(year, month - 1, 1))
  const handleNext = () => setViewDate(new Date(year, month + 1, 1))

  const handleDayClick = (day: number) => {
    const selected = formatDate(year, month, day)
    onChange(selected)
    setOpen(false)
  }

  const displayValue = parsed
    ? `${parsed.getDate()} ${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`
    : ''

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(inputClassName, 'text-left cursor-pointer flex items-center gap-2', className)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className={cn('truncate', !displayValue && 'text-green-700/60')}>
            {displayValue || placeholder || 'Select a date'}
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className="z-[70] w-[280px] rounded-2xl border border-green-200 bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="flex h-7 w-7 items-center justify-center rounded-full text-green-800 transition-colors hover:bg-green-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span className="text-sm font-semibold text-green-950">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="flex h-7 w-7 items-center justify-center rounded-full text-green-800 transition-colors hover:bg-green-100"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-green-700">
            {weekdays.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />
              }

              const dateStr = formatDate(year, month, day)
              const dt = new Date(year, month, day)
              const isDisabled = minDate && isBeforeDay(dt, minDate)
              const isSelected = value === dateStr
              const isToday = dt.getTime() === today.getTime()

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'flex h-8 w-full items-center justify-center rounded-full text-sm transition-colors',
                    isSelected && 'bg-green-700 text-white',
                    !isSelected && !isDisabled && 'text-green-950 hover:bg-green-100',
                    !isSelected && isToday && 'border border-green-500',
                    isDisabled && 'cursor-not-allowed text-green-300',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
