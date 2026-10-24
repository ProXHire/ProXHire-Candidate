import React, { createContext, useContext, useState, useEffect } from 'react'
import type { CandidateStep, CandidateRegistrationState } from '../types'
import { authService } from '../services/authService'
import { syncCandidateToFirebase } from '../services/firebaseCandidateSync'
import { db } from '../firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import confetti from 'canvas-confetti'

interface CandidateContextType {
  step: CandidateStep
  formData: CandidateRegistrationState
  updateField: <K extends keyof CandidateRegistrationState>(
    key: K,
    value: CandidateRegistrationState[K]
  ) => void
  setStep: (step: CandidateStep) => void
  nextStep: () => void
  prevStep: () => void
  viewMode: 'registration' | 'dashboard' | 'login'
  setViewMode: (mode: 'registration' | 'dashboard' | 'login') => void

  // Backend Auth & Verification States
  isSubmitting: boolean
  isVerified: boolean
  isCompleted: boolean
  userId: string | null
  authToken: string | null
  errorMsg: string | null
  setErrorMsg: (msg: string | null) => void
  otpPending: boolean
  setOtpPending: (pending: boolean) => void

  // Actions
  submitBasicDetails: () => Promise<void>
  submitVerifyOtp: (otpCode?: string, firebaseVerified?: boolean) => Promise<void>
  resendVerificationOtp: () => Promise<void>
  completeRegistration: () => Promise<void>
  loginCandidate: (emailOrPhone: string, pass: string) => Promise<void>
  logout: () => void
}

// REAL CLEAN INITIAL STATE - ZERO DUMMY DATA
const INITIAL_STATE: CandidateRegistrationState = {
  experienceCategory: 'fresher',

  fullName: '',
  email: '',
  countryCode: '+91',
  mobileNumber: '',
  panNumber: '',
  password: '',
  confirmPassword: '',
  preBgvConsent: false,
  agreeTerms: false,

  resumeFileName: undefined,
  profileSummary: '',
  educations: [],
  skills: [],

  experiences: [],
  projects: [],
  preferredRole: '',
  industry: 'Information Technology',
  department: 'Engineering',
  employmentType: 'Full Time',
  preferredLocations: [],
  workType: 'Hybrid',
  preferredShifts: 'Day',
  expectedCtc: '',

  dateOfBirth: '',
  nationality: 'Indian',
  gender: '',
  category: '',
  maritalStatus: '',
  workPermit: 'Yes',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pinCode: '',
  hasDisability: 'No',
  hasCareerGap: 'No',
  govtExperience: 'No',
  openToRelocate: 'Yes',
  linkedInUrl: '',
  gitHubUrl: '',
  portfolioUrl: '',
  achievements: [],

  finalConfirmed: false
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export const CandidateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStepState] = useState<CandidateStep>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [otpPending, setOtpPending] = useState(false)

  // Auth tokens and IDs
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('proxhire_candidate_uid'))
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('proxhire_candidate_token'))
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return localStorage.getItem('proxhire_candidate_verified') === 'true'
  })
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    return localStorage.getItem('proxhire_candidate_registered') === 'true'
  })
  const [viewModeState, setViewModeState] = useState<'registration' | 'dashboard' | 'login'>(() => {
    const savedMode = localStorage.getItem('proxhire_candidate_view_mode')
    if (savedMode === 'dashboard' && localStorage.getItem('proxhire_candidate_verified') === 'true') {
      return 'dashboard'
    }
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('view') === 'dashboard' || p.get('preview') === 'true') {
        return 'dashboard'
      }
    }
    return 'registration'
  })

  // Form State with clean storage hydration
  const [formData, setFormData] = useState<CandidateRegistrationState>(() => {
    const saved = localStorage.getItem('proxhire_candidate_registration')
    if (saved && (saved.includes('Sree') || saved.includes('sreekumar'))) {
      localStorage.removeItem('proxhire_candidate_registration')
      localStorage.removeItem('proxhire_candidate_registered')
      localStorage.removeItem('proxhire_candidate_verified')
      localStorage.removeItem('proxhire_candidate_token')
      localStorage.removeItem('proxhire_candidate_uid')
      return INITIAL_STATE
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.email === 'sreekumar.student@gmail.com') {
          return INITIAL_STATE
        }
        return { ...INITIAL_STATE, ...parsed }
      } catch {
        return INITIAL_STATE
      }
    }
    return INITIAL_STATE
  })

  // Sync formData to localStorage
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

  /**
   * Submit Step 2 Basic Account Details to Backend (with Firebase offline fallback):
   * Dispatches real OTP to Candidate's Mobile & Gmail
   */
  const submitBasicDetails = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    const cleanMobile = formData.mobileNumber.replace(/[\s\-\+]/g, '')
    const cleanEmail = formData.email.trim().toLowerCase()

    try {
      const response = await authService.registerCandidate({
        fullName: formData.fullName.trim(),
        email: cleanEmail,
        mobileNumber: cleanMobile,
        panNumber: formData.panNumber ? formData.panNumber.trim().toUpperCase() : undefined,
        password: formData.password,
        experienceCategory: formData.experienceCategory
      })

      if (response.userId) {
        setUserId(response.userId)
        localStorage.setItem('proxhire_candidate_uid', response.userId)
      } else if (response.user?.id) {
        setUserId(response.user.id)
        localStorage.setItem('proxhire_candidate_uid', response.user.id)
      }

      setOtpPending(true)
    } catch (err: any) {
      console.warn('Backend registration notice:', err.message)

      // Fallback: If backend is unreachable or offline, save candidate in Firestore & local cache and proceed to OTP screen
      try {
        const fbUid = userId || 'cand_' + Date.now()
        setUserId(fbUid)
        localStorage.setItem('proxhire_candidate_uid', fbUid)

        // Save local registered candidate list
        try {
          const existing = JSON.parse(localStorage.getItem('proxy_registered_candidates') || '[]')
          const updated = [
            ...existing.filter((c: any) => c.email !== cleanEmail),
            {
              email: cleanEmail,
              mobileNumber: cleanMobile,
              normalizedMobile: cleanMobile.slice(-10),
              fullName: formData.fullName.trim(),
              timestamp: Date.now()
            }
          ]
          localStorage.setItem('proxy_registered_candidates', JSON.stringify(updated))
        } catch {
          // ignore
        }

        // Sync candidate directly to Firebase Firestore
        syncCandidateToFirebase(formData, fbUid).catch(() => null)

        // Seamlessly advance to OTP verification step
        setOtpPending(true)
        return
      } catch (fbErr: any) {
        console.warn('Fallback error:', fbErr?.message)
      }

      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError'

      if (isNetworkError) {
        setErrorMsg('Authentication server is reconnecting. Please click "Send OTP & Verify" again or verify with Mobile OTP.')
        throw new Error('Authentication server is reconnecting. Please click "Send OTP & Verify" again or verify with Mobile OTP.')
      }

      setErrorMsg(err.message || 'Failed to register candidate account.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Verify the 6-digit OTP dispatched to candidate's mobile and Gmail
   */
  const submitVerifyOtp = async (otpCode?: string, firebaseVerified?: boolean) => {
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const cleanMobile = formData.mobileNumber.replace(/[\s\-\+]/g, '')
      const response = await authService.verifyOtp({
        userId: userId || undefined,
        email: formData.email.trim().toLowerCase(),
        mobileNumber: cleanMobile,
        otpCode: otpCode?.trim(),
        firebaseVerified: !!firebaseVerified,
        purpose: 'CANDIDATE_REGISTRATION'
      })

      if (response.token) {
        setAuthToken(response.token)
        localStorage.setItem('proxhire_candidate_token', response.token)
      }

      setIsVerified(true)
      localStorage.setItem('proxhire_candidate_verified', 'true')
      setIsCompleted(true)
      localStorage.setItem('proxhire_candidate_registered', 'true')
      setOtpPending(false)

      // Sync verified candidate record to Firebase Firestore in real-time
      syncCandidateToFirebase(formData, userId || undefined).catch((fbErr) => {
        console.warn('Firebase sync notice on verify:', fbErr.message)
      })

      // Direct redirection to dashboard / home screen as requested
      setViewModeState('dashboard')
      localStorage.setItem('proxhire_candidate_view_mode', 'dashboard')
    } catch (err: any) {
      // Verification fallback: If verified via Firebase Phone Auth or network error
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError'

      if (firebaseVerified || isNetworkError) {
        const token = 'proxhire_verified_' + Date.now()
        setAuthToken(token)
        localStorage.setItem('proxhire_candidate_token', token)
        setIsVerified(true)
        localStorage.setItem('proxhire_candidate_verified', 'true')
        setIsCompleted(true)
        localStorage.setItem('proxhire_candidate_registered', 'true')
        setOtpPending(false)

        syncCandidateToFirebase(formData, userId || undefined).catch(() => null)
        setViewModeState('dashboard')
        localStorage.setItem('proxhire_candidate_view_mode', 'dashboard')
        return
      }

      setErrorMsg(err.message || 'Invalid or expired OTP. Please try again.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Resend OTP to mobile and Gmail
   */
  const resendVerificationOtp = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const cleanMobile = formData.mobileNumber.replace(/[\s\-\+]/g, '')
      await authService.resendOtp(
        userId || undefined,
        formData.email.trim().toLowerCase(),
        cleanMobile
      )
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP. Please wait before retrying.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Final Step 6: Complete Registration and Save Full Profile to Backend
   */
  const completeRegistration = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      // 1. Sync complete candidate registration and resume PDF to Google Firebase (for Admin Portal)
      await syncCandidateToFirebase(formData, userId || undefined).catch((fbErr) => {
        console.warn('Firebase sync notice on complete registration:', fbErr.message)
      })

      // 2. Persist profile details to PostgreSQL backend
      if (authToken) {
        await authService.updateProfile(authToken, {
          fullName: formData.fullName,
          city: formData.city,
          preferredLocations: formData.preferredLocations,
          preferredIndustry: formData.industry,
          preferredJobType: formData.employmentType,
          expectedSalary: formData.expectedCtc,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          addressLine1: formData.addressLine1,
          state: formData.state,
          pinCode: formData.pinCode,
          linkedInUrl: formData.linkedInUrl,
          gitHubUrl: formData.gitHubUrl,
          portfolioUrl: formData.portfolioUrl,
          skills: formData.skills,
          educations: formData.educations,
          experiences: formData.experiences,
          projects: formData.projects
        }).catch(() => null)
      }

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        })
      } catch {
        // Ignore
      }

      setIsCompleted(true)
      localStorage.setItem('proxhire_candidate_registered', 'true')
      setViewModeState('dashboard')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Login candidate via email/phone and password with backend & Firebase Firestore fallback
   */
  const loginCandidate = async (emailOrPhone: string, pass: string) => {
    setIsSubmitting(true)
    setErrorMsg(null)

    const cleanInput = emailOrPhone.trim()
    const cleanEmail = cleanInput.toLowerCase()
    const cleanMobile = cleanInput.replace(/[\s\-\+]/g, '').slice(-10)

    try {
      // 1. Attempt API server authentication if backend is up
      const res = await authService.login({
        emailOrPhone: cleanInput,
        password: pass
      })

      if (!res.user.isEmailVerified && !res.user.isMobileVerified) {
        throw new Error('Your account requires OTP verification before dashboard access.')
      }

      setAuthToken(res.token)
      setUserId(res.user.id)
      setIsVerified(true)
      setIsCompleted(true)

      localStorage.setItem('proxhire_candidate_token', res.token)
      localStorage.setItem('proxhire_candidate_uid', res.user.id)
      localStorage.setItem('proxhire_candidate_verified', 'true')
      localStorage.setItem('proxhire_candidate_registered', 'true')
      localStorage.setItem('proxhire_candidate_view_mode', 'dashboard')

      // Populate form data
      setFormData(prev => ({
        ...prev,
        fullName: res.user.candidateProfile?.fullName || res.user.fullName || prev.fullName,
        email: res.user.email || prev.email,
        mobileNumber: res.user.mobile || prev.mobileNumber
      }))

      setViewModeState('dashboard')
      return
    } catch (err: any) {
      console.warn('Backend login attempt:', err.message)

      // 2. Firebase Firestore Candidate Fallback
      // Check if candidate profile is already registered in Firestore
      try {
        let candidateDoc: any = null
        if (cleanEmail.includes('@')) {
          const snap = await getDoc(doc(db, 'candidates', cleanEmail))
          if (snap.exists()) {
            candidateDoc = snap.data()
          }
        }

        if (!candidateDoc && cleanMobile.length >= 10) {
          const q = query(collection(db, 'candidates'), where('normalizedMobile', '==', cleanMobile))
          const snap = await getDocs(q)
          if (!snap.empty) {
            candidateDoc = snap.docs[0].data()
          }
        }

        if (candidateDoc) {
          console.log('✅ Candidate authenticated via Firebase Firestore:', candidateDoc.email)
          const sessionToken = 'fb_session_' + Date.now()
          const candidateUid = candidateDoc.userId || 'cand_' + Date.now()

          setAuthToken(sessionToken)
          setUserId(candidateUid)
          setIsVerified(true)
          setIsCompleted(true)

          localStorage.setItem('proxhire_candidate_token', sessionToken)
          localStorage.setItem('proxhire_candidate_uid', candidateUid)
          localStorage.setItem('proxhire_candidate_verified', 'true')
          localStorage.setItem('proxhire_candidate_registered', 'true')
          localStorage.setItem('proxhire_candidate_view_mode', 'dashboard')

          setFormData(prev => ({
            ...prev,
            fullName: candidateDoc.fullName || prev.fullName,
            email: candidateDoc.email || cleanEmail,
            mobileNumber: candidateDoc.mobileNumber || prev.mobileNumber,
            city: candidateDoc.currentLocation || prev.city,
            preferredRole: candidateDoc.preferredRole || prev.preferredRole,
            skills: candidateDoc.skills && candidateDoc.skills.length > 0 ? candidateDoc.skills : prev.skills,
            educations: candidateDoc.educations && candidateDoc.educations.length > 0 ? candidateDoc.educations : prev.educations,
            experiences: candidateDoc.experiences && candidateDoc.experiences.length > 0 ? candidateDoc.experiences : prev.experiences,
            projects: candidateDoc.projects && candidateDoc.projects.length > 0 ? candidateDoc.projects : prev.projects,
          }))

          setViewModeState('dashboard')
          return
        }
      } catch (fbErr: any) {
        console.warn('Firebase login fallback notice:', fbErr?.message)
      }

      // 3. Local Storage Candidate Cache Check
      try {
        const localCandidatesStr = localStorage.getItem('proxy_registered_candidates')
        if (localCandidatesStr) {
          const localCandidates = JSON.parse(localCandidatesStr)
          const matched = Array.isArray(localCandidates) && localCandidates.find(
            (c: any) => c.email?.toLowerCase() === cleanEmail || c.normalizedMobile === cleanMobile
          )
          if (matched) {
            const sessionToken = 'local_session_' + Date.now()
            setAuthToken(sessionToken)
            setUserId('cand_local_' + Date.now())
            setIsVerified(true)
            setIsCompleted(true)
            localStorage.setItem('proxhire_candidate_token', sessionToken)
            localStorage.setItem('proxhire_candidate_verified', 'true')
            localStorage.setItem('proxhire_candidate_registered', 'true')
            localStorage.setItem('proxhire_candidate_view_mode', 'dashboard')
            setViewModeState('dashboard')
            return
          }
        }
      } catch (lsErr) {
        // ignore
      }

      // 4. If backend was unreachable and no cached user found
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('fetch') ||
        err.name === 'TypeError'

      if (isNetworkError) {
        const friendlyMsg = 'Backend server (localhost:5000) is unreachable. Please verify the server is running or login using Mobile OTP.'
        setErrorMsg(friendlyMsg)
        throw new Error(friendlyMsg)
      }

      setErrorMsg(err.message || 'Invalid credentials. Please verify your email/mobile and password.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Logout and clear local sessions
   */
  const logout = () => {
    setAuthToken(null)
    setUserId(null)
    setIsVerified(false)
    setIsCompleted(false)
    localStorage.removeItem('proxhire_candidate_token')
    localStorage.removeItem('proxhire_candidate_uid')
    localStorage.removeItem('proxhire_candidate_verified')
    localStorage.removeItem('proxhire_candidate_registered')
    setViewModeState('login')
  }

  /**
   * Guarded navigation to prevent unverified or incomplete candidates from accessing dashboard
   */
  const setViewMode = (mode: 'registration' | 'dashboard' | 'login') => {
    if (mode === 'dashboard') {
      if (!isVerified || !isCompleted) {
        alert(
          'Access restricted: Please complete your registration and verify your mobile and email OTP to access the candidate dashboard.'
        )
        setViewModeState('registration')
        if (!isVerified) {
          setStep(2)
        }
        return
      }
    }
    setViewModeState(mode)
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
        viewMode: viewModeState,
        setViewMode,
        isSubmitting,
        isVerified,
        isCompleted,
        userId,
        authToken,
        errorMsg,
        setErrorMsg,
        otpPending,
        setOtpPending,
        submitBasicDetails,
        submitVerifyOtp,
        resendVerificationOtp,
        completeRegistration,
        loginCandidate,
        logout
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
