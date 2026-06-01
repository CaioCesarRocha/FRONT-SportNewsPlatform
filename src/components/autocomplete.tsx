import { useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

import { cn } from '../utils/cn'
import Button from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export type AutocompleteOption = {
  disabled?: boolean
  label: string
  value: string
}

type AutocompleteProps = {
  disabled?: boolean
  emptyMessage?: string
  error?: string | null
  inputClassName?: string
  listClassName?: string
  loading?: boolean
  loadingMessage?: string
  onRemoveSelected: (value: string) => void
  onSelect: (value: string) => void
  onValueChange: (value: string) => void
  options: AutocompleteOption[]
  placeholder?: string
  selectedOptions?: AutocompleteOption[]
  value: string
}

export default function Autocomplete({
  disabled = false,
  emptyMessage = 'No results found.',
  error,
  inputClassName,
  listClassName,
  loading = false,
  loadingMessage = 'Loading...',
  onRemoveSelected,
  onSelect,
  onValueChange,
  options,
  placeholder = 'Search...',
  selectedOptions = [],
  value,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasError = Boolean(error)
  const isSearchDisabled = disabled || loading || hasError
  const shouldShowPlaceholder = selectedOptions.length === 0 && value.length === 0
  const selectedValueSet = new Set(selectedOptions.map((option) => option.value))

  const handleContainerClick = () => {
    if (disabled) {
      return
    }

    setIsOpen(true)
    inputRef.current?.focus()
  }

  const handleRemoveSelected = (selectedValue: string) => {
    onRemoveSelected(selectedValue)
    inputRef.current?.focus()
  }

  return (
    <Popover modal={false} open={!disabled && isOpen} onOpenChange={setIsOpen}>
      <Command shouldFilter={false} className="overflow-visible">
        <PopoverTrigger asChild>
          <div
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
            onClick={handleContainerClick}
            className={cn(
              'w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors',
              'focus-within:border-green-500',
              disabled && 'cursor-not-allowed bg-green-50 text-green-700/60',
              !disabled && isSearchDisabled && 'bg-green-50 text-green-700/60',
              inputClassName,
            )}
          >
            <CommandInput
              ref={inputRef}
              value={value}
              placeholder=""
              disabled={isSearchDisabled}
              onFocus={() => {
                if (!disabled) {
                  setIsOpen(true)
                }
              }}
              onValueChange={onValueChange}
              onKeyDown={(event) => {
                if (event.key === 'Backspace' && value.length === 0 && selectedOptions.length > 0) {
                  handleRemoveSelected(selectedOptions[selectedOptions.length - 1].value)
                }
              }}
              wrapperClassName="flex flex-wrap items-center gap-2"
              className="h-auto min-w-24 flex-1 p-0 text-base placeholder:text-current/60"
              afterInput={
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-green-800 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              }
              beforeInput={
                <>
                  {selectedOptions.map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-950"
                    >
                      <span>{option.label}</span>
                      <Button
                        aria-label={`Remove ${option.label}`}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          handleRemoveSelected(option.value)
                        }}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-green-800 transition-colors hover:bg-green-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  ))}
                  {shouldShowPlaceholder ? (
                    <span className="pointer-events-none text-base text-current/60">
                      {placeholder}
                    </span>
                  ) : null}
                </>
              }
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            'z-[80] w-[var(--radix-popover-trigger-width)] rounded-2xl border border-green-100 bg-white p-0 shadow-xl',
            listClassName,
          )}
        >
          <CommandList className="max-h-60 p-0">
            {hasError ? <div className="p-3 text-sm text-red-700">{error}</div> : null}

            {!hasError && loading ? (
              <div className="p-3 text-sm text-green-900">{loadingMessage}</div>
            ) : null}

            {!hasError && !loading && !options.length ? (
              <CommandEmpty className="p-3 text-left text-sm text-green-900/70">
                {emptyMessage}
              </CommandEmpty>
            ) : null}

            {!hasError && !loading && options.length ? (
              <CommandGroup className="flex flex-col gap-1 p-2">
                {options.map((option) => {
                  const isSelected = selectedValueSet.has(option.value)

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled || false}
                      onSelect={(selectedValue) => {
                        onSelect(selectedValue)
                        inputRef.current?.focus()
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-2xl px-3 py-2 text-left transition-colors',
                        isSelected ? 'bg-green-700 text-white' : 'text-green-950 hover:bg-green-50',
                        option.disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                      {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  )
}
