import React from 'react'
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step1ExperienceType: React.FC = () => {
  const { formData, updateField, nextStep } = useCandidate()

  return (
    <div className="cand-step-1-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, justifyContent: 'space-between' }}>
      <div className="cand-step-intro">
        <div className="cand-step-indicator">STEP 1 OF 6</div>
        <h2 className="cand-step-title">Let's get started</h2>
        <p className="cand-step-subtitle">
          Tell us about your work experience so we can personalize your journey and show you the most relevant opportunities.
        </p>
      </div>

      {/* 2 Choice Cards */}
      <div className="cand-exp-choice-grid">
        {/* Card 1: Fresher */}
        <div
          className={`cand-exp-card ${formData.experienceCategory === 'fresher' ? 'selected' : ''}`}
          onClick={() => updateField('experienceCategory', 'fresher')}
        >
          <div className="cand-exp-radio-indicator">
            {formData.experienceCategory === 'fresher' && <div className="cand-exp-radio-dot" />}
          </div>

          <div className="cand-exp-pedestal-wrap">
            <div
              className="cand-exp-icon-box"
              style={{
                backgroundColor: '#090a0f',
                color: '#ffffff'
              }}
            >
              <GraduationCap className="cand-exp-icon" size={28} strokeWidth={2.2} />
            </div>
            <div className="cand-pedestal-ellipse" />
          </div>

          <h3 className="cand-exp-title">I am a Fresher</h3>
          <p className="cand-exp-desc">
            I am a student or recent graduate and do not have any prior work experience.
          </p>

          <div className="cand-exp-tags-row">
            <span className="cand-exp-tag-pill">Students</span>
            <span className="cand-exp-tag-pill">Recent Graduates</span>
            <span className="cand-exp-tag-pill">No Experience</span>
          </div>
        </div>

        {/* Card 2: Experienced */}
        <div
          className={`cand-exp-card ${formData.experienceCategory === 'experienced' ? 'selected' : ''}`}
          onClick={() => updateField('experienceCategory', 'experienced')}
        >
          <div className="cand-exp-radio-indicator">
            {formData.experienceCategory === 'experienced' && <div className="cand-exp-radio-dot" />}
          </div>

          <div className="cand-exp-pedestal-wrap">
            <div
              className="cand-exp-icon-box"
              style={{
                backgroundColor: '#18181b',
                color: '#ffffff'
              }}
            >
              <Briefcase className="cand-exp-icon" size={26} strokeWidth={2.2} />
            </div>
            <div className="cand-pedestal-ellipse" />
          </div>

          <h3 className="cand-exp-title">I have work experience</h3>
          <p className="cand-exp-desc">
            I have worked in a company before and have relevant work experience.
          </p>

          <div className="cand-exp-tags-row">
            <span className="cand-exp-tag-pill">Professionals</span>
            <span className="cand-exp-tag-pill">Experienced</span>
            <span className="cand-exp-tag-pill">Career Switch</span>
          </div>
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
