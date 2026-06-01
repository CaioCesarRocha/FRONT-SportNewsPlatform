import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MENU_SCREENS, ROOT_ITEMS, type MenuItem, type MenuView } from './helperMenu'
import Button from './button'


type MenuProps = {
  isOpen: boolean
  onClose: () => void
}

export const MENU_DRAWER_ID = 'header-drawer-menu'

function MenuEntry({
  item,
  onNavigate,
  onSelectItem,
  onSelect,
}: {
  item: MenuItem
  onNavigate?: (path: string) => void
  onSelectItem?: (item: MenuItem) => void
  onSelect?: (view: MenuView) => void
}) {
  const nextView = item.nextView
  const path = item.path
  const isExpandable = Boolean(item.nextView && onSelect)
  const isRoutable = Boolean(path && onNavigate)
  const isSelectable = Boolean(!item.nextView && onSelectItem)
  const isInteractive = isExpandable || isRoutable || isSelectable

  const handleClick = () => {
    if (nextView) {
      onSelect?.(nextView)
      return
    }

    if (path) {
      onNavigate?.(path)
      return
    }

    onSelectItem?.(item)
  }

  return (
    <li>
      <Button
        onClick={isInteractive ? handleClick : undefined}
        aria-disabled={!isInteractive}
        data-menu-key={item.key}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
          isInteractive
            ? 'cursor-pointer border-green-200 bg-white text-green-950 hover:border-green-400 hover:bg-green-50'
            : 'cursor-default border-green-100 bg-green-50/70 text-green-900'
        }`}
      >
        <span className="flex flex-col gap-1">
          <span className="text-base font-semibold">{item.label}</span>
          {item.description ? (
            <span className="text-sm font-medium text-green-800/80">{item.description}</span>
          ) : null}
        </span>

        {isExpandable ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 text-green-700">
            <path
              d="m9 6 6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        ) : null}
      </Button>
    </li>
  )
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<MenuView>('root')
  const [, setNavigationHistory] = useState<MenuView[]>([])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const navigateTo = (view: MenuView) => {
    setNavigationHistory((history) => [...history, activeView])
    setActiveView(view)
  }

  const goBack = () => {
    setNavigationHistory((history) => {
      const previousView = history.at(-1)

      if (!previousView) {
        setActiveView('root')
        return []
      }

      setActiveView(previousView)
      return history.slice(0, -1)
    })
  }

  const handleNavigation = (path: string) => {
    onClose()
    setActiveView('root')
    setNavigationHistory([])
    navigate(path)
  }

  if (!isOpen) {
    return null
  }

  const currentTitle = activeView === 'root' ? 'Menu' : MENU_SCREENS[activeView].title
  const currentItems = activeView === 'root' ? ROOT_ITEMS : MENU_SCREENS[activeView].items

  return (
    <div className="fixed inset-0 z-50">
      <Button
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <aside
        id={MENU_DRAWER_ID}
        aria-modal="true"
        role="dialog"
        className="relative flex h-[100svh] w-full max-w-sm flex-col overflow-hidden bg-white text-green-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-green-100 px-5 py-5">
          {activeView === 'root' ? (
            <span className="text-lg font-semibold tracking-[0.08em] text-green-900 uppercase">
              Menu
            </span>
          ) : (
            <Button
              onClick={goBack}
              className="flex items-center gap-2 text-lg font-semibold text-green-900 transition-colors hover:text-green-700"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                &lt;
              </span>
              <span>{currentTitle}</span>
            </Button>
          )}

          <Button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-full p-2 text-green-900 transition-colors hover:bg-green-100"
          >
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

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="flex flex-col gap-3">
            {currentItems.map((item) => (
              <MenuEntry
                key={item.key}
                item={item}
                onNavigate={item.path ? handleNavigation : undefined}
                onSelect={item.nextView ? navigateTo : undefined}
              />
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
