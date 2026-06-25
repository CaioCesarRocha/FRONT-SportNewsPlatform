import { useEffect, useState } from 'react'
import { API_URL } from '../utils/consts'

type CheckUniquenessResponse = {
  nameTaken: boolean
  slugTaken: boolean
}

type UseCheckFieldsOptions = {
  path: string
  nameDebounce: number
  slugDebounce: number
}

export default function useCheckFields(
  name: string,
  slug: string,
  options?: Partial<UseCheckFieldsOptions>,
) {
  const {
    path = '/clubs/check-uniqueness',
    nameDebounce = 2000,
    slugDebounce = 1200,
  } = options ?? {}

  const [nameTaken, setNameTaken] = useState(false)
  const [slugTaken, setSlugTaken] = useState(false)
  const [checkingName, setCheckingName] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)

  useEffect(() => {
    setNameTaken(false)
    setCheckingName(false)

    if (!name.trim()) return

    setCheckingName(true)
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const url = new URL(`${API_URL}${path}`)
        url.searchParams.set('name', name)
        const response = await fetch(url.toString())
        if (!response.ok) return
        const data = (await response.json()) as CheckUniquenessResponse
        if (!cancelled) setNameTaken(data.nameTaken)
      } catch {
        if (!cancelled) setNameTaken(false)
      } finally {
        if (!cancelled) setCheckingName(false)
      }
    }, nameDebounce)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [name, path, nameDebounce])

  useEffect(() => {
    setSlugTaken(false)
    setCheckingSlug(false)

    if (!slug.trim()) return

    setCheckingSlug(true)
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const url = new URL(`${API_URL}${path}`)
        url.searchParams.set('slug', slug)
        const response = await fetch(url.toString())
        if (!response.ok) return
        const data = (await response.json()) as CheckUniquenessResponse
        if (!cancelled) setSlugTaken(data.slugTaken)
      } catch {
        if (!cancelled) setSlugTaken(false)
      } finally {
        if (!cancelled) setCheckingSlug(false)
      }
    }, slugDebounce)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [slug, path, slugDebounce])

  return { nameTaken, slugTaken, checkingName, checkingSlug }
}
