import { BookmarkPlus, Cpu, Timer, Wand2 } from 'lucide-react'
import ItemCard from './ItemCard'

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <div className="h-6 w-24 animate-pulse rounded-full bg-stone-100" />
          <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-stone-100" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-stone-100" />
          <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-stone-100" />
          <div className="mt-6 h-4 w-1/2 animate-pulse rounded bg-stone-100" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-stone-100" />
        </div>
      ))}
    </div>
  )
}

export default function ResultsPanel({ loading, result, savedIdx, onSave, onSaveAll, onUpdate }) {
  if (loading) {
    return (
      <div>
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-500">
          <span className="size-2 animate-ping rounded-full bg-clay" />
          Detecting languages, places and dates…
        </p>
        <Skeleton />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-sand">
          <Wand2 className="size-6 text-clay-dark" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold">Results appear here</h3>
        <p className="mt-1 max-w-sm text-sm text-stone-500">
          One post can hold many places — a “top 5 spots” listicle comes back as five separate items you can save one by one.
        </p>
      </div>
    )
  }

  const allSaved = result.items.every((_, i) => savedIdx.has(i))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold">
            Found {result.items.length} {result.items.length === 1 ? 'item' : 'items'}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1"><Cpu className="size-3.5" /> {result.model_used}</span>
            <span className="inline-flex items-center gap-1"><Timer className="size-3.5" /> {(result.processing_ms / 1000).toFixed(1)}s</span>
          </div>
        </div>
        {result.items.length > 1 && (
          <button
            type="button"
            onClick={onSaveAll}
            disabled={allSaved}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-cream hover:bg-stone-800 disabled:bg-emerald-50 disabled:text-emerald-700"
          >
            <BookmarkPlus className="size-4" />
            {allSaved ? 'All saved' : 'Save all'}
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {result.items.map((item, i) => (
          <ItemCard
            key={i}
            item={item}
            saved={savedIdx.has(i)}
            onSave={() => onSave(i)}
            onUpdate={(patch) => onUpdate(i, patch)}
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
