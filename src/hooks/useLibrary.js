import { useCallback, useEffect, useState } from 'react'

// The backend has no items API yet (Phase 2), so saved items live in this browser.
const STORAGE_KEY = 'mso.library.v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useLibrary() {
  const [items, setItems] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage full or blocked — the library still works for this session.
    }
  }, [items])

  const add = useCallback((newItems, source) => {
    const stamped = newItems.map((item) => ({
      ...item,
      id: newId(),
      saved_at: new Date().toISOString(),
      source_platform: source?.platform ?? 'text',
      source_url: source?.url ?? null,
    }))
    setItems((prev) => [...stamped, ...prev])
    return stamped.map((item) => item.id)
  }, [])

  const update = useCallback(
    (id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [],
  )
  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  return { items, add, update, remove, clear }
}
