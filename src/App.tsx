import React, { useEffect } from 'react'
import {
  CandidateProvider,
  useCandidate
} from './context/CandidateContext'
import { CandidateLayout } from './components/registration/CandidateLayout'
import { Step1ExperienceType } from './components/registration/Step1ExperienceType'
import { Step2BasicDetails } from './components/registration/Step2BasicDetails'
import { Step3ResumeSkills } from './components/registration/Step3ResumeSkills'
import { Step4EmploymentCareer } from './components/registration/Step4EmploymentCareer'
import { Step5PersonalDetails } from './components/registration/Step5PersonalDetails'
import { Step6ProfileReview } from './components/registration/Step6ProfileReview'
import { CandidateDashboard } from './components/dashboard/CandidateDashboard'
import { CandidateLogin } from './components/auth/CandidateLogin'
import type { CandidateStep } from './types'

function CandidateContent() {
  const { step, setStep, viewMode, setViewMode, authToken, isVerified, isCompleted } = useCandidate()

  useEffect(() => {
    const handleUrlState = () => {
      const hash = window.location.hash.toLowerCase()
      const params = new URLSearchParams(window.location.search)
      const queryView = params.get('view')
      const queryStep = params.get('step')

      if (queryView === 'dashboard' || hash === '#dashboard') {
        const hasToken = !!localStorage.getItem('proxhire_candidate_token')
        const isVer = localStorage.getItem('proxhire_candidate_verified') === 'true'
        const isComp = localStorage.getItem('proxhire_candidate_registered') === 'true'
        if (hasToken && isVer && isComp) {
          setViewMode('dashboard')
        } else if (hasToken && isVer && !isComp) {
          setViewMode('registration')
          setStep(3)
        } else {
          setViewMode('login')
        }
      } else if (queryView === 'login' || hash === '#login') {
        setViewMode('login')
      } else if (queryStep) {
        const stepNum = parseInt(queryStep, 10) as CandidateStep
        if (stepNum >= 1 && stepNum <= 6) {
          setStep(stepNum)
          setViewMode('registration')
        }
      }
    }

    handleUrlState()
    window.addEventListener('hashchange', handleUrlState)
    return () => window.removeEventListener('hashchange', handleUrlState)
  }, [setStep, setViewMode])

  return (
    <div
      className={
        (viewMode === 'registration' && (step === 1 || step === 2)) || viewMode === 'login'
          ? 'cand-app-single-page'
          : ''
      }
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Main View */}
      <div
        className={
          (viewMode === 'registration' && (step === 1 || step === 2)) || viewMode === 'login'
            ? 'cand-app-single-page-body'
            : ''
        }
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        {viewMode === 'dashboard' && (authToken && isVerified && isCompleted) ? (
          <CandidateDashboard />
        ) : viewMode === 'login' || (viewMode === 'dashboard' && (!authToken || !isVerified)) ? (
          <CandidateLogin />
        ) : (
          <CandidateLayout>
            {step === 1 && <Step1ExperienceType />}
            {step === 2 && <Step2BasicDetails />}
            {step === 3 && <Step3ResumeSkills />}
            {step === 4 && <Step4EmploymentCareer />}
            {step === 5 && <Step5PersonalDetails />}
            {step === 6 && <Step6ProfileReview />}
          </CandidateLayout>
        )}
      </div>
    </div>
  )
}

export function App() {
  return (
    <CandidateProvider>
      <CandidateContent />
    </CandidateProvider>
  )
}

export default App
