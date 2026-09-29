import { useMemo, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import CaptureForm from './components/CaptureForm'
import ResultsPanel from './components/ResultsPanel'
import Library from './components/Library'
import { useLibrary } from './hooks/useLibrary'
import { extract } from './lib/api'

export default function App() {
  const library = useLibrary()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null) // { items, model_used, processing_ms, source }
  const [savedIdx, setSavedIdx] = useState(() => new Map()) // result index -> library item id
  const [filter, setFilter] = useState('all')

  const counts = useMemo(() => {
    const c = {}
    for (const item of library.items) c[item.category] = (c[item.category] ?? 0) + 1
    return c
  }, [library.items])

  const runExtract = async (payload) => {
    setLoading(true)
    setError(null)
    setSavedIdx(new Map())
    try {
      const data = await extract(payload)
      setResult({ ...data, source: { platform: payload.source_platform, url: payload.source_url } })
    } catch (err) {
      setError(err)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const saveIndexes = (indexes, items = result.items) => {
    const fresh = indexes.filter((i) => !savedIdx.has(i))
    if (!fresh.length) return
    const ids = library.add(fresh.map((i) => items[i]), result.source)
    setSavedIdx((prev) => new Map([...prev, ...fresh.map((i, n) => [i, ids[n]])]))
  }

  // RSVP changes on a result card: keep the saved copy in sync, and saying "going"
  // saves the event so it isn't lost when the next extraction replaces the results.
  const updateResultItem = (i, patch) => {
    const items = result.items.map((item, n) => (n === i ? { ...item, ...patch } : item))
    setResult((prev) => ({ ...prev, items }))
    if (savedIdx.has(i)) library.update(savedIdx.get(i), patch)
    else if (patch.rsvp === 'going') saveIndexes([i], items)
  }

  const pickCategory = (key) => {
    setFilter(key)
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Header savedCount={library.items.length} />
      <main>
        <Hero counts={counts} onPickCategory={pickCategory} />

        <section id="capture" className="border-y border-stone-200/70 bg-sand/50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-5 lg:gap-6">
            <div className="min-w-0 lg:col-span-2">
              <CaptureForm onSubmit={runExtract} loading={loading} error={error} />
            </div>
            <div className="min-w-0 lg:col-span-3">
              <ResultsPanel
                loading={loading}
                result={result}
                savedIdx={savedIdx}
                onSave={(i) => saveIndexes([i])}
                onSaveAll={() => saveIndexes(result.items.map((_, i) => i))}
                onUpdate={updateResultItem}
              />
            </div>
          </div>
        </section>

        <Library
          items={library.items}
          counts={counts}
          filter={filter}
          setFilter={setFilter}
          onRemove={library.remove}
          onUpdate={library.update}
          onClear={library.clear}
        />
      </main>

      <footer className="border-t border-stone-200/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-stone-500 sm:px-6">
          <span>Multilingual Save-and-Organize · frontend preview</span>
          <span>FastAPI · Gemini extraction · React + Vite + Tailwind</span>
        </div>
      </footer>
    </>
  )
}
