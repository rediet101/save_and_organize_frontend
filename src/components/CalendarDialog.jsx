import { useEffect, useRef, useState } from 'react'
import { CalendarClock, CalendarPlus, Download, MapPin, X } from 'lucide-react'
import { DURATIONS, buildEvent, downloadIcs, googleCalendarUrl, toLocalInputValue } from '../lib/calendar'
import DateTimePicker from './DateTimePicker'

const rangeFmt = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** "Sat, Sep 26, 5:00 – 7:00 PM" */
function whenText(start, durationMinutes) {
  const from = new Date(start)
  const to = new Date(from.getTime() + durationMinutes * 60_000)
  return rangeFmt.formatRange ? rangeFmt.formatRange(from, to) : rangeFmt.format(from)
}

export default function CalendarDialog({ item, open, onClose, onConfirm }) {
  const ref = useRef(null)
  const [start, setStart] = useState('')
  const [duration, setDuration] = useState(DURATIONS[1].minutes)

  // Reset the form each time it opens, pre-filled from the post when it stated a date.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open) {
      setStart(toLocalInputValue(item.calendar?.start ?? item.event_datetime ?? ''))
      setDuration(item.calendar?.duration ?? DURATIONS[1].minutes)
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open, item])

  const valid = start && !Number.isNaN(new Date(start).getTime())

  const confirm = (target) => {
    if (!valid) return
    const event = buildEvent(item, start, duration)
    if (target === 'google') window.open(googleCalendarUrl(event), '_blank', 'noopener')
    else downloadIcs(event)
    onConfirm({ start: event.start.toISOString(), duration, added_via: target })
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[calc(100%-2rem)] w-[min(28rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-3xl bg-white p-0 text-ink shadow-2xl ring-1 ring-stone-200 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 wrap-anywhere">
            <p className="text-sm font-semibold text-rose-700">You're going 🎉</p>
            <h2 dir="auto" className="mt-1 font-display text-2xl leading-tight font-bold">
              {item.title}
            </h2>
            {item.location?.raw_text && (
              <p dir="auto" className="mt-1.5 flex items-start gap-1.5 text-sm text-stone-500">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {item.location.raw_text}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-m-1 shrink-0 rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {!item.event_datetime && !item.calendar && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">
            The post didn't say exactly when — pick the date and time.
          </p>
        )}

        {/* Mounted only while open so the time rail can measure itself and scroll to the chosen time. */}
        <div className="mt-5">{open && <DateTimePicker value={start} onChange={setStart} />}</div>

        <p className="mt-4 text-xs font-semibold text-stone-500">Duration</p>
        <div role="radiogroup" aria-label="Duration" className="mt-2 grid grid-cols-4 gap-1 rounded-xl bg-stone-100 p-1">
          {DURATIONS.map((d) => {
            const active = d.minutes === duration
            return (
              <button
                key={d.minutes}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={d.label}
                onClick={() => setDuration(d.minutes)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  active ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
                }`}
              >
                {d.short}
              </button>
            )
          })}
        </div>

        <p
          className={`mt-5 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
            valid ? 'bg-sand/70 text-ink' : 'bg-stone-50 text-stone-400'
          }`}
        >
          <CalendarClock className="size-4 shrink-0" />
          {valid ? whenText(start, duration) : 'Pick a day and time'}
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!valid}
            onClick={() => confirm('google')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm sm:py-2.5 font-semibold text-cream hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CalendarPlus className="size-4" />
            Google Calendar
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => confirm('ics')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sand px-4 py-3 text-sm sm:py-2.5 font-semibold text-ink ring-1 ring-stone-200 hover:bg-stone-200/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" />
            Apple / Outlook (.ics)
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-stone-400">The .ics file includes a reminder 1 hour before.</p>
      </div>
    </dialog>
  )
}
