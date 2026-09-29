import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// In-dialog replacement for <input type="datetime-local">, whose native popup can't be
// styled and spills outside the dialog. Value uses the same 'YYYY-MM-DDTHH:mm' format.

const DEFAULT_TIME = '18:00'
const SLOT_MINUTES = 30

const pad = (n) => String(n).padStart(2, '0')
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const monthFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
// 1 Jan 2023 was a Sunday.
const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(new Date(2023, 0, 1 + i)),
)

const SLOTS = Array.from({ length: (24 * 60) / SLOT_MINUTES }, (_, i) => {
  const minutes = i * SLOT_MINUTES
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
})

function timeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return timeFmt.format(new Date(2000, 0, 1, h, m))
}

/** Blank cells up to the month's first weekday, then one Date per day. */
function monthCells(year, month) {
  const cells = Array(new Date(year, month, 1).getDay()).fill(null)
  const days = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d))
  return cells
}

export default function DateTimePicker({ value, onChange }) {
  const [date, time] = value ? value.split('T') : ['', '']
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = dateKey(today)

  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))
  const railRef = useRef(null)
  const scrolledOnce = useRef(false)

  // Show the month of the chosen date whenever it's set, including from outside.
  useEffect(() => {
    if (!date) return
    const [y, m] = date.split('-').map(Number)
    setView({ year: y, month: m - 1 })
  }, [date])

  // Keep the chosen time (or the default) centered in the time rail.
  useEffect(() => {
    const rail = railRef.current
    const chip = rail?.querySelector(`[data-time="${time || DEFAULT_TIME}"]`)
    if (!chip) return
    rail.scrollTo({
      left: chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2,
      behavior: scrolledOnce.current ? 'smooth' : 'instant',
    })
    scrolledOnce.current = true
  }, [time])

  const slots = time && !SLOTS.includes(time) ? [...SLOTS, time].sort() : SLOTS
  const cells = monthCells(view.year, view.month)

  // Don't page back past this month, unless the post's date is further back.
  const earliest = date && date < todayKey ? date.slice(0, 7) : todayKey.slice(0, 7)
  const canGoBack = `${view.year}-${pad(view.month + 1)}` > earliest
  const shift = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  return (
    <div>
      <div className="rounded-2xl p-3 ring-1 ring-stone-200 sm:p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canGoBack}
            className="grid size-9 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-base font-bold" aria-live="polite">
            {monthFmt.format(new Date(view.year, view.month))}
          </p>
          <button
            type="button"
            onClick={() => shift(1)}
            className="grid size-9 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-ink"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 text-center text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
          {WEEKDAYS.map((w, i) => (
            <span key={i} className="py-1">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`blank-${i}`} />
            const key = dateKey(d)
            const selected = key === date
            const isToday = key === todayKey
            const past = key < todayKey && !selected
            return (
              <button
                key={key}
                type="button"
                disabled={past}
                onClick={() => onChange(`${key}T${time || DEFAULT_TIME}`)}
                aria-pressed={selected}
                aria-label={dayFmt.format(d)}
                className={`mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-sm tabular-nums transition ${
                  selected
                    ? 'bg-clay font-bold text-white shadow-md shadow-clay/30'
                    : past
                      ? 'cursor-not-allowed text-stone-300'
                      : isToday
                        ? 'font-bold text-clay-dark ring-1 ring-clay/40 hover:bg-orange-50'
                        : 'text-ink hover:bg-sand'
                }`}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-stone-500">Time</p>
      <div
        ref={railRef}
        className="no-scrollbar relative -mx-5 mt-2 flex snap-x gap-1.5 overflow-x-auto overscroll-x-contain px-5 py-1 mask-[linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] sm:-mx-6 sm:px-6"
      >
        {slots.map((t) => {
          const selected = t === time
          return (
            <button
              key={t}
              type="button"
              data-time={t}
              onClick={() => onChange(`${date || todayKey}T${t}`)}
              aria-pressed={selected}
              className={`shrink-0 snap-center rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap tabular-nums ring-1 transition ${
                selected ? 'bg-ink text-cream ring-ink' : 'bg-white text-stone-600 ring-stone-200 hover:bg-sand hover:text-ink'
              }`}
            >
              {timeLabel(t)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
