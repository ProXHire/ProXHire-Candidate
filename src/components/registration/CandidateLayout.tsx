import React from 'react'
import {
  Search,
  ShieldCheck,
  TrendingUp,
  FileText,
  Check
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import type { CandidateStep } from '../../types'

interface CandidateLayoutProps {
  children: React.ReactNode
}

export const CandidateLayout: React.FC<CandidateLayoutProps> = ({ children }) => {
  const { step, setStep, setViewMode } = useCandidate()

  const stepsList: { num: CandidateStep; label: string }[] = [
    { num: 1, label: 'Experience' },
    { num: 2, label: 'Basic Details' },
    { num: 3, label: 'Profile Details' },
    { num: 4, label: 'Career Profile' },
    { num: 5, label: 'Personal Details' },
    { num: 6, label: 'Review' }
  ]

  // Stepper progress line width
  const progressPercent = ((step - 1) / (stepsList.length - 1)) * 100
  const isSinglePageStep = step === 1 || step === 2

  return (
    <div className={`cand-split-container ${isSinglePageStep ? `cand-step-${step}-container cand-single-page-container` : ''}`}>
      {/* Left Col - Architectural Visual Banner */}
      <div className={`cand-hero-col ${isSinglePageStep ? `cand-step-${step}-hero cand-single-page-hero` : ''}`}>
        <div className="cand-hero-bg" />
        <div className="cand-hero-overlay" />

        <div className="cand-hero-content">
          {/* Logo */}
          <div className="cand-brand-row">
            <img
              src="/logo-white.png"
              alt="ProXHire Logo"
              className="cand-brand-logo"
              style={{
                height: '48px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Dynamic Headline & Features */}
          <div className="cand-hero-main">
            {step === 1 ? (
              <>
                <h1 className="cand-hero-title">
                  One Profile.<br />
                  Limitless<br />
                  <span className="muted-text">Opportunities.</span>
                </h1>
                <p className="cand-hero-desc">
                  Create your professional profile, get verified and connect with leading employers across India.
                </p>
              </>
            ) : (
              <>
                <h1 className="cand-hero-title">
                  One Profile.<br />
                  More<br />
                  <span className="muted-text">Opportunities.</span>
                </h1>
                <p className="cand-hero-desc">
                  {step === 2
                    ? 'Get verified, showcase your skills and connect with top employers across India.'
                    : 'Showcase your skills, experience and achievements to connect with top employers across India.'}
                </p>
              </>
            )}

            <div className="cand-feature-list">
              {[
                {
                  icon: Search,
                  title: 'Relevant Job Opportunities',
                  desc: 'Find roles that match your skills'
                },
                {
                  icon: ShieldCheck,
                  title: 'Verified & Trusted Platform',
                  desc: 'Build credibility with employers'
                },
                {
                  icon: TrendingUp,
                  title: 'Career Growth',
                  desc: 'More interviews, better opportunities'
                },
                {
                  icon: FileText,
                  title: step === 1 ? 'Data Privacy' : 'Secure & Private',
                  desc: step === 1 ? 'Your information stays secure' : 'Your information stays protected'
                }
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="cand-feature-item">
                    <div className="cand-feature-icon-box">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="cand-feature-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Area: For Step 1 show script signature, for others show kicker */}
          <div className="cand-hero-footer">
            {step === 1 ? (
              <div className="cand-hero-script-tag">
                Shape<br />What's Next
              </div>
            ) : (
              <div className="cand-hero-kicker">SKILLS &nbsp;|&nbsp; OPPORTUNITIES &nbsp;|&nbsp; GROWTH</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Col - Step Content */}
      <div className={`cand-form-col ${isSinglePageStep ? `cand-step-${step}-col cand-single-page-col` : ''}`}>
        {/* Top Header bar */}
        <div className="cand-form-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {step <= 2 ? (
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Already have an account?{' '}
                <a
                  href="#login"
                  onClick={e => {
                    e.preventDefault()
                    setViewMode('dashboard')
                  }}
                  style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Login
                </a>
              </span>
            ) : (
              <button
                type="button"
                className="cand-save-exit-btn"
                onClick={() => {
                  window.location.href = 'https://proxhire.in'
                }}
              >
                Save & Exit
              </button>
            )}
          </div>
        </div>

        {/* 6-step Stepper */}
        <div className="cand-stepper-wrap">
          <div className="cand-stepper-line" />
          <div className="cand-stepper-progress" style={{ width: `calc(${progressPercent}% - 40px)` }} />

          {stepsList.map(item => {
            const isCompleted = item.num < step
            const isActive = item.num === step
            const isInactive = item.num > step

            return (
              <div
                key={item.num}
                className="cand-step-node"
                onClick={() => {
                  if (item.num <= step) {
                    setStep(item.num)
                  }
                }}
              >
                <div
                  className={`cand-step-circle ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'inactive'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.6} /> : item.num}
                </div>
                <span
                  className={`cand-step-label ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'inactive'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Body Container */}
        <div className={`cand-form-body ${isSinglePageStep ? `cand-step-${step}-body cand-single-page-body` : ''}`}>{children}</div>
      </div>
    </div>
  )
}
