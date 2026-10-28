import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

export const DEFAULT_POPULAR_SKILLS: string[] = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'SQL',
  'AWS',
  'Docker',
  'Git',
  'Next.js',
  'MongoDB',
  'Tailwind CSS',
  'GraphQL',
  'Express'
]

const LOCAL_STORAGE_KEY = 'proxy_form_options'

function getInitialSkills(): string[] {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed.popularSkills) && parsed.popularSkills.length > 0) {
        return parsed.popularSkills
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return DEFAULT_POPULAR_SKILLS
}

export function usePopularSkills() {
  const [popularSkills, setPopularSkills] = useState<string[]>(getInitialSkills)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    try {
      const settingsRef = doc(db, 'settings', 'formOptions')
      const unsub = onSnapshot(
        settingsRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            if (Array.isArray(data.popularSkills) && data.popularSkills.length > 0) {
              setPopularSkills(data.popularSkills)
              try {
                const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
                const currentObj = cached ? JSON.parse(cached) : {}
                currentObj.popularSkills = data.popularSkills
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentObj))
              } catch {
                // Ignore storage error
              }
            }
          }
          setLoading(false)
        },
        (error) => {
          console.warn('Could not subscribe to popularSkills from Firestore (using defaults):', error)
          setLoading(false)
        }
      )
      return () => unsub()
    } catch (err) {
      console.warn('Error setting up popularSkills listener:', err)
      setLoading(false)
    }
  }, [])

  return { popularSkills, loading }
}
