import React, { createContext, useContext, useState, useEffect } from 'react'
import type { CandidateStep, CandidateRegistrationState, ExperienceCategory } from '../types'
import confetti from 'canvas-confetti'

interface CandidateContextType {
  step: CandidateStep
  formData: CandidateRegistrationState
  updateField: <K extends keyof CandidateRegistrationState>(key: K, value: CandidateRegistrationState[K]) => void
  setStep: (step: CandidateStep) => void
  nextStep: () => void
  prevStep: () => void
  viewMode: 'registration' | 'dashboard' | 'login'
  setViewMode: (mode: 'registration' | 'dashboard' | 'login') => void
  completeRegistration: () => Promise<void>
  isSubmitting: boolean
}

const INITIAL_STATE: CandidateRegistrationState = {
  experienceCategory: 'fresher',

  fullName: 'Sree Kumar',
  email: 'sreekumar.student@gmail.com',
  countryCode: '+91',
  mobileNumber: '98765 43210',
  panNumber: 'ABCDE1234F',
  password: 'Password@123',
  confirmPassword: 'Password@123',
  preBgvConsent: true,
  agreeTerms: true,

  resumeFileName: 'SreeKumar_Resume_SoftwareEngineer.pdf',
  profileSummary: 'Enthusiastic and results-driven Software Engineer with solid foundation in full-stack web development, data structures, and cloud computing. Passionate about building robust systems and scalable products.',
  educations: [
    {
      id: '1',
      institution: 'Bangalore Institute of Technology',
      degree: 'B.Tech',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: '2022',
      endYear: '2026',
      gradeOrCgpa: '8.8 CGPA'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Java', 'SQL', 'Git', 'Data Structures'],

  experiences: [],
  projects: [
    {
      id: '1',
      title: 'Full Stack Job Matching Engine',
      role: 'Lead Developer',
      techStack: 'React, Node.js, PostgreSQL',
      description: 'Engineered an intelligent recommendation portal matching candidates with pre-verified job postings.'
    }
  ],
  preferredRole: 'Frontend Developer',
  industry: 'Information Technology',
  department: 'Engineering',
  employmentType: 'Full Time',
  preferredLocations: ['Bangalore', 'Hyderabad', 'Remote'],
  workType: 'Hybrid',
  preferredShifts: 'Day',
  expectedCtc: '₹6 - ₹10 LPA',

  dateOfBirth: '15/08/2003',
  nationality: 'Indian',
  gender: 'Male',
  category: 'General',
  maritalStatus: 'Single',
  workPermit: 'Yes',
  addressLine1: 'Flat 402, Green Glen Layout, Bellandur',
  addressLine2: 'Outer Ring Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560103',
  hasDisability: 'No',
  hasCareerGap: 'No',
  govtExperience: 'No',
  openToRelocate: 'Yes',
  linkedInUrl: 'https://www.linkedin.com/in/sreekumar-profile',
  gitHubUrl: 'https://github.com/sreekumar-student',
  portfolioUrl: 'https://sreekumar.dev',
  achievements: ['Smart India Hackathon 2025 Finalist', 'Certified AWS Cloud Practitioner'],

  finalConfirmed: true
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export const CandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStepState] = useState<CandidateStep>(1)
  const [formData, setFormData] = useState<CandidateRegistrationState>(() => {
    const saved = localStorage.getItem('proxhire_candidate_registration')
    if (saved) {
      try {
        return { ...INITIAL_STATE, ...JSON.parse(saved) }
      } catch {
        return INITIAL_STATE
      }
    }
    return INITIAL_STATE
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'registration' | 'dashboard' | 'login'>('registration')

  useEffect(() => {
    localStorage.setItem('proxhire_candidate_registration', JSON.stringify(formData))
  }, [formData])

  const setStep = (newStep: CandidateStep) => {
    setStepState(newStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextStep = () => {
    if (step < 6) {
      setStep((step + 1) as CandidateStep)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep((step - 1) as CandidateStep)
    }
  }

  const updateField = <K extends keyof CandidateRegistrationState>(
    key: K,
    value: CandidateRegistrationState[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const completeRegistration = async () => {
    setIsSubmitting(true)
    try {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        })
      } catch {
        // Ignore
      }

      localStorage.setItem('proxhire_candidate_registered', 'true')
      setViewMode('dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CandidateContext.Provider
      value={{
        step,
        formData,
        updateField,
        setStep,
        nextStep,
        prevStep,
        viewMode,
        setViewMode,
        completeRegistration,
        isSubmitting
      }}
    >
      {children}
    </CandidateContext.Provider>
  )
}

export const useCandidate = () => {
  const context = useContext(CandidateContext)
  if (!context) {
    throw new Error('useCandidate must be used within CandidateProvider')
  }
  return context
}
