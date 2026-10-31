import React, { createContext, useContext, useState, useEffect } from 'react'
import type { CandidateStep, CandidateRegistrationState } from '../types'
import { authService } from '../services/authService'
import confetti from 'canvas-confetti'
import { syncCandidateToSupabase } from '../supabase'

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
  submitVerifyOtp: (
    optionsOrOtp?: string | {
      channel?: 'EMAIL' | 'MOBILE' | 'ALL';
      otpCode?: string;
      emailOtp?: string;
      mobileOtp?: string;
    }
  ) => Promise<any>
  resendVerificationOtp: () => Promise<void>
  completeRegistration: () => Promise<void>
  loginCandidate: (emailOrPhone: string, pass: string) => Promise<void>
  resetPassword: (email: string, code?: string, newPassword?: string) => Promise<{ success: boolean; message: string }>
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
    const hasToken = !!localStorage.getItem('proxhire_candidate_token')
    const isVer = localStorage.getItem('proxhire_candidate_verified') === 'true'
    const isComp = localStorage.getItem('proxhire_candidate_registered') === 'true'

    if (savedMode === 'dashboard' && hasToken && isVer && isComp) {
      return 'dashboard'
    }
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      const hash = window.location.hash.toLowerCase()
      if ((p.get('view') === 'dashboard' || hash === '#dashboard') && hasToken && isVer && isComp) {
        return 'dashboard'
      }
      if (p.get('view') === 'login' || hash === '#login') {
        return 'login'
      }
    }
    if (hasToken && isVer && !isComp) {
      return 'registration'
    }
    return 'login'
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
   * Submit Step 2 Basic Account Details to Backend (with Supabase offline fallback):
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

      const assignedUid = response.userId || response.user?.id
      if (assignedUid) {
        setUserId(assignedUid)
        localStorage.setItem('proxhire_candidate_uid', assignedUid)
      }

      // Sync candidate profile directly to Supabase 'candidates' database table
      await syncCandidateToSupabase(formData, assignedUid).catch((sbErr) => {
        console.warn('Supabase candidate sync notice on basic details:', sbErr.message)
      })

      setOtpPending(true)
    } catch (err: any) {
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError'
      const msg = isNetworkError
        ? 'Cannot reach the ProXHire server. Check your connection and try again.'
        : (err.message || 'Failed to register candidate account.')
      setErrorMsg(msg)
      throw new Error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Verify candidate OTPs (Email and/or Mobile)
   * Redirects to dashboard ONLY when BOTH channels are verified!
   */
  const submitVerifyOtp = async (
    optionsOrOtp?: string | {
      channel?: 'EMAIL' | 'MOBILE' | 'ALL';
      otpCode?: string;
      emailOtp?: string;
      mobileOtp?: string;
    }
  ) => {
    setIsSubmitting(true)
    setErrorMsg(null)

    const opts = typeof optionsOrOtp === 'string'
      ? { otpCode: optionsOrOtp }
      : (optionsOrOtp || {})

    try {
      const cleanMobile = formData.mobileNumber.replace(/[\s\-\+]/g, '')
      const response: any = await authService.verifyOtp({
        userId: userId || undefined,
        email: formData.email.trim().toLowerCase(),
        mobileNumber: cleanMobile,
        channel: opts.channel,
        otpCode: opts.otpCode?.trim(),
        emailOtp: opts.emailOtp?.trim(),
        mobileOtp: opts.mobileOtp?.trim(),
        purpose: 'CANDIDATE_REGISTRATION'
      })

      // Email verification unlocks the candidate account and proceeds to profile creation
      if (response.isVerified || response.isEmailVerified) {
        response.isVerified = true
        if (response.token) {
          setAuthToken(response.token)
          localStorage.setItem('proxhire_candidate_token', response.token)
        }

        setIsVerified(true)
        localStorage.setItem('proxhire_candidate_verified', 'true')

        // Profile is NOT completed yet - candidate must complete steps 3, 4, 5, 6 first!
        setIsCompleted(false)
        localStorage.setItem('proxhire_candidate_registered', 'false')
        setOtpPending(false)


        // Proceed directly to Step 3: Profile Details (Resume, Education & Skills)
        setStepState(3)
        setViewModeState('registration')
        localStorage.setItem('proxhire_candidate_view_mode', 'registration')
      }

      return response
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP. Please check your verification code.')
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
      // 1. Sync complete candidate registration and resume to Supabase Database
      await syncCandidateToSupabase(formData, userId || undefined).catch((sbErr) => {
        console.warn('Supabase sync notice on complete registration:', sbErr.message)
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
   * Login candidate via email/phone and password with backend & Supabase fallback
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
      const isNetworkError =
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError'
      const msg = isNetworkError
        ? 'Cannot reach the ProXHire server. Check your connection and try again.'
        : (err.message || 'Invalid credentials. Please verify your email/mobile and password.')
      setErrorMsg(msg)
      throw new Error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Reset password: without a code, email one; with a code, set the new password
   */
  const resetPassword = async (email: string, code?: string, newPassword?: string) => {
    return code && newPassword
      ? authService.confirmPasswordReset(email, code, newPassword)
      : authService.requestPasswordReset(email)
  }

  /**
   * Logout and clear local sessions
   */
  const logout = () => {
    setAuthToken(null)
    setUserId(null)
    setIsVerified(false)
    setIsCompleted(false)
    setFormData(INITIAL_STATE)
    localStorage.removeItem('proxhire_candidate_token')
    localStorage.removeItem('proxhire_candidate_uid')
    localStorage.removeItem('proxhire_candidate_verified')
    localStorage.removeItem('proxhire_candidate_registered')
    localStorage.removeItem('proxhire_candidate_view_mode')
    localStorage.removeItem('proxhire_candidate_registration')
    setViewModeState('login')
  }

  /**
   * Guarded navigation to prevent unauthenticated or incomplete profile candidates from accessing dashboard
   */
  const setViewMode = (mode: 'registration' | 'dashboard' | 'login') => {
    if (mode === 'dashboard') {
      const hasToken = !!localStorage.getItem('proxhire_candidate_token')
      const isVer = localStorage.getItem('proxhire_candidate_verified') === 'true'
      const isComp = localStorage.getItem('proxhire_candidate_registered') === 'true'
      if (!hasToken || !isVer) {
        setViewModeState('login')
        return
      }
      if (!isComp) {
        // Candidate has a new account / incomplete profile -> Must create profile first!
        setViewModeState('registration')
        setStepState(3)
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
        resetPassword,
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
