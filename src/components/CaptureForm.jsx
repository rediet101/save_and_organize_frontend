import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Link2, Loader2, Sparkles, TriangleAlert, X } from 'lucide-react'
import { readFileAsBase64 } from '../lib/api'

// Mirrors SourcePlatform in backend/app/schemas/extraction.py.
const PLATFORMS = [
  { value: 'text', label: 'Text' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'other', label: 'Other' },
]

const SAMPLES = [
  {
    label: 'Amharic + English',
    text: 'Enkutatash party this Saturday 🎉 at Kuriftu Resort, Bishoftu. Entry 500 birr, ከ8 ሰዓት ጀምሮ! Call 0911 234 567 #newyear',
  },
  {
    label: 'Sheng + Swahili',
    text: 'Hii place ya nyama choma ni moto sana 🔥 iko kwa stage ya Rongai, opposite Tuskys. 350 bob per quarter kilo. Msiache kuenda!',
  },
  {
    label: 'Pidgin',
    text: 'Omo this amala spot for Surulere sweet die! E dey behind the big mosque for Ojuelegba road. ₦2,500 for full plate. Make una try am 😋',
  },
  {
    label: 'French + Arabic',
    text: 'Le souk des tapis à Marrakech ✨ السوق قرب جامع الفنا — prix négociables, ouvert tous les jours 9h-20h',
  },
]

const LINK_FAILURE_COPY = {
  needs_screenshot: 'This post is private or behind a login, so it can’t be read from the link.',
  private_content: 'This post looks deleted or private.',
  unsupported_url: 'That looks like a story, DM or profile link — there’s no single post to read.',
  fetch_failed: 'We couldn’t reach the platform right now.',
}

function detectPlatform(url) {
  const u = url.toLowerCase()
  if (u.includes('tiktok.com')) return 'tiktok'
  if (u.includes('instagram.com')) return 'instagram'
  if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.com')) return 'facebook'
  if (u.includes('t.me/') || u.includes('telegram.me')) return 'telegram'
  return null
}

export default function CaptureForm({ onSubmit, loading, error }) {
  const [platform, setPlatform] = useState('text')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [image, setImage] = useState(null) // { file, preview }
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => () => image && URL.revokeObjectURL(image.preview), [image])

  const setImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage({ file, preview: URL.createObjectURL(file) })
    setPlatform((p) => (p === 'text' ? 'screenshot' : p))
    setLocalError('')
  }

  const onUrlChange = (value) => {
    setUrl(value)
    const detected = detectPlatform(value)
    if (detected) setPlatform(detected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim() && !text.trim() && !image) {
      setLocalError('Add a link, some text, or a screenshot first.')
      return
    }
    setLocalError('')
    const payload = {
      raw_text: text.trim() || null,
      source_url: url.trim() || null,
      source_platform: platform,
    }
    if (image) {
      payload.image_base64 = await readFileAsBase64(image.file)
      payload.image_mime_type = image.file.type
    }
    onSubmit(payload)
  }

  const reset = () => {
    setUrl('')
    setText('')
    setImage(null)
    setPlatform('text')
    setLocalError('')
  }

  const linkFailure = error?.linkFailure

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-xl shadow-stone-900/5 ring-1 ring-stone-200 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">New save</h2>
        {(url || text || image) && (
          <button type="button" onClick={reset} className="text-sm font-medium text-stone-500 hover:text-ink">
            Clear
          </button>
        )}
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Source</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPlatform(p.value)}
              aria-pressed={platform === p.value}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition sm:px-3 sm:py-1.5 ${
                platform === p.value ? 'bg-ink text-cream' : 'bg-stone-100 text-stone-600 hover:bg-sand'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Link</span>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-stone-50 px-3 ring-1 ring-stone-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-clay">
          <Link2 className="size-4 shrink-0 text-stone-400" />
          <input
            type="url"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://www.instagram.com/p/… or https://t.me/…"
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-stone-400"
          />
        </div>
        <span className="mt-1.5 block text-xs text-stone-400">Public posts only. With just a link, the backend fetches the caption itself.</span>
      </label>

      <label className="mt-5 block">
        <span className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Caption or message</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={(e) => {
            const file = [...e.clipboardData.files].find((f) => f.type.startsWith('image/'))
            if (file) {
              e.preventDefault()
              setImageFile(file)
            }
          }}
          dir="auto"
          rows={5}
          placeholder="Paste a caption in any language — English, Amharic, Swahili, Pidgin, French, Arabic…"
          className="mt-2 w-full resize-y rounded-xl bg-stone-50 p-3 text-sm leading-relaxed ring-1 ring-stone-200 outline-none placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-clay"
        />
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400">Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => {
              setText(s.text)
              setPlatform('text')
            }}
            className="rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-xs text-stone-600 hover:border-clay hover:text-clay-dark sm:px-2.5 sm:py-1"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <span className="text-xs font-semibold tracking-wide text-stone-500 uppercase">Screenshot</span>
        {image ? (
          <div className="relative mt-2 flex items-center gap-3 rounded-xl bg-stone-50 p-2 ring-1 ring-stone-200">
            <img src={image.preview} alt="Screenshot preview" className="size-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{image.file.name}</p>
              <p className="text-xs text-stone-400">{(image.file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={() => setImage(null)}
              className="rounded-lg p-2.5 text-stone-400 hover:bg-stone-200 hover:text-ink"
              aria-label="Remove screenshot"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              setImageFile(e.dataTransfer.files[0])
            }}
            className={`mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-sm transition ${
              dragging ? 'border-clay bg-orange-50 text-clay-dark' : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
            }`}
          >
            <ImagePlus className="size-6" />
            <span className="pointer-coarse:hidden">
              <span className="font-semibold text-ink">Upload</span>, drop, or paste a screenshot
            </span>
            <span className="hidden pointer-coarse:inline">
              <span className="font-semibold text-ink">Tap to choose</span> a screenshot from your photos
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setImageFile(e.target.files[0])
            e.target.value = ''
          }}
        />
      </div>

      {(localError || error) && (
        <div role="alert" className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-900 ring-1 ring-amber-200">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">{linkFailure ? LINK_FAILURE_COPY[linkFailure.reason] ?? 'Couldn’t read that link.' : localError || error.message}</p>
            {linkFailure && (
              <>
                <p className="mt-1 text-amber-800/80">{linkFailure.message}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-950"
                >
                  <ImagePlus className="size-3.5" /> Add a screenshot instead
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-clay/25 transition hover:bg-clay-dark disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {loading ? 'Reading…' : 'Extract & organize'}
      </button>
    </form>
  )
}
