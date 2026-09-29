// Builds calendar entries for "I'm going" events: a Google Calendar link and a
// downloadable .ics file (Apple Calendar, Outlook and most others import it).

export const DURATIONS = [
  { minutes: 60, label: '1 hour', short: '1h' },
  { minutes: 120, label: '2 hours', short: '2h' },
  { minutes: 180, label: '3 hours', short: '3h' },
  { minutes: 360, label: '6 hours', short: '6h' },
]

/** 'YYYY-MM-DDTHH:mm' in the viewer's local time (the DateTimePicker value format). */
export function toLocalInputValue(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 20261003T160000Z — the UTC form both Google Calendar and iCalendar accept. */
function toUtcStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function locationText(loc) {
  if (!loc) return ''
  return [loc.raw_text, loc.normalized_guess].filter(Boolean).join(' — ')
}

function detailsText(item) {
  return [
    item.description,
    item.price_text && `Price: ${item.price_text}`,
    item.contact_text && `Contact: ${item.contact_text}`,
    item.location?.landmark_reference && `Landmark: ${item.location.landmark_reference}`,
    item.source_url && `Source: ${item.source_url}`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Normalizes an extracted item plus the user's chosen start/duration into one event. */
export function buildEvent(item, start, durationMinutes) {
  const startDate = new Date(start)
  return {
    title: item.title,
    start: startDate,
    end: new Date(startDate.getTime() + durationMinutes * 60_000),
    location: locationText(item.location),
    details: detailsText(item),
  }
}

export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(event.end)}`,
    details: event.details,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// RFC 5545 text escaping and 75-octet line folding.
function escapeIcs(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function foldLine(line) {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const chSize = new TextEncoder().encode(ch).length
    // Continuation lines start with a space, which counts toward their 75 octets.
    if (size + chSize > (parts.length ? 74 : 75)) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += chSize
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function icsContent(event) {
  const uid = `${toUtcStamp(event.start)}-${Math.random().toString(36).slice(2)}@save-organize`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Multilingual Save-and-Organize//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(event.start)}`,
    `DTEND:${toUtcStamp(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    event.location && `LOCATION:${escapeIcs(event.location)}`,
    event.details && `DESCRIPTION:${escapeIcs(event.details)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export function downloadIcs(event) {
  const blob = new Blob([icsContent(event)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'event'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
