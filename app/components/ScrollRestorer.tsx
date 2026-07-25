'use client'

import { useEffect } from 'react'

export default function ScrollRestorer() {
  useEffect(() => {
    const saved = sessionStorage.getItem('dashScrollY')
    if (saved) {
      window.scrollTo({ top: parseInt(saved), behavior: 'instant' })
      sessionStorage.removeItem('dashScrollY')
    }
  }, [])
  return null
}