/**
 * ProXHire Client-Side Deterministic Resume Parser
 * 
 * Extracts text from PDF documents using pdfjs-dist and normalizes
 * the extracted text into a structured JSON representation:
 * - Extracted text content
 * - Identified technical skills & tools
 * - Identified work experience & education signals
 * - Contact information signals
 * Caches the parsed JSON structure in local storage and application state.
 */

import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker using dynamic CDN or local fallback
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`
}

export interface ParsedResumeJSON {
  fileName: string
  fileSize: number
  fileType: string
  rawText: string
  extractedSkills: string[]
  detectedEmail?: string
  detectedPhone?: string
  detectedExperienceYears?: number
  parsedAt: string
}

const COMMON_TECH_SKILLS = [
  'react', 'react.js', 'typescript', 'javascript', 'next.js', 'vue', 'angular',
  'node.js', 'express', 'python', 'django', 'fastapi', 'flask', 'java', 'spring boot',
  'c++', 'c#', '.net', 'golang', 'rust', 'ruby', 'php', 'laravel',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'git', 'linux',
  'figma', 'ui/ux', 'wireframing', 'design systems', 'adobe xd',
  'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn',
  'nlp', 'llm', 'generative ai', 'prompt engineering', 'data analysis', 'sql',
  'graphql', 'rest api', 'tailwind css', 'redux', 'microservices', 'system design'
]

/**
 * Extracts raw text from a PDF File or ArrayBuffer using pdfjs-dist
 */
export async function extractTextFromPdf(fileOrBuffer: File | ArrayBuffer): Promise<string> {
  try {
    let arrayBuffer: ArrayBuffer
    if (fileOrBuffer instanceof File) {
      arrayBuffer = await fileOrBuffer.arrayBuffer()
    } else {
      arrayBuffer = fileOrBuffer
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    const pdfDoc = await loadingTask.promise
    const numPages = pdfDoc.numPages
    const textPieces: string[] = []

    for (let pageNum = 1; pageNum <= Math.min(numPages, 10); pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
      textPieces.push(pageText)
    }

    return textPieces.join('\n\n').trim()
  } catch (err: any) {
    console.warn('PDF.js text extraction fallback:', err.message)
    return ''
  }
}

/**
 * Parses raw text into structured JSON with recognized skills, email, phone & tenure
 */
export function parseResumeTextToJSON(
  rawText: string,
  fileName: string = 'Resume.pdf',
  fileSize: number = 0,
  fileType: string = 'application/pdf'
): ParsedResumeJSON {
  const lowerText = rawText.toLowerCase()

  // 1. Identify skills present in text
  const extractedSkills: string[] = []
  COMMON_TECH_SKILLS.forEach(skill => {
    // Word boundary or substring search
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i')
    if (regex.test(lowerText) || lowerText.includes(skill)) {
      extractedSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1))
    }
  })

  // 2. Identify email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const detectedEmail = emailMatch ? emailMatch[0] : undefined

  // 3. Identify phone number
  const phoneMatch = rawText.match(/(?:\+91[\s-]?)?[6-9]\d{9}/)
  const detectedPhone = phoneMatch ? phoneMatch[0] : undefined

  // 4. Identify experience years
  let detectedExperienceYears = 0
  const expMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i)
  if (expMatch) {
    detectedExperienceYears = parseFloat(expMatch[1])
  }

  const result: ParsedResumeJSON = {
    fileName,
    fileSize,
    fileType,
    rawText,
    extractedSkills: Array.from(new Set(extractedSkills)),
    detectedEmail,
    detectedPhone,
    detectedExperienceYears: detectedExperienceYears || undefined,
    parsedAt: new Date().toISOString()
  }

  // Persist to localStorage for offline cache
  try {
    localStorage.setItem('proxhire_parsed_resume_json', JSON.stringify(result))
  } catch {
    // quota exceeded safety
  }

  return result
}

/**
 * Retrieve cached parsed resume JSON from storage
 */
export function getCachedParsedResume(): ParsedResumeJSON | null {
  try {
    const raw = localStorage.getItem('proxhire_parsed_resume_json')
    if (raw) return JSON.parse(raw)
  } catch {
    return null
  }
  return null
}

