import React from 'react'
import { GraduationCap, Briefcase, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step1ExperienceType: React.FC = () => {
  const { formData, updateField, nextStep } = useCandidate()

  const isFresher = formData.experienceCategory === 'fresher'
  const isExperienced = formData.experienceCategory === 'experienced'

  return (
    <div className="cand-step-1-content">
      {/* Intro Header */}
      <div className="cand-step-intro">
        <div className="cand-step-indicator">STEP 1 OF 2</div>
        <h2 className="cand-step-title">Let's get started</h2>
        <p className="cand-step-subtitle">
          Tell us about your work experience so we can personalize your journey and match you with the most relevant opportunities across India.
        </p>
      </div>

      {/* 2 Choice Cards */}
      <div className="cand-exp-choice-grid">
        {/* Card 1: Fresher */}
        <div
          className={`cand-exp-card ${isFresher ? 'selected' : ''}`}
          onClick={() => updateField('experienceCategory', 'fresher')}
          role="button"
          tabIndex={0}
        >
          {/* Header Row: Icon + Badge + Check/Radio */}
          <div className="cand-exp-card-header">
            <div className={`cand-exp-icon-box ${isFresher ? 'active' : ''}`}>
              <GraduationCap size={24} strokeWidth={2.2} />
            </div>
            <div className="cand-exp-header-right">
              <span className={`cand-exp-badge ${isFresher ? 'active' : ''}`}>Entry Level</span>
              <div className={`cand-exp-radio-indicator ${isFresher ? 'active' : ''}`}>
                {isFresher && <Check size={13} strokeWidth={3} />}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="cand-exp-title">I am a Fresher</h3>

          {/* Description */}
          <p className="cand-exp-desc">
            Student or recent graduate looking to kickstart your career with top opportunities.
          </p>

          {/* Feature Benefits List */}
          <div className="cand-exp-features">
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>No prior full-time corporate experience needed</span>
            </div>
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>Showcase academics, capstone projects & skills</span>
            </div>
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>Matched to graduate trainee & junior roles</span>
            </div>
          </div>

          {/* Footer Tags */}
          <div className="cand-exp-tags-row">
            <span className="cand-exp-tag-pill">Students & Graduates</span>
            <span className="cand-exp-tag-pill">No Experience Required</span>
          </div>
        </div>

        {/* Card 2: Experienced */}
        <div
          className={`cand-exp-card ${isExperienced ? 'selected' : ''}`}
          onClick={() => updateField('experienceCategory', 'experienced')}
          role="button"
          tabIndex={0}
        >
          {/* Header Row: Icon + Badge + Check/Radio */}
          <div className="cand-exp-card-header">
            <div className={`cand-exp-icon-box ${isExperienced ? 'active' : ''}`}>
              <Briefcase size={22} strokeWidth={2.2} />
            </div>
            <div className="cand-exp-header-right">
              <div className={`cand-exp-radio-indicator ${isExperienced ? 'active' : ''}`}>
                {isExperienced && <Check size={13} strokeWidth={3} />}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="cand-exp-title">I have work experience</h3>

          {/* Description */}
          <p className="cand-exp-desc">
            Experienced professional with prior company, startup, or freelance work history.
          </p>

          {/* Feature Benefits List */}
          <div className="cand-exp-features">
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>Showcase past employers & role designations</span>
            </div>
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>Highlight domain expertise & salary expectations</span>
            </div>
            <div className="cand-exp-feature-item">
              <div className="cand-feature-icon-circle">
                <Check size={12} strokeWidth={2.8} />
              </div>
              <span>Matched to mid & senior-level career openings</span>
            </div>
          </div>

          {/* Footer Tags */}
          <div className="cand-exp-tags-row">
            <span className="cand-exp-tag-pill">Working Professionals</span>
            <span className="cand-exp-tag-pill">Career Switchers</span>
          </div>
        </div>
      </div>

      {/* Trust & Guidance Banner */}
      <div className="cand-exp-trust-banner">
        <div className="cand-trust-icon-box">
          <ShieldCheck size={20} strokeWidth={2.2} />
        </div>
        <div className="cand-trust-content">
          <span className="cand-trust-title">Why we ask this</span>
          <p className="cand-trust-desc">
            Your selection helps customize your verification checklist and connect you directly with employers hiring for your specific experience level. You can update this anytime.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <div />
        <button
          type="button"
          className="cand-btn-primary"
          onClick={nextStep}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
