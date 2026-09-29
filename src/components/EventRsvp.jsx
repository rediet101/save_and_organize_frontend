import { useState } from 'react'
import { CalendarCheck, Check, X } from 'lucide-react'
import CalendarDialog from './CalendarDialog'

function formatWhen(iso) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

/**
 * "Are you going?" prompt for event cards. Yes opens the calendar dialog; the answer is
 * stored on the item as `rsvp` ('going' | 'not_going') plus `calendar` once added.
 */
export default function EventRsvp({ item, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const confirmCalendar = (calendar) => {
    setDialogOpen(false)
    onUpdate({ rsvp: 'going', calendar })
  }

  let body
  if (item.rsvp === 'going' && item.calendar) {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <CalendarCheck className="size-4" />
          Going · {formatWhen(item.calendar.start)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            Add again
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ rsvp: null, calendar: null })}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100"
          >
            Change
          </button>
        </div>
      </div>
    )
  } else if (item.rsvp === 'not_going') {
    body = (
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-stone-500">Not going</p>
        <button
          type="button"
          onClick={() => onUpdate({ rsvp: null })}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100"
        >
          Change
        </button>
      </div>
    )
  } else {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Are you going?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <Check className="size-4" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ rsvp: 'not_going' })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
          >
            <X className="size-4" />
            No
          </button>
        </div>
      </div>
    )
  }

  const tone =
    item.rsvp === 'going' && item.calendar
      ? 'bg-emerald-50 ring-emerald-200'
      : item.rsvp === 'not_going'
        ? 'bg-stone-50 ring-stone-200/70'
        : 'bg-rose-50 ring-rose-200'

  return (
    <div className={`rounded-xl px-3 py-2.5 ring-1 ${tone}`}>
      {body}
      <CalendarDialog
        item={item}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmCalendar}
      />
    </div>
  )
}
