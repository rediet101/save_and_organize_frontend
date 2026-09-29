import { useEffect, useState } from 'react'
import { checkHealth } from '../lib/api'

const POLL_MS = 15000

/** @returns {'checking' | 'online' | 'offline'} */
export function useHealth() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let controller
    const ping = async () => {
      controller?.abort()
      controller = new AbortController()
      try {
        const data = await checkHealth(controller.signal)
        setStatus(data?.status === 'ok' ? 'online' : 'offline')
      } catch (err) {
        if (err.name !== 'AbortError') setStatus('offline')
      }
    }
    ping()
    const id = setInterval(ping, POLL_MS)
    return () => {
      clearInterval(id)
      controller?.abort()
    }
  }, [])

  return status
}
