import { db } from '../firebase'
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore'
import type { JobCardData } from '../types'
import { fetchPublishedJobsFromSupabase } from '../supabase'

export const DEFAULT_MOCK_JOBS: JobCardData[] = [
  {
    id: 'mock_1',
    company: 'Infosys',
    companyLogoText: 'INFY',
    role: 'Software Development Engineer',
    location: 'Bangalore, Karnataka',
    workType: 'On-site',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    experienceYears: '3-6 Yrs',
    tags: ['Java', 'Spring Boot', 'Microservices'],
    extraTagsCount: 3,
    postedTime: 'Posted 2 days ago',
    isSaved: false,
  },
  {
    id: 'mock_2',
    company: 'TCS',
    companyLogoText: 'TATA',
    role: 'Backend Developer',
    location: 'Hyderabad, Telangana',
    workType: 'Hybrid',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    experienceYears: '2-5 Yrs',
    tags: ['Node.js', 'Express.js', 'MongoDB'],
    extraTagsCount: 2,
    postedTime: 'Posted 1 day ago',
    isSaved: true,
  },
  {
    id: 'mock_3',
    company: 'Accenture',
    companyLogoText: 'ACN',
    role: 'Full Stack Developer',
    location: 'Pune, Maharashtra',
    workType: 'Hybrid',
    jobType: 'Full Time',
    experienceLevel: 'Mid Level',
    experienceYears: '3-7 Yrs',
    tags: ['React', 'Node.js', 'AWS'],
    extraTagsCount: 3,
    postedTime: 'Posted 3 days ago',
    isSaved: false,
  },
  {
    id: 'mock_4',
    company: 'Razorpay',
    companyLogoText: 'RZP',
    role: 'Senior Frontend Engineer',
    location: 'Bengaluru / Remote',
    workType: 'Remote',
    jobType: 'Full Time',
    experienceLevel: 'Senior Level',
    experienceYears: '5-8 Yrs',
    tags: ['React', 'TypeScript', 'Next.js'],
    extraTagsCount: 3,
    postedTime: 'Posted 4 hours ago',
    isSaved: true,
  },
  {
    id: 'mock_5',
    company: 'Swiggy',
    companyLogoText: 'SWG',
    role: 'Frontend Developer',
    location: 'Bengaluru, Karnataka',
    workType: 'Remote',
    jobType: 'Full Time',
    experienceLevel: 'Entry Level',
    experienceYears: '1-3 Yrs',
    tags: ['JavaScript', 'React', 'Tailwind'],
    extraTagsCount: 2,
    postedTime: 'Posted today',
    isSaved: true,
  },
  {
    id: 'mock_6',
    company: 'Microsoft',
    companyLogoText: 'MSFT',
    role: 'Cloud Solutions Architect',
    location: 'Hyderabad, Telangana',
    workType: 'Hybrid',
    jobType: 'Full Time',
    experienceLevel: 'Senior Level',
    experienceYears: '5-9 Yrs',
    tags: ['Azure', 'Kubernetes', 'Microservices'],
    extraTagsCount: 2,
    postedTime: 'Posted 3 days ago',
    isSaved: true,
  },
]

function formatJobDoc(docId: string, data: any): JobCardData {
  const companyName = data.companyName || data.company || 'Verified Employer'
  const logoText =
    data.companyLogoText ||
    companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() ||
    'PROX'

  const workTypeRaw = (data.workType || data.workMode || 'Hybrid').toLowerCase()
  const workType: 'On-site' | 'Hybrid' | 'Remote' =
    workTypeRaw.includes('remote')
      ? 'Remote'
      : workTypeRaw.includes('on-site') || workTypeRaw.includes('onsite') || workTypeRaw.includes('office')
      ? 'On-site'
      : 'Hybrid'

  let expLevel = data.experienceLevel
  if (!expLevel) {
    const expStr = (data.experience || data.experienceYears || '').toLowerCase()
    if (expStr.includes('0') || expStr.includes('1') || expStr.includes('fresher') || expStr.includes('entry')) {
      expLevel = 'Entry Level'
    } else if (expStr.includes('5') || expStr.includes('6') || expStr.includes('7') || expStr.includes('senior')) {
      expLevel = 'Senior Level'
    } else {
      expLevel = 'Mid Level'
    }
  }

  let tags: string[] = Array.isArray(data.tags) ? data.tags : []
  if (tags.length === 0) {
    const title = (data.title || data.role || '').toLowerCase()
    if (title.includes('react') || title.includes('frontend')) tags = ['React', 'TypeScript', 'Web']
    else if (title.includes('node') || title.includes('backend')) tags = ['Node.js', 'Express', 'API']
    else if (title.includes('full')) tags = ['React', 'Node.js', 'Fullstack']
    else tags = [data.department || 'Engineering', 'Problem Solving']
  }

  return {
    id: docId || data.id || `fb_job_${Date.now()}`,
    company: companyName,
    companyLogoText: logoText,
    role: data.title || data.role || 'Software Engineer',
    location: data.location || data.jobLocation || 'Bengaluru, Karnataka',
    workType,
    jobType: data.jobType || data.employmentType || 'Full Time',
    experienceLevel: expLevel,
    experienceYears: data.experienceYears || data.experience || data.jobExp || '2-5 Yrs',
    tags,
    extraTagsCount: Math.max(0, tags.length - 3),
    postedTime: data.postedTime || 'Just posted',
    isSaved: Boolean(data.isSaved),
    salary: data.salary || data.jobSalary || '₹12 - ₹18 LPA',
    description: data.description || undefined,
  }
}

/**
 * Subscribe to real-time Firebase jobs for candidate platform
 */
export function subscribeToCandidateJobs(
  onUpdate: (jobs: JobCardData[]) => void
): () => void {
  const firebaseJobMap = new Map<string, JobCardData>()

  const emitMergedJobs = () => {
    // 1. Convert map to list (real Firebase postings)
    const fbJobs = Array.from(firebaseJobMap.values())

    // 2. Read from localStorage cross-tab posted jobs cache
    try {
      const cached = JSON.parse(localStorage.getItem('proxhire_posted_jobs') || '[]')
      cached.forEach((item: any) => {
        if (!firebaseJobMap.has(item.id)) {
          fbJobs.unshift(formatJobDoc(item.id, item))
        }
      })
    } catch {
      // Ignore
    }

    // 3. Prepend Firebase posted jobs before default starter catalog
    const finalJobList = [...fbJobs, ...DEFAULT_MOCK_JOBS]
    onUpdate(finalJobList)
  }

  // 1. Initial emission with default catalog
  emitMergedJobs()

  // 1b. Fetch jobs from Supabase database 'jobs' table
  fetchPublishedJobsFromSupabase().then(sbJobs => {
    if (sbJobs && sbJobs.length > 0) {
      sbJobs.forEach(job => firebaseJobMap.set(job.id, job))
      emitMergedJobs()
    }
  }).catch(() => null)

  const unsubs: (() => void)[] = []

  // 2. Real-time onSnapshot on candidates collection (where isJobPosting == true)
  try {
    const qJobs = query(collection(db, 'candidates'), where('isJobPosting', '==', true))
    const unsubCandidateJobs = onSnapshot(
      qJobs,
      snapshot => {
        snapshot.docs.forEach(docSnap => {
          const job = formatJobDoc(docSnap.id, docSnap.data())
          firebaseJobMap.set(docSnap.id, job)
        })
        emitMergedJobs()
      },
      err => {
        console.warn('Real-time candidate jobs subscription notice:', err.message)
      }
    )
    unsubs.push(unsubCandidateJobs)
  } catch (err: any) {
    console.warn('Firestore candidate jobs listener setup notice:', err.message)
  }

  // 3. Real-time onSnapshot on companies collection (for latestJob)
  try {
    const unsubCompanies = onSnapshot(
      collection(db, 'companies'),
      snapshot => {
        snapshot.docs.forEach(compDoc => {
          const compData = compDoc.data()
          if (compData.latestJob && compData.latestJob.id) {
            const job = formatJobDoc(compData.latestJob.id, compData.latestJob)
            firebaseJobMap.set(compData.latestJob.id, job)
          }
        })
        emitMergedJobs()
      },
      err => {
        console.warn('Real-time companies jobs subscription notice:', err.message)
      }
    )
    unsubs.push(unsubCompanies)
  } catch (err: any) {
    console.warn('Firestore companies listener setup notice:', err.message)
  }

  // 4. Fallback one-time fetch for robust initial load
  ;(async () => {
    try {
      const q = query(collection(db, 'candidates'), where('isJobPosting', '==', true))
      const snap = await getDocs(q)
      snap.forEach(d => {
        const job = formatJobDoc(d.id, d.data())
        firebaseJobMap.set(d.id, job)
      })
      emitMergedJobs()
    } catch (e) {
      // Ignored
    }
  })()

  // 5. Cross-tab storage listener so posting in Employer immediately reflects in Candidate tab
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'proxhire_posted_jobs') {
      emitMergedJobs()
    }
  }
  window.addEventListener('storage', handleStorageChange)

  return () => {
    unsubs.forEach(u => u())
    window.removeEventListener('storage', handleStorageChange)
  }
}
