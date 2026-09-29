import { Library } from 'lucide-react'
import logoMark from '../assets/logo-mark.png'
import { useHealth } from '../hooks/useHealth'

const STATUS = {
  checking: { label: 'Checking API…', dot: 'bg-stone-400 animate-pulse', ring: 'ring-stone-200 text-stone-600' },
  online: { label: 'API online', dot: 'bg-emerald-500', ring: 'ring-emerald-200 text-emerald-800 bg-emerald-50' },
  offline: { label: 'API offline', dot: 'bg-rose-500', ring: 'ring-rose-200 text-rose-800 bg-rose-50' },
}

export default function Header({ savedCount }) {
  const status = STATUS[useHealth()]

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <img src={logoMark} alt="" width="36" height="36" className="size-9 shrink-0" />
          <span className="truncate font-display text-base font-bold tracking-tight sm:text-lg">Save &amp; Organize</span>
        </a>

        <nav className="flex shrink-0 items-center gap-1 text-sm font-medium sm:gap-2">
          <a
            href="#library"
            className="relative grid size-10 place-items-center rounded-lg text-stone-600 hover:bg-sand hover:text-ink sm:hidden"
            aria-label={`Library, ${savedCount} saved`}
          >
            <Library className="size-5" />
            {savedCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4.5 rounded-full bg-ink px-1 text-center text-[10px] leading-4.5 font-semibold text-cream">
                {savedCount}
              </span>
            )}
          </a>
          <a href="#capture" className="hidden rounded-lg px-3 py-2 text-stone-600 hover:bg-sand hover:text-ink sm:block">
            Capture
          </a>
          <a href="#library" className="hidden rounded-lg px-3 py-2 text-stone-600 hover:bg-sand hover:text-ink sm:block">
            Library
            {savedCount > 0 && (
              <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-xs text-cream">{savedCount}</span>
            )}
          </a>
          <span
            className={`ml-1 inline-flex items-center gap-2 rounded-full p-2.5 text-xs font-semibold ring-1 sm:px-3 sm:py-1.5 ${status.ring}`}
            title="Polls GET /health every 15 seconds"
          >
            <span className={`size-2 rounded-full ${status.dot}`} />
            <span className="sr-only sm:not-sr-only">{status.label}</span>
          </span>
        </nav>
      </div>
    </header>
  )
}
