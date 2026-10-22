import React, { useState } from 'react'
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
  Edit2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step6ProfileReview: React.FC = () => {
  const { formData, updateField, setStep, prevStep, completeRegistration, isSubmitting } = useCandidate()
  const [openCard, setOpenCard] = useState<number | null>(null)

  const toggleCard = (id: number) => {
    setOpenCard(openCard === id ? null : id)
  }

  const handleComplete = async () => {
    if (!formData.finalConfirmed) {
      alert('Please confirm that the information provided is accurate.')
      return
    }
    await completeRegistration()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 6 OF 6</div>
      <h2 className="cand-step-title">Review Your Profile</h2>
      <p className="cand-step-subtitle">
        Please review your information before completing your registration.
      </p>

      {/* Accordion Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {/* Card 1: Experience Type */}
        <div className="cand-review-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Experience Type
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  {formData.experienceCategory === 'fresher' ? 'I am a Fresher (Student / Recent Graduate)' : 'I have work experience'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cand-btn-back"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => setStep(1)}
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleCard(1)}
                style={{ color: '#71717a', padding: '4px' }}
              >
                {openCard === 1 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {openCard === 1 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#475467' }}>
              Selected Category: <strong>{formData.experienceCategory === 'fresher' ? 'Student / Fresher' : 'Experienced Professional'}</strong>
            </div>
          )}
        </div>

        {/* Card 2: Basic Account Details */}
        <div className="cand-review-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                <FileText size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Basic Account Details
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Name, email, mobile, PAN and account information
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cand-btn-back"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => setStep(2)}
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleCard(2)}
                style={{ color: '#71717a', padding: '4px' }}
              >
                {openCard === 2 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {openCard === 2 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Name:</strong> {formData.fullName}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Mobile:</strong> {formData.countryCode} {formData.mobileNumber}</div>
              {formData.panNumber ? <div><strong>PAN:</strong> {formData.panNumber}</div> : null}
            </div>
          )}
        </div>

        {/* Card 3: Resume, Education & Skills */}
        <div className="cand-review-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                <GraduationCap size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Resume, Education & Skills
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Resume, profile summary, education details and key skills
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cand-btn-back"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => setStep(3)}
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleCard(3)}
                style={{ color: '#71717a', padding: '4px' }}
              >
                {openCard === 3 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {openCard === 3 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
              <div style={{ marginBottom: '6px' }}><strong>Resume:</strong> {formData.resumeFileName || 'Uploaded'}</div>
              <div style={{ marginBottom: '6px' }}><strong>Skills:</strong> {formData.skills.join(', ')}</div>
            </div>
          )}
        </div>

        {/* Card 4: Employment, Projects & Career Profile */}
        <div className="cand-review-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Employment, Projects & Career Profile
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Work experience, projects, career preferences and expected CTC
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cand-btn-back"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => setStep(4)}
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleCard(4)}
                style={{ color: '#71717a', padding: '4px' }}
              >
                {openCard === 4 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {openCard === 4 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Preferred Role:</strong> {formData.preferredRole}</div>
              <div><strong>Industry:</strong> {formData.industry}</div>
              <div><strong>Work Type:</strong> {formData.workType}</div>
              <div><strong>Expected CTC:</strong> {formData.expectedCtc}</div>
            </div>
          )}
        </div>

        {/* Card 5: Personal Details & Additional Information */}
        <div className="cand-review-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#09090b'
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                  Personal Details & Additional Information
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Personal details, address, diversity information, online presence and achievements
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="cand-btn-back"
                style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                onClick={() => setStep(5)}
              >
                <Edit2 size={12} /> Edit
              </button>
              <button
                type="button"
                onClick={() => toggleCard(5)}
                style={{ color: '#71717a', padding: '4px' }}
              >
                {openCard === 5 ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          {openCard === 5 && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Location:</strong> {formData.city}, {formData.state}</div>
              <div><strong>Nationality:</strong> {formData.nationality}</div>
              <div><strong>LinkedIn:</strong> {formData.linkedInUrl}</div>
              <div><strong>GitHub:</strong> {formData.gitHubUrl}</div>
            </div>
          )}
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="cand-verify-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <ShieldCheck size={28} color="#000000" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Final Confirmation
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              By completing your registration, you confirm that all the information provided is accurate and you agree to our Terms & Conditions and Privacy Policy.
            </p>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={formData.finalConfirmed}
            onChange={e => updateField('finalConfirmed', e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#000000' }}
          />
          I confirm and complete my registration
        </label>
      </div>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <button type="button" className="cand-btn-back" onClick={prevStep}>
          <ArrowLeft size={16} /> Back
        </button>

        <button
          type="button"
          className="cand-btn-primary"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration'}{' '}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
