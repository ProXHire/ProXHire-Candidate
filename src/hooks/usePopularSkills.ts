import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

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
    const apply = (data: any) => {
      if (Array.isArray(data?.popularSkills) && data.popularSkills.length > 0) {
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

    supabase
      .from('app_settings')
      .select('data')
      .eq('id', 'formOptions')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.warn('Could not load popularSkills from Supabase (using defaults):', error.message)
        else apply(data?.data)
        setLoading(false)
      })

    const channel = supabase
      .channel('app_settings:formOptions:skills')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings', filter: 'id=eq.formOptions' }, (payload: any) => {
        apply(payload.new?.data)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { popularSkills, loading }
}
