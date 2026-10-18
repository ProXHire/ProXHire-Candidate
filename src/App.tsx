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
import type { CandidateStep } from './types'

function CandidateContent() {
  const { step, setStep, viewMode, setViewMode } = useCandidate()

  useEffect(() => {
    const handleUrlState = () => {
      const hash = window.location.hash.toLowerCase()
      const params = new URLSearchParams(window.location.search)
      const queryView = params.get('view')
      const queryStep = params.get('step')

      if (queryView === 'dashboard' || hash === '#dashboard') {
        setViewMode('dashboard')
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Main View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {viewMode === 'dashboard' ? (
          <CandidateDashboard />
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
