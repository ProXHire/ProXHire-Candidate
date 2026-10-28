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
    { num: 2, label: 'Account' },
    { num: 3, label: 'Profile' },
    { num: 4, label: 'Career' },
    { num: 5, label: 'Personal' },
    { num: 6, label: 'Overview' }
  ]

  // Stepper progress line width
  const halfStepPercent = 100 / (stepsList.length * 2)
  const totalTrackPercent = 100 - halfStepPercent * 2
  const progressPercent = stepsList.length > 1 ? ((step - 1) / (stepsList.length - 1)) * totalTrackPercent : 100
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

          {/* Constant Headline & Features across all screens */}
          <div className="cand-hero-main">
            <h1 className="cand-hero-title">
              One Profile.<br />
              More<br />
              <span className="muted-text">Opportunities.</span>
            </h1>
            <p className="cand-hero-desc">
              Get verified, showcase your skills and connect with top employers across India.
            </p>

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
                  title: 'Secure & Private',
                  desc: 'Your information stays protected'
                }
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="cand-feature-item">
                    <div className="cand-feature-icon-box">
                      <Icon size={22} strokeWidth={2} />
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

          {/* Footer Area: Constant kicker across all screens */}
          <div className="cand-hero-footer">
            <div className="cand-hero-kicker">SKILLS &nbsp;|&nbsp; OPPORTUNITIES &nbsp;|&nbsp; GROWTH</div>
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
                    setViewMode('login')
                  }}
                  style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Login
                </a>
              </span>
            ) : (
              <span style={{ fontSize: '12.5px', color: '#475467', fontWeight: 600 }}>
                Mandatory Profile Setup &bull; Step {step} of 6
              </span>
            )}
          </div>
        </div>

        {/* 2-step Stepper */}
        <div
          className="cand-stepper-wrap"
          style={{
            '--stepper-inset': `${halfStepPercent}%`,
            maxWidth: '520px',
            width: '100%',
            margin: '0 auto clamp(12px, 1.8vh, 22px)'
          } as React.CSSProperties}
        >
          <div className="cand-stepper-line" />
          <div className="cand-stepper-progress" style={{ width: `${progressPercent}%` }} />

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
