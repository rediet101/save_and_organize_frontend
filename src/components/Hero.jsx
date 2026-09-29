import { useEffect, useState } from 'react'
import { ArrowDown, Link2, Sparkles, FolderKanban } from 'lucide-react'
import { CATEGORIES, MAIN_CATEGORIES } from '../lib/categories'

const GREETINGS = [
  { word: 'ሰላም', lang: 'Amharic' },
  { word: 'Habari', lang: 'Swahili' },
  { word: 'How far', lang: 'Pidgin' },
  { word: 'Bonjour', lang: 'French' },
  { word: 'مرحبا', lang: 'Arabic' },
  { word: 'Niaje', lang: 'Sheng' },
  { word: 'Ẹ n lẹ', lang: 'Yoruba' },
]

const STEPS = [
  { icon: Link2, title: 'Share anything', text: 'A TikTok, Instagram or Telegram link, a caption, or a screenshot.' },
  { icon: Sparkles, title: 'AI reads every language', text: 'Code-switched captions and landmark directions are understood.' },
  { icon: FolderKanban, title: 'Auto-organized', text: 'Each place or event lands in the right category, ready to find.' },
]

export default function Hero({ counts, onPickCategory }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % GREETINGS.length), 2200)
    return () => clearInterval(id)
  }, [])
  const greeting = GREETINGS[i]

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="bg-weave pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="pointer-events-none absolute -top-32 right-[-10%] size-[28rem] rounded-full bg-clay/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-10 sm:px-6 sm:pt-20 sm:pb-12">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
            <span className="size-1.5 rounded-full bg-clay" />
            Built for African &amp; multilingual social content
          </p>

          <h1 className="mt-6 font-display text-[2.5rem] leading-[1.02] font-extrabold tracking-tight min-[400px]:text-5xl sm:text-7xl">
            Save it in{' '}
            <span className="relative inline-block min-w-[5ch] text-clay" aria-live="polite">
              <span key={greeting.word} className="inline-block animate-word" dir="auto">
                {greeting.word}
              </span>
            </span>
            <br />
            find it in seconds.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:mt-6 sm:text-lg">
            Paste a post you loved. We detect the language, pull out the place, date, price and contact —
            and sort it into Events, Food, Travel or Shops.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#capture"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-cream shadow-lg shadow-ink/10 transition hover:-translate-y-0.5 hover:bg-stone-800"
            >
              Save something <ArrowDown className="size-4" />
            </a>
            <span className="text-sm text-stone-500">
              Now reading: <span className="font-semibold text-ink">{greeting.lang}</span>
            </span>
          </div>
        </div>

        <ol className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4">
          {STEPS.map(({ icon: Icon, title, text }, idx) => (
            <li key={title} className="rounded-2xl bg-white/70 p-5 ring-1 ring-stone-200/80 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-sand text-ink">
                  <Icon className="size-4.5" />
                </span>
                <span className="font-display text-sm font-bold text-stone-400">0{idx + 1}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {MAIN_CATEGORIES.map((key) => {
            const c = CATEGORIES[key]
            const Icon = c.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPickCategory(key)}
                className={`group flex min-w-0 items-center gap-2.5 rounded-2xl p-3 text-left ring-1 transition sm:gap-3 sm:p-4 ${c.tile}`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 ${c.iconWrap}`}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-2xl leading-none font-bold">{counts[key] ?? 0}</span>
                  <span className="mt-1 block truncate text-sm font-medium text-stone-600">{c.label} saved</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
