/**
 * ProXHire Deterministic ATS (Applicant Tracking System) Scoring Engine
 * 
 * Multi-factor 100-point algorithmic matching:
 * 1. Skill Match (40%): Required vs candidate skills with alias normalization
 * 2. Title & Role Relevance (25%): Semantic role matching with alias dictionary
 * 3. Experience Tenure Match (20%): Required years vs candidate actual years
 * 4. Domain & Keyword Overlap (15%): Job description term frequency in resume/projects
 */

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
}

// Canonical tech skill aliases mapping for bulletproof matching
const SKILL_ALIASES: Record<string, string[]> = {
  react: ['react', 'react.js', 'reactjs', 'react 18', 'react 19'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js', 'es6', 'ecmascript'],
  nodejs: ['nodejs', 'node.js', 'node'],
  python: ['python', 'python3', 'py'],
  aws: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  docker: ['docker', 'containerization', 'containers'],
  kubernetes: ['kubernetes', 'k8s'],
  postgresql: ['postgresql', 'postgres', 'psql'],
  mongodb: ['mongodb', 'mongo'],
  sql: ['sql', 'mysql', 'mssql', 'relational database'],
  graphql: ['graphql', 'apollo'],
  nextjs: ['nextjs', 'next.js', 'next'],
  figma: ['figma', 'ui design', 'ux design', 'wireframing'],
  machinelearning: ['machine learning', 'ml', 'deep learning', 'neural networks', 'scikit-learn', 'tensorflow', 'pytorch'],
  artificialintelligence: ['artificial intelligence', 'ai', 'genai', 'generative ai', 'llm', 'large language models', 'langchain', 'huggingface', 'rag'],
  tailwind: ['tailwind', 'tailwindcss', 'tailwind css'],
  redux: ['redux', 'redux toolkit', 'rtk'],
  devops: ['devops', 'ci/cd', 'github actions', 'jenkins', 'terraform'],
  agile: ['agile', 'scrum', 'sprint planning', 'jira']
}

// Canonical title synonyms
const TITLE_SYNONYMS: Record<string, string[]> = {
  'frontend developer': ['frontend', 'front end', 'react developer', 'ui developer', 'web developer', 'client engineer', 'frontend engineer', 'javascript developer'],
  'backend engineer': ['backend', 'back end', 'server engineer', 'api developer', 'java developer', 'python developer', 'node developer', 'backend developer'],
  'full stack developer': ['full stack', 'fullstack', 'software engineer', 'web engineer', 'full stack engineer'],
  'ai engineer': ['ai engineer', 'machine learning engineer', 'ml engineer', 'artificial intelligence', 'deep learning engineer', 'data scientist', 'genai engineer', 'nlp engineer'],
  'devops engineer': ['devops', 'cloud engineer', 'sre', 'site reliability engineer', 'platform engineer', 'infrastructure engineer', 'cloud architect'],
  'ui/ux designer': ['ui/ux', 'product designer', 'ux designer', 'ui designer', 'visual designer', 'interaction designer'],
  'product manager': ['product manager', 'pm', 'associate product manager', 'product owner', 'product lead'],
  'data engineer': ['data engineer', 'big data engineer', 'etl developer', 'data platform engineer'],
  'hr executive': ['hr', 'talent acquisition', 'recruiter', 'hr executive', 'human resources', 'people operations']
}

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function normalizeSkill(skill: string): string {
  const norm = normalizeToken(skill)
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some(a => normalizeToken(a) === norm)) {
      return canonical
    }
  }
  return norm
}

export function parseRequiredExperienceYears(expStr?: string): number {
  if (!expStr) return 2 // sensible default
  const lower = expStr.toLowerCase()

  if (lower.includes('fresher') || lower.includes('entry') || lower.includes('0-')) return 0
  if (lower.includes('1-2') || lower.includes('1-3') || lower.includes('1+')) return 1
  if (lower.includes('2-4') || lower.includes('2-5') || lower.includes('2+')) return 2
  if (lower.includes('3-5') || lower.includes('3-6') || lower.includes('3+')) return 3
  if (lower.includes('5-8') || lower.includes('5+') || lower.includes('senior')) return 5
  if (lower.includes('8+') || lower.includes('lead') || lower.includes('architect')) return 8

  // Regex extract first digit
  const match = expStr.match(/(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 2
}

/**
 * Calculates a complete ATS Match Breakdown out of 100
 */
export function calculateATSScore(
  job: JobRequirementsInput,
  candidate: CandidateProfileInput
): ATSBreakdown {
  const recommendations: string[] = []

  // 1. Skill Match (Max 40 points)
  const jobRawSkills = [
    ...(job.skills || []),
    ...(job.tags || [])
  ].filter(Boolean)

  // Dedup and normalize job skills
  const jobNormMap = new Map<string, string>() // normalized -> display
  jobRawSkills.forEach(s => {
    const norm = normalizeSkill(s)
    if (!jobNormMap.has(norm)) {
      jobNormMap.set(norm, s)
    }
  })

  // Candidate skills pool
  const candidateRawSkills = [
    ...(candidate.skills || []),
    ...(candidate.projects?.flatMap(p => p.skillsUsed || []) || [])
  ]

  // Add skills found in raw resume text if available
  if (candidate.resumeRawText) {
    const resumeLower = candidate.resumeRawText.toLowerCase()
    Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
      if (aliases.some(a => resumeLower.includes(a))) {
        candidateRawSkills.push(canonical)
      }
    })
  }

  const candidateNormSkills = new Set(candidateRawSkills.map(s => normalizeSkill(s)))

  const matchedSkills: string[] = []
  const missingSkills: string[] = []

  jobNormMap.forEach((displayName, normKey) => {
    if (candidateNormSkills.has(normKey)) {
      matchedSkills.push(displayName)
    } else {
      missingSkills.push(displayName)
    }
  })

  const totalRequiredSkillsCount = jobNormMap.size || 1
  const skillRatio = matchedSkills.length / totalRequiredSkillsCount
  const skillScore = Math.round(skillRatio * 40)

  if (missingSkills.length > 0) {
    recommendations.push(
      `Add key missing skills: [${missingSkills.slice(0, 3).join(', ')}] to your resume to increase ATS match by up to ${Math.round((missingSkills.length / totalRequiredSkillsCount) * 40)} points.`
    )
  }

  // 2. Title & Role Relevance (Max 25 points)
  let titleScore = 12 // baseline for registered platform applicants
  const jobTitleLower = job.title.toLowerCase()
  const candidateTitle = (
    candidate.preferredRole ||
    candidate.currentTitle ||
    candidate.experiences?.[0]?.title ||
    ''
  ).toLowerCase()

  if (candidateTitle) {
    if (candidateTitle === jobTitleLower) {
      titleScore = 25
    } else {
      let isSynonymMatched = false
      for (const [, aliases] of Object.entries(TITLE_SYNONYMS)) {
        const matchesJob = aliases.some(a => jobTitleLower.includes(a))
        const matchesCand = aliases.some(a => candidateTitle.includes(a))
        if (matchesJob && matchesCand) {
          isSynonymMatched = true
          break
        }
      }

      if (isSynonymMatched) {
        titleScore = 24
      } else {
        // Token overlap
        const jobWords = jobTitleLower.split(/\s+/).filter(w => w.length > 2)
        const candWords = candidateTitle.split(/\s+/).filter(w => w.length > 2)
        const overlap = jobWords.filter(w => candWords.some(cw => cw.includes(w) || w.includes(cw)))
        if (overlap.length >= 2) {
          titleScore = 20
        } else if (overlap.length === 1) {
          titleScore = 16
        } else {
          titleScore = 10
          recommendations.push(
            `Align your professional headline closer to "${job.title}" to pass recruiter keyword filters.`
          )
        }
      }
    }
  } else {
    titleScore = 15
  }

  // 3. Experience Tenure Match (Max 20 points)
  const reqExpYears = parseRequiredExperienceYears(
    job.experienceRequired || job.experienceYears || job.experienceLevel
  )
  const candExpYears = candidate.experienceYears ?? (
    candidate.experiences?.length ? candidate.experiences.length * 1.5 : 1
  )

  let experienceScore = 20
  const isSatisfied = candExpYears >= reqExpYears

  if (candExpYears >= reqExpYears) {
    experienceScore = 20
  } else if (reqExpYears - candExpYears <= 1) {
    experienceScore = 16
  } else if (reqExpYears - candExpYears <= 2) {
    experienceScore = 11
    recommendations.push(
      `Role recommends ${reqExpYears}+ years experience. Emphasize senior-level production projects to compensate for tenure.`
    )
  } else {
    experienceScore = 7
    recommendations.push(
      `Highlight relevant coursework, freelance projects, and open-source contributions to showcase practical competency.`
    )
  }

  // 4. Domain & Keywords Overlap (Max 15 points)
  const descText = (job.description || '').toLowerCase()
  const candidateCorpus = [
    candidate.profileSummary || '',
    ...(candidate.projects?.map(p => `${p.title} ${p.description}`) || []),
    ...(candidate.experiences?.map(e => `${e.company} ${e.description}`) || []),
    candidate.resumeRawText || ''
  ].join(' ').toLowerCase()

  // Extract meaningful keywords from job description (length > 4, non-generic)
  const stopWords = new Set([
    'about', 'their', 'there', 'which', 'would', 'could', 'should', 'responsibilities',
    'looking', 'candidate', 'experience', 'ability', 'working', 'skills', 'strong',
    'company', 'ensure', 'closely', 'across', 'within', 'deliver', 'products'
  ])

  const descWords = Array.from(new Set(
    descText
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !stopWords.has(w))
  )).slice(0, 15)

  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []

  descWords.forEach(kw => {
    if (candidateCorpus.includes(kw)) {
      matchedKeywords.push(kw)
    } else {
      missingKeywords.push(kw)
    }
  })

  let domainScore = 12
  if (descWords.length > 0) {
    const domainRatio = matchedKeywords.length / descWords.length
    domainScore = Math.max(6, Math.min(15, Math.round(domainRatio * 15)))
  }

  const totalScore = Math.min(100, Math.max(0, skillScore + titleScore + experienceScore + domainScore))

  let rating: ATSBreakdown['rating'] = 'Moderate Match'
  if (totalScore >= 90) rating = 'Exceptional Fit'
  else if (totalScore >= 75) rating = 'Strong Match'
  else if (totalScore >= 60) rating = 'Moderate Match'
  else rating = 'Low Match'

  return {
    totalScore,
    skillScore,
    skillMax: 40,
    titleScore,
    titleMax: 25,
    experienceScore,
    experienceMax: 20,
    domainScore,
    domainMax: 15,
    rating,
    matchedSkills,
    missingSkills,
    matchedKeywords,
    missingKeywords,
    experienceAnalysis: {
      requiredYears: reqExpYears,
      candidateYears: candExpYears,
      isSatisfied
    },
    recommendations
  }
}

