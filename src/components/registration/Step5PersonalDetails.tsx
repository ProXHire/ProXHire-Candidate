import React, { useState } from 'react'
import {
  User,
  MapPin,
  Users,
  Link as LinkIcon,
  Award,
  Plus,
  Calendar,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step5PersonalDetails: React.FC = () => {
  const { formData, updateField, nextStep, prevStep } = useCandidate()
  const [showAchieveModal, setShowAchieveModal] = useState(false)
  const [newAchieve, setNewAchieve] = useState('')

  const handleAddAchieve = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAchieve.trim()) {
      updateField('achievements', [...formData.achievements, newAchieve.trim()])
      setNewAchieve('')
      setShowAchieveModal(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 5 OF 6</div>
      <h2 className="cand-step-title">Personal Details & Additional Information</h2>
      <p className="cand-step-subtitle">
        Help us know you better. This information helps in providing the right opportunities.
      </p>

      {/* 4-Quadrant Cards Grid */}
      <div className="cand-review-grid" style={{ margin: 0 }}>
        {/* Quadrant 1: Personal Details */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '2px' }}>
            <User size={16} /> Personal Details
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            Basic information about you.
          </p>

          <div className="cand-form-grid" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">Date of Birth <span className="req">*</span></label>
              <div className="cand-input-wrapper">
                <span className="cand-input-icon">
                  <Calendar size={16} />
                </span>
                <input
                  type="text"
                  className="cand-input"
                  placeholder="DD/MM/YYYY"
                  value={formData.dateOfBirth}
                  onChange={e => updateField('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Nationality <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.nationality}
                onChange={e => updateField('nationality', e.target.value)}
              >
                <option value="Indian">Indian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Gender <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.gender}
                onChange={e => updateField('gender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Category</label>
              <select
                className="cand-input"
                value={formData.category}
                onChange={e => updateField('category', e.target.value)}
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Marital Status</label>
              <select
                className="cand-input"
                value={formData.maritalStatus}
                onChange={e => updateField('maritalStatus', e.target.value)}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Have a valid work permit?</label>
              <select
                className="cand-input"
                value={formData.workPermit}
                onChange={e => updateField('workPermit', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Address Details */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '2px' }}>
            <MapPin size={16} /> Address Details
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            Your current location.
          </p>

          <div className="cand-form-grid single-col" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">Address Line 1 <span className="req">*</span></label>
              <input
                type="text"
                className="cand-input"
                placeholder="Enter your address"
                value={formData.addressLine1}
                onChange={e => updateField('addressLine1', e.target.value)}
              />
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Address Line 2</label>
              <input
                type="text"
                className="cand-input"
                placeholder="Enter address (optional)"
                value={formData.addressLine2}
                onChange={e => updateField('addressLine2', e.target.value)}
              />
            </div>

            <div className="cand-field-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label className="cand-field-label">City <span className="req">*</span></label>
                  <input
                    type="text"
                    className="cand-input"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="cand-field-label">State <span className="req">*</span></label>
                  <input
                    type="text"
                    className="cand-input"
                    placeholder="Select state"
                    value={formData.state}
                    onChange={e => updateField('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="cand-field-label">PIN Code <span className="req">*</span></label>
                  <input
                    type="text"
                    className="cand-input"
                    placeholder="Enter PIN"
                    value={formData.pinCode}
                    onChange={e => updateField('pinCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quadrant 3: Diversity & Inclusion (Optional) */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '2px' }}>
            <Users size={16} /> Diversity & Inclusion (Optional)
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            Help us support you better. This information is confidential.
          </p>

          <div className="cand-form-grid" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">Do you have a disability?</label>
              <select
                className="cand-input"
                value={formData.hasDisability}
                onChange={e => updateField('hasDisability', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Have you taken a career gap?</label>
              <select
                className="cand-input"
                value={formData.hasCareerGap}
                onChange={e => updateField('hasCareerGap', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Government Experience</label>
              <select
                className="cand-input"
                value={formData.govtExperience}
                onChange={e => updateField('govtExperience', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Are you open to relocation?</label>
              <select
                className="cand-input"
                value={formData.openToRelocate}
                onChange={e => updateField('openToRelocate', e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadrant 4: Online Presence */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '2px' }}>
            <LinkIcon size={16} /> Online Presence
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
            Add links to your professional profiles (optional).
          </p>

          <div className="cand-form-grid single-col" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">LinkedIn Profile</label>
              <input
                type="text"
                className="cand-input"
                placeholder="https://www.linkedin.com/in/yourprofile"
                value={formData.linkedInUrl}
                onChange={e => updateField('linkedInUrl', e.target.value)}
              />
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">GitHub Profile</label>
              <input
                type="text"
                className="cand-input"
                placeholder="https://github.com/yourprofile"
                value={formData.gitHubUrl}
                onChange={e => updateField('gitHubUrl', e.target.value)}
              />
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Portfolio / Website</label>
              <input
                type="text"
                className="cand-input"
                placeholder="https://yourwebsite.com"
                value={formData.portfolioUrl}
                onChange={e => updateField('portfolioUrl', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Certifications (Full Width Bottom Card) */}
      <div className="cand-verify-card" style={{ marginTop: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Achievements & Certifications (Optional)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Add your key achievements, certifications, awards or recognitions.
            </p>
          </div>
        </div>

        {formData.achievements.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {formData.achievements.map((item, idx) => (
              <span
                key={idx}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#09090b',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Award size={14} color="#000000" /> {item}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          className="cand-dropzone"
          style={{ width: '100%', padding: '18px', cursor: 'pointer' }}
          onClick={() => setShowAchieveModal(true)}
        >
          <Plus size={20} color="#09090b" style={{ margin: '0 auto 6px' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
            Add Achievement / Certification
          </span>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Include certifications, awards, publications, patents, etc.
          </span>
        </button>
      </div>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <button type="button" className="cand-btn-back" onClick={prevStep}>
          <ArrowLeft size={16} /> Back
        </button>

        <button type="button" className="cand-btn-primary" onClick={nextStep}>
          Continue <ArrowRight size={16} />
        </button>
      </div>

      {/* Add Achievement Modal */}
      {showAchieveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowAchieveModal(false)}
        >
          <form
            onSubmit={handleAddAchieve}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>Add Certification / Award</h4>
            <input
              type="text"
              className="cand-input"
              placeholder="e.g. AWS Certified Developer, Smart India Hackathon Winner"
              value={newAchieve}
              onChange={e => setNewAchieve(e.target.value)}
              autoFocus
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowAchieveModal(false)}>Cancel</button>
              <button type="submit" className="cand-btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
