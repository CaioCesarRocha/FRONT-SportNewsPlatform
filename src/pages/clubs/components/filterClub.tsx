import { useState } from 'react'
import Button from '../../../components/button'
import { countries, states } from '../../../utils/consts'

type FilterClubModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (country: string, state: string) => void
}

export default function FilterClubModal({ isOpen, onClose, onConfirm }: FilterClubModalProps) {
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const isBrazil = selectedCountry === 'Brazil'

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedState('')
  }

  const handleConfirm = () => {
    if (!selectedCountry) return
    const state = isBrazil ? selectedState : selectedCountry
    if (!state) return
    onConfirm(selectedCountry, state)
    onClose()
  }

  const handleClear = () => {
    setSelectedCountry('')
    setSelectedState('')
    onConfirm('', '')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <Button onClick={onClose} className="absolute inset-0 bg-green-950/55" />

      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-md rounded-[28px] bg-[#f6f3e8] p-6 text-green-950 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-800/70">Filter</p>
            <h2 className="mt-2 text-3xl font-semibold text-green-950">Filter clubs</h2>
            <p className="text-sm text-green-900/70">Select a country and state to filter clubs.</p>
          </div>

          <Button onClick={onClose} className="rounded-full p-2 text-green-900 transition-colors hover:bg-green-100">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="m6 6 12 12M18 6 6 18"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </Button>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">Country</span>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors focus:border-green-500"
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-green-900">State</span>
            {isBrazil ? (
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-2xl border border-green-200 bg-white px-4 py-3 text-green-950 outline-none transition-colors focus:border-green-500"
              >
                <option value="">Select a state</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedCountry || ''}
                readOnly
                disabled
                className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-950/60 outline-none"
              />
            )}
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={handleClear}
              className="rounded-full border border-green-200 px-5 py-3 text-sm font-semibold text-green-900 transition-colors hover:bg-green-100"
            >
              Clear
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedCountry || (!isBrazil && !selectedCountry) || (isBrazil && !selectedState)}
              className="rounded-full bg-green-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
