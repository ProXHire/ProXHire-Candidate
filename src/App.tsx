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
      {/* Top Utility Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 20px',
          backgroundColor: '#0c0d0e',
          color: '#ffffff',
          fontSize: '12px',
          borderBottom: '1px solid #27272a',
          zIndex: 9999
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>
            PROXHIRE &bull; CANDIDATE / STUDENT PORTAL
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            candidate.proxhire.in
          </span>
        </div>

        {/* View Switcher buttons for all 7 screens */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', marginRight: '4px' }}>Screens:</span>
          {[
            { num: 1 as CandidateStep, label: 'Step 1: Experience' },
            { num: 2 as CandidateStep, label: 'Step 2: Basic Details' },
            { num: 3 as CandidateStep, label: 'Step 3: Resume' },
            { num: 4 as CandidateStep, label: 'Step 4: Career' },
            { num: 5 as CandidateStep, label: 'Step 5: Personal' },
            { num: 6 as CandidateStep, label: 'Step 6: Review' }
          ].map(s => {
            const isSel = viewMode === 'registration' && step === s.num
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setViewMode('registration')
                  setStep(s.num)
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: isSel ? '#ffffff' : '#1e222b',
                  color: isSel ? '#09090b' : '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '11.5px'
                }}
              >
                {s.label}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setViewMode('dashboard')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'dashboard' ? '#10b981' : '#1e222b',
              color: viewMode === 'dashboard' ? '#000000' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '11.5px',
              marginLeft: '4px'
            }}
          >
            Screen 7: Dashboard
          </button>
        </div>
      </header>

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
