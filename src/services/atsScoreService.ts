/**
 * ProXHire Deterministic ATS (Applicant Tracking System) Scoring Engine
 * 
 * Selected Architecture: Option A (Hybrid Client-Side Engine + Backend Storage)
 * Formula Specification (Section 5):
 * Total ATS Score = S_skills (40%) + S_title (25%) + S_experience (20%) + S_domain (15%)
 * 
 * Rules:
 * - Deterministic pure function: score(parsedResumeJson, jobPosting)
 * - Zero external AI / LLM API calls, zero non-deterministic responses
 * - Each component rounded to 1 decimal place; final total rounded to an integer (0-100)
 */

import type { ParsedResumeDocument } from './resumeParser'

export interface ATSBreakdown {
  totalScore: number
  skillScore: number
  skillMax: number
  titleScore: number
  titleMax: number
  experienceScore: number
  experienceMax: number
  domainScore: number
  domainMax: number
  rating: 'Exceptional Fit' | 'Strong Match' | 'Moderate Match' | 'Low Match'
  matchedSkills: string[]
  missingSkills: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
  experienceAnalysis: {
    requiredYears: number
    candidateYears: number
    isSatisfied: boolean
  }
  recommendations: string[]
}

export interface JobRequirementsInput {
  title: string
  skills?: string[]
  tags?: string[]
  description?: string
  experienceRequired?: string
  experienceYears?: string
  experienceLevel?: string
  department?: string
}

export interface CandidateProfileInput {
  fullName?: string
  preferredRole?: string
  currentTitle?: string
  skills?: string[]
  experienceYears?: number
  experiences?: Array<{
    title?: string
    designation?: string
    company?: string
    description?: string
    duration?: string
    years?: number
  }>
  profileSummary?: string
  projects?: Array<{
    title?: string
    description?: string
    skillsUsed?: string[]
  }>
  resumeRawText?: string
  parsedResumeDocument?: ParsedResumeDocument
}

// 5.1 Canonical skill aliases dictionary as specified in Section 5.1
export const ALIAS_NORMALIZATION_MAP: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  'react.js': 'react',
  reactjs: 'react',
  react: 'react',
  node: 'nodejs',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  postgres: 'postgresql',
  psql: 'postgresql',
  postgresql: 'postgresql',
  dl: 'deep learning',
  'deep learning': 'deep learning',
  ml: 'machine learning',
  'machine learning': 'machine learning',
  tf: 'tensorflow',
  tensorflow: 'tensorflow',
  nlp: 'natural language processing',
  'natural language processing': 'natural language processing',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  py: 'python',
  python: 'python',
  fastapi: 'fastapi',
  docker: 'docker',
  pytorch: 'pytorch',
  torch: 'pytorch',
  transformers: 'transformers',
  huggingface: 'transformers',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  figma: 'figma',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  redux: 'redux',
  graphql: 'graphql',
  nextjs: 'nextjs',
  'next.js': 'nextjs',
  git: 'git',
  ci: 'devops',
  cicd: 'devops',
  devops: 'devops',
  agile: 'agile',
  scrum: 'agile'
}

// 5.2 Canonical role relation table
export const DIRECT_TITLE_MATCHES: Record<string, string[]> = {
  'ai engineer': ['ai engineer', 'machine learning engineer', 'ml engineer', 'artificial intelligence engineer', 'deep learning engineer'],
  'frontend developer': ['frontend developer', 'frontend engineer', 'ui developer', 'react developer', 'web developer'],
  'backend engineer': ['backend engineer', 'backend developer', 'server engineer', 'api developer', 'java developer', 'python developer', 'node developer'],
  'full stack developer': ['full stack developer', 'fullstack developer', 'full stack engineer', 'software engineer'],
  'devops engineer': ['devops engineer', 'cloud engineer', 'sre', 'site reliability engineer', 'platform engineer'],
  'ui/ux designer': ['ui/ux designer', 'product designer', 'ux designer', 'ui designer'],
  'product manager': ['product manager', 'technical product manager', 'associate product manager', 'product owner'],
  'data engineer': ['data engineer', 'big data engineer', 'etl developer'],
  'hr executive': ['hr executive', 'recruiter', 'talent acquisition', 'people operations']
}

export const RELATED_STEM_MATCHES: Record<string, string[]> = {
  'ai engineer': ['data scientist', 'python developer', 'research scientist', 'algorithm engineer'],
  'frontend developer': ['javascript developer', 'web designer', 'ui designer', 'mobile developer'],
  'backend engineer': ['database engineer', 'systems engineer', 'devops engineer', 'full stack developer'],
  'full stack developer': ['frontend developer', 'backend engineer', 'software developer'],
  'devops engineer': ['linux administrator', 'infrastructure engineer', 'cloud architect', 'backend engineer'],
  'ui/ux designer': ['visual designer', 'graphic designer', 'design lead', 'frontend developer'],
  'product manager': ['business analyst', 'project manager', 'scrum master', 'operations lead']
}

export const ADJACENT_ROLES: Record<string, string[]> = {
  'ai engineer': ['backend engineer', 'software engineer', 'data analyst'],
  'frontend developer': ['full stack developer', 'ui/ux designer', 'qa engineer'],
  'backend engineer': ['full stack developer', 'data engineer', 'devops engineer'],
  'full stack developer': ['cloud engineer', 'qa engineer'],
  'devops engineer': ['system administrator', 'network engineer', 'backend engineer'],
  'ui/ux designer': ['product manager', 'brand designer'],
  'product manager': ['strategy consultant', 'marketing manager']
}

const STOP_WORDS = new Set([
  'the', 'and', 'with', 'for', 'that', 'this', 'from', 'have', 'been', 'were',
  'will', 'would', 'could', 'should', 'about', 'their', 'there', 'which', 'also',
  'using', 'used', 'into', 'over', 'than', 'more', 'when', 'what', 'some', 'such',
  'company', 'looking', 'role', 'work', 'working', 'skills', 'experience', 'ability',
  'candidate', 'team', 'teams', 'responsibilities', 'ensure', 'closely', 'across', 'within'
])

export function normalizeSkillToken(token: string): string {
  const clean = token.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  return ALIAS_NORMALIZATION_MAP[clean] || clean
}

export function parseMinimumTenureYears(expStr?: string): number {
  if (!expStr) return 2.0
  const lower = expStr.toLowerCase()

  if (lower.includes('fresher') || lower.includes('entry') || lower.includes('0-')) return 0.0
  if (lower.includes('1-2') || lower.includes('1-3') || lower.includes('1+')) return 1.0
  if (lower.includes('2-4') || lower.includes('2-5') || lower.includes('2+')) return 2.0
  if (lower.includes('3-5') || lower.includes('3-6') || lower.includes('3+')) return 3.0
  if (lower.includes('5-8') || lower.includes('5+') || lower.includes('senior')) return 5.0
  if (lower.includes('8+') || lower.includes('lead') || lower.includes('architect')) return 8.0

  const match = expStr.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 2.0
}

/**
 * Calculates deterministic ATS Score (0-100)
 * Evaluates candidate against a job according to System Design Section 5
 */
export function calculateATSScore(
  job: JobRequirementsInput,
  candidate: CandidateProfileInput | ParsedResumeDocument
): ATSBreakdown {
  const recommendations: string[] = []

  // Extract candidate data supporting either direct input or ParsedResumeDocument
  const isDoc = 'sections' in candidate && 'candidateInfo' in candidate
  const doc = isDoc ? (candidate as ParsedResumeDocument) : undefined
  const prof = !isDoc ? (candidate as CandidateProfileInput) : undefined

  const candidateRawSkills = [
    ...(doc?.sections.skills || []),
    ...(prof?.skills || []),
    ...(prof?.projects?.flatMap(p => p.skillsUsed || []) || [])
  ]

  const candidateTitle = (
    prof?.preferredRole ||
    prof?.currentTitle ||
    prof?.experiences?.[0]?.title ||
    doc?.sections.workExperience?.[0]?.title ||
    ''
  ).toLowerCase().trim()

  const candidateExpYears = doc?.computedMetrics?.totalExperienceYears
    ?? prof?.experienceYears
    ?? (prof?.experiences?.length ? prof.experiences.length * 1.5 : 1.0)

  const candidateCorpus = [
    doc?.rawText || '',
    prof?.resumeRawText || '',
    prof?.profileSummary || doc?.sections.profileSummary || '',
    ...(prof?.projects?.map(p => `${p.title} ${p.description}`) || []),
    ...(prof?.experiences?.map(e => `${e.company} ${e.title} ${e.description}`) || []),
    ...(doc?.sections.workExperience?.map(w => `${w.company} ${w.title} ${w.description || ''}`) || [])
  ].join(' ').toLowerCase()

  // --------------------------------------------------------------------------
  // 5.1 Skills Match (40 points max)
  // S_skills = (|Matched Skills| / |Job Required Skills|) * 40
  // --------------------------------------------------------------------------
  const jobSkillsList = [
    ...(job.skills || []),
    ...(job.tags || [])
  ].filter(Boolean)

  // Deduplicate and normalize job skills
  const jobNormMap = new Map<string, string>() // normalized -> original
  jobSkillsList.forEach(s => {
    const norm = normalizeSkillToken(s)
    if (!jobNormMap.has(norm)) {
      jobNormMap.set(norm, s)
    }
  })

  // Normalize candidate skills
  const candidateNormSkills = new Set<string>()
  candidateRawSkills.forEach(s => candidateNormSkills.add(normalizeSkillToken(s)))

  // Also match canonical aliases directly found in candidate resume text
  Object.entries(ALIAS_NORMALIZATION_MAP).forEach(([alias, canonical]) => {
    if (candidateCorpus.includes(alias)) {
      candidateNormSkills.add(canonical)
    }
  })

  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  jobNormMap.forEach((origName, normKey) => {
    if (candidateNormSkills.has(normKey)) {
      matchedSkills.push(origName)
    } else {
      missingSkills.push(origName)
    }
  })

  let skillScore = 40.0
  const totalRequiredSkillsCount = jobNormMap.size

  if (totalRequiredSkillsCount > 0) {
    const ratio = matchedSkills.length / totalRequiredSkillsCount
    skillScore = Math.round(ratio * 40.0 * 10) / 10
  }

  if (missingSkills.length > 0) {
    recommendations.push(
      `Add key missing skills: [${missingSkills.slice(0, 3).join(', ')}] to your resume to increase ATS match by up to ${Math.round((missingSkills.length / (totalRequiredSkillsCount || 1)) * 40)} points.`
    )
  }

  // --------------------------------------------------------------------------
  // 5.2 Title & Role Relevance (25 points max)
  // Direct: 25.0 | Related stem: 19.0 | Adjacent: 12.0 | Non-relevant: 3.0
  // --------------------------------------------------------------------------
  let titleScore = 12.0 // baseline default
  const jobTitleNorm = job.title.toLowerCase().trim()

  if (candidateTitle) {
    if (candidateTitle === jobTitleNorm) {
      titleScore = 25.0
    } else {
      // 1. Direct match check
      let isDirect = false
      for (const [key, aliases] of Object.entries(DIRECT_TITLE_MATCHES)) {
        const matchesJob = jobTitleNorm.includes(key) || aliases.some(a => jobTitleNorm.includes(a))
        const matchesCand = candidateTitle.includes(key) || aliases.some(a => candidateTitle.includes(a))
        if (matchesJob && matchesCand) {
          isDirect = true
          break
        }
      }

      if (isDirect) {
        titleScore = 25.0
      } else {
        // 2. Related stem check
        let isRelated = false
        for (const [key, relatedList] of Object.entries(RELATED_STEM_MATCHES)) {
          if (jobTitleNorm.includes(key) && relatedList.some(r => candidateTitle.includes(r))) {
            isRelated = true
            break
          }
        }

        if (isRelated) {
          titleScore = 19.0
        } else {
          // 3. Adjacent role check
          let isAdjacent = false
          for (const [key, adjList] of Object.entries(ADJACENT_ROLES)) {
            if (jobTitleNorm.includes(key) && adjList.some(a => candidateTitle.includes(a))) {
              isAdjacent = true
              break
            }
          }

          if (isAdjacent) {
            titleScore = 12.0
          } else {
            // Token overlap fallback
            const jobWords = jobTitleNorm.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
            const candWords = candidateTitle.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
            const overlap = jobWords.filter(w => candWords.some(cw => cw.includes(w) || w.includes(cw)))

            if (overlap.length >= 2) {
              titleScore = 18.0
            } else if (overlap.length === 1) {
              titleScore = 14.0
            } else {
              titleScore = 3.0
              recommendations.push(
                `Align your professional headline closer to "${job.title}" to pass recruiter keyword filters.`
              )
            }
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5.3 Experience Tenure (20 points max)
  // S_experience = 20 if T_candidate >= T_min; otherwise 20 * (T_candidate / T_min)
  // --------------------------------------------------------------------------
  const tMin = parseMinimumTenureYears(job.experienceRequired || job.experienceYears || job.experienceLevel)
  const tCandidate = candidateExpYears

  let experienceScore = 20.0
  const isSatisfied = tCandidate >= tMin

  if (tMin <= 0 || tCandidate >= tMin) {
    experienceScore = 20.0
  } else {
    experienceScore = Math.round(20.0 * (tCandidate / tMin) * 10) / 10
    recommendations.push(
      `Role recommends ${tMin}+ years experience. Highlight high-impact production projects to compensate for tenure.`
    )
  }

  // --------------------------------------------------------------------------
  // 5.4 Description Keyword & Domain Overlap (15 points max)
  // S_domain = min(15, (|Matched Keywords| / |Expected Keywords|) * 15)
  // --------------------------------------------------------------------------
  const descText = (job.description || '').toLowerCase()
  const expectedKeywords = Array.from(new Set(
    descText
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOP_WORDS.has(w))
  )).slice(0, 15)

  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []

  expectedKeywords.forEach(kw => {
    if (candidateCorpus.includes(kw) || (doc?.computedMetrics.tokenFrequency[kw] || 0) > 0) {
      matchedKeywords.push(kw)
    } else {
      missingKeywords.push(kw)
    }
  })

  let domainScore = 15.0
  if (expectedKeywords.length > 0) {
    const ratio = matchedKeywords.length / expectedKeywords.length
    domainScore = Math.min(15.0, Math.round(ratio * 15.0 * 10) / 10)
  }

  // Final Total Score
  const rawTotal = skillScore + titleScore + experienceScore + domainScore
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)))

  let rating: ATSBreakdown['rating'] = 'Moderate Match'
  if (totalScore >= 90) rating = 'Exceptional Fit'
  else if (totalScore >= 75) rating = 'Strong Match'
  else if (totalScore >= 60) rating = 'Moderate Match'
  else rating = 'Low Match'

  return {
    totalScore,
    skillScore: Math.round(skillScore * 10) / 10,
    skillMax: 40,
    titleScore: Math.round(titleScore * 10) / 10,
    titleMax: 25,
    experienceScore: Math.round(experienceScore * 10) / 10,
    experienceMax: 20,
    domainScore: Math.round(domainScore * 10) / 10,
    domainMax: 15,
    rating,
    matchedSkills,
    missingSkills,
    matchedKeywords,
    missingKeywords,
    experienceAnalysis: {
      requiredYears: tMin,
      candidateYears: tCandidate,
      isSatisfied
    },
    recommendations
  }
}

/**
 * 5.5 Shared Test Vectors Suite to verify client-backend parity
 */
export const ATS_TEST_VECTORS = [
  {
    name: 'Vector 1: Senior AI Engineer with high fit',
    job: {
      title: 'AI Engineer',
      skills: ['Python', 'PyTorch', 'Docker', 'Kubernetes', 'FastAPI'],
      experienceYears: '3 Years',
      description: 'Design and deploy deep learning models, FastAPI services, and Kubernetes clusters.'
    },
    candidate: {
      preferredRole: 'AI Engineer',
      skills: ['Python', 'PyTorch', 'Docker', 'FastAPI'],
      experienceYears: 3.5,
      resumeRawText: 'Experienced with deep learning models, FastAPI services and production Kubernetes.'
    },
    expectedMinScore: 90
  },
  {
    name: 'Vector 2: Frontend developer with moderate match for fullstack',
    job: {
      title: 'Full Stack Developer',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      experienceYears: '4 Years',
      description: 'Develop responsive React web apps and microservices with PostgreSQL.'
    },
    candidate: {
      preferredRole: 'Frontend Developer',
      skills: ['React', 'TypeScript'],
      experienceYears: 2.0,
      resumeRawText: 'Specialized in React, TypeScript, and modern responsive frontend design systems.'
    },
    expectedMaxScore: 75
  }
]
