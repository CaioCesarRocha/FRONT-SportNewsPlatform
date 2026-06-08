import { useState, type SubmitEventHandler } from 'react'

import Button from './button'
import Menu, { MENU_DRAWER_ID } from './menu'

const handleSearchSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
  event.preventDefault()
  window.alert('Nothing found')
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu()
      return
    }

    setIsMenuOpen(true)
  }
  return (
    <>
      <div className="flex w-full items-center justify-between gap-6 bg-green-700 p-4 text-white h-20">
        <Button
          onClick={toggleMenu}
          aria-controls={MENU_DRAWER_ID}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex items-center gap-3 rounded-[4px] px-1 py-2 text-white transition-colors hover:bg-green-800/60"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">Menu</span>
        </Button>

        <div className="flex max-h-25 flex-row items-center justify-center gap-2">
          <h1 className="m-0 text-2xl font-bold text-white">SNP</h1>
          <h6 className="m-0 text-sm font-medium text-green-100">Sporting News Platform</h6>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full max-w-sm">
          <div className="group relative">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white transition-colors group-focus-within:text-green-900"
            >
              <path
                d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-[4px] bg-green-800 py-3 pl-11 pr-4 text-white outline-none transition-colors placeholder:text-white focus:bg-white focus:text-green-900 focus:placeholder:text-green-900"
            />
          </div>
        </form>
      </div>
      {isMenuOpen ? <Menu isOpen={isMenuOpen} onClose={closeMenu} /> : null}
    </>
  )
}
