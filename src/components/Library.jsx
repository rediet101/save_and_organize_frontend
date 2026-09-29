import { useMemo, useState } from 'react'
import { Inbox, Search } from 'lucide-react'
import { CATEGORIES, MAIN_CATEGORIES } from '../lib/categories'
import ItemCard from './ItemCard'

function matches(item, q) {
  if (!q) return true
  const haystack = [
    item.title,
    item.description,
    item.price_text,
    item.contact_text,
    item.location?.raw_text,
    item.location?.landmark_reference,
    item.location?.city,
    item.location?.neighborhood,
    item.location?.country,
    ...(item.tags ?? []),
    ...(item.languages_detected ?? []).map((l) => l.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q.toLowerCase())
}

export default function Library({ items, counts, filter, setFilter, onRemove, onUpdate, onClear }) {
  const [query, setQuery] = useState('')

  const tabs = ['all', ...MAIN_CATEGORIES, ...(counts.unknown ? ['unknown'] : [])]
  const visible = useMemo(
    () => items.filter((i) => (filter === 'all' || i.category === filter) && matches(i, query.trim())),
    [items, filter, query],
  )

  return (
    <section id="library" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-clay-dark">Your library</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Everything you saved</h2>
          <p className="mt-2 text-sm text-stone-500">Stored in this browser until the backend items API is ready.</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-stone-200 focus-within:ring-2 focus-within:ring-clay sm:w-72">
            <Search className="size-4 shrink-0 text-stone-400" />
            <input
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, place, tag, language…"
              className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-stone-400"
              dir="auto"
            />
          </label>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => window.confirm('Remove all saved items from this browser?') && onClear()}
              className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap text-stone-500 hover:bg-rose-50 hover:text-rose-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0">
        <div role="tablist" className="flex w-max gap-1 rounded-2xl bg-sand p-1">
          {tabs.map((key) => {
            const c = CATEGORIES[key]
            const Icon = c?.icon
            const active = filter === key
            const count = key === 'all' ? items.length : counts[key] ?? 0
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  active ? 'bg-white text-ink shadow-sm' : 'text-stone-600 hover:text-ink'
                }`}
              >
                {Icon && <Icon className="size-4" />}
                {key === 'all' ? 'All' : c.label}
                <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-ink text-cream' : 'bg-white/70'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onUpdate={(patch) => onUpdate(item.id, patch)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-white/60 px-6 py-16 text-center ring-1 ring-stone-200">
          <Inbox className="size-8 text-stone-300" />
          <p className="mt-3 font-display text-lg font-bold">
            {items.length === 0 ? 'Nothing saved yet' : 'No matches'}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {items.length === 0 ? (
              <>
                Extract a post above and hit <span className="font-semibold text-ink">Save</span>.
              </>
            ) : (
              'Try another category or search term.'
            )}
          </p>
        </div>
      )}
    </section>
  )
}
