import { useState } from 'react'
import {
  BookmarkCheck,
  BookmarkPlus,
  CalendarClock,
  ChevronDown,
  ExternalLink,
  Languages,
  MapPin,
  Phone,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-react'
import { categoryOf } from '../lib/categories'
import EventRsvp from './EventRsvp'

function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function mapsQuery(loc) {
  if (!loc) return null
  const q = loc.normalized_guess || [loc.landmark_reference, loc.neighborhood, loc.city, loc.country].filter(Boolean).join(', ')
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : null
}

function Confidence({ value }) {
  const pct = Math.round((value ?? 0) * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2" title="Model's self-reported confidence">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-stone-500 tabular-nums">{pct}%</span>
    </div>
  )
}

function Row({ icon: Icon, children }) {
  return (
    <div className="flex gap-2.5 text-sm">
      <Icon className="mt-0.5 size-4 shrink-0 text-stone-400" />
      <div className="min-w-0 text-stone-700">{children}</div>
    </div>
  )
}

export default function ItemCard({ item, onSave, saved, onRemove, onUpdate, style }) {
  const [showNotes, setShowNotes] = useState(false)
  const c = categoryOf(item.category)
  const Icon = c.icon
  const loc = item.location
  const mapUrl = mapsQuery(loc)
  const locationParts = loc ? [loc.neighborhood, loc.city, loc.country].filter(Boolean).join(' · ') : ''

  return (
    <article
      style={style}
      className="group relative flex min-w-0 animate-fade-up flex-col overflow-hidden rounded-2xl bg-white wrap-anywhere ring-1 ring-stone-200 transition hover:shadow-xl hover:shadow-stone-900/5"
    >
      <div className={`h-1 ${c.accent}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.badge}`}>
            <Icon className="size-3.5" />
            {c.label}
          </span>
          <Confidence value={item.confidence} />
        </div>

        <div>
          <h3 dir="auto" className="font-display text-xl leading-snug font-bold">
            {item.title}
          </h3>
          {item.description && (
            <p dir="auto" className="mt-1.5 text-sm leading-relaxed text-stone-600">
              {item.description}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          {loc && (
            <Row icon={MapPin}>
              <p dir="auto" className="font-medium text-ink">“{loc.raw_text}”</p>
              {loc.landmark_reference && (
                <p dir="auto" className="text-stone-500">Landmark: {loc.landmark_reference}</p>
              )}
              {locationParts && <p className="text-stone-500">{locationParts}</p>}
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex items-center gap-1 py-1 text-xs font-semibold text-clay-dark hover:underline"
                >
                  {loc.normalized_guess ? 'Open in Maps' : 'Search in Maps'} <ExternalLink className="size-3" />
                </a>
              )}
            </Row>
          )}
          {item.event_datetime && <Row icon={CalendarClock}>{formatDate(item.event_datetime)}</Row>}
          {item.price_text && <Row icon={Wallet}><span dir="auto">{item.price_text}</span></Row>}
          {item.contact_text && <Row icon={Phone}><span dir="auto" className="break-words">{item.contact_text}</span></Row>}
        </div>

        {item.category === 'events' && onUpdate && <EventRsvp item={item} onUpdate={onUpdate} />}

        {item.languages_detected?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Languages className="size-4 text-stone-400" />
            {item.languages_detected.map((l) => (
              <span
                key={l.code + l.name}
                className={`rounded-md px-2 py-0.5 text-xs ${
                  l.is_primary ? 'bg-ink font-semibold text-cream' : 'bg-sand text-stone-700'
                }`}
                title={l.is_primary ? 'Primary language' : l.code}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {item.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="size-4 text-stone-400" />
            {item.tags.map((t) => (
              <span key={t} dir="auto" className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                #{t}
              </span>
            ))}
          </div>
        )}

        {item.extraction_notes && (
          <div className="rounded-xl bg-stone-50 ring-1 ring-stone-200/70">
            <button
              type="button"
              onClick={() => setShowNotes((s) => !s)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-stone-500 sm:py-2"
              aria-expanded={showNotes}
            >
              AI notes
              <ChevronDown className={`size-4 transition ${showNotes ? 'rotate-180' : ''}`} />
            </button>
            {showNotes && <p dir="auto" className="px-3 pb-3 text-xs leading-relaxed text-stone-600">{item.extraction_notes}</p>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {item.saved_at ? (
            <span className="text-xs text-stone-400">
              Saved {new Date(item.saved_at).toLocaleDateString()}
              {item.source_platform && item.source_platform !== 'text' && ` · ${item.source_platform}`}
            </span>
          ) : (
            <span />
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saved}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition sm:px-3 sm:py-1.5 ${
                saved ? 'bg-emerald-50 text-emerald-700' : 'bg-ink text-cream hover:bg-stone-800'
              }`}
            >
              {saved ? <BookmarkCheck className="size-4" /> : <BookmarkPlus className="size-4" />}
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
          {onRemove && (
            <div className="flex items-center gap-1">
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2.5 text-stone-400 hover:bg-stone-100 hover:text-ink"
                  title="Open original post"
                  aria-label="Open original post"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg p-2.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                title="Remove from library"
                aria-label="Remove from library"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
