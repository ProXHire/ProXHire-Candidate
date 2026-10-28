import React, { useState } from 'react'
import {
  User,
  MapPin,
  Users,
  Link as LinkIcon,
  Award,
  Plus,
  ArrowRight,
  ArrowLeft,
  X,
  Globe,
  Share2,
  AlertCircle
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Other / Outside India'
]

const MAJOR_INDIAN_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Delhi NCR',
  'Gurgaon',
  'Noida',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Kochi',
  'Jaipur',
  'Chandigarh',
  'Indore',
  'Coimbatore',
  'Visakhapatnam',
  'Bhubaneswar',
  'Nagpur',
  'Lucknow',
  'Thiruvananthapuram'
]

export const Step5PersonalDetails: React.FC = () => {
  const { formData, updateField, nextStep, prevStep } = useCandidate()
  const [showAchieveModal, setShowAchieveModal] = useState(false)
  const [achieveCategory, setAchieveCategory] = useState('Industry Certification')
  const [newAchieve, setNewAchieve] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Parse DD/MM/YYYY for synchronized 3-dropdown date picker
  const dobParts = (formData.dateOfBirth || '').split('/')
  const dobDay = dobParts[0] || '15'
  const dobMonth = dobParts[1] || '08'
  const dobYear = dobParts[2] || '2003'

  const updateDob = (part: 'day' | 'month' | 'year', val: string) => {
    const d = part === 'day' ? val : (dobDay || '01')
    const m = part === 'month' ? val : (dobMonth || '01')
    const y = part === 'year' ? val : (dobYear || '2000')
    updateField('dateOfBirth', `${d}/${m}/${y}`)
  }

  const handleAddAchieve = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAchieve.trim()) {
      const formatted = achieveCategory
        ? `${newAchieve.trim()} • ${achieveCategory}`
        : newAchieve.trim()
      updateField('achievements', [...formData.achievements, formatted])
      setNewAchieve('')
      setShowAchieveModal(false)
    }
  }

  const handleRemoveAchieve = (idxToRemove: number) => {
    updateField(
      'achievements',
      formData.achievements.filter((_, idx) => idx !== idxToRemove)
    )
  }

  const handleContinue = () => {
    setValidationError(null)

    if (!dobDay || !dobMonth || !dobYear || !formData.dateOfBirth) {
      setValidationError('Date of Birth is mandatory. Please select Day, Month, and Year.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.gender || !formData.gender.trim()) {
      setValidationError('Please select your Gender.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.nationality || !formData.nationality.trim()) {
      setValidationError('Please select your Nationality.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.category || !formData.category.trim()) {
      setValidationError('Please select your Social Category.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.maritalStatus || !formData.maritalStatus.trim()) {
      setValidationError('Please select your Marital Status.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.addressLine1 || formData.addressLine1.trim().length < 5) {
      setValidationError('Address Line 1 is mandatory (minimum 5 characters). Please provide your residential address.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.state || !formData.state.trim()) {
      setValidationError('Please select your State / Union Territory.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.city || !formData.city.trim()) {
      setValidationError('Please enter your City.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.pinCode || !/^\d{6}$/.test(formData.pinCode.trim())) {
      setValidationError('Please enter a valid 6-digit postal PIN code.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!formData.linkedInUrl || !formData.linkedInUrl.trim()) {
      setValidationError('LinkedIn Profile URL is mandatory. Please provide your LinkedIn profile link (e.g. https://linkedin.com/in/yourname).')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    nextStep()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 5 OF 6: PERSONAL & CONTACT DETAILS</div>
      <h2 className="cand-step-title">Personal Details & Additional Information</h2>
      <p className="cand-step-subtitle">
        All demographic, residential contact, and professional link fields below are mandatory to complete verification.
      </p>

      {/* Validation Error Banner */}
      {validationError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '18px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* 4-Quadrant Cards Grid */}
      <div className="cand-review-grid" style={{ margin: '0 0 24px' }}>
        {/* Quadrant 1: Personal Details */}
        <div className="cand-review-card">
          <div className="cand-card-header">
            <div className="cand-card-icon-badge">
              <User size={18} />
            </div>
            <div>
              <h3 className="cand-card-title">Personal Details</h3>
              <p className="cand-card-desc">Basic demographic & identity information</p>
            </div>
          </div>

          <div className="cand-form-grid" style={{ gap: '14px 16px', marginBottom: 0 }}>
            {/* Date of Birth (3 Dropdowns: Day, Month, Year) */}
            <div className="cand-field-group">
              <label className="cand-field-label">Date of Birth <span className="req">*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1.1fr', gap: '6px' }}>
                <select
                  className="cand-input"
                  value={dobDay}
                  onChange={e => updateDob('day', e.target.value)}
                  aria-label="Day of Birth"
                >
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = String(i + 1).padStart(2, '0')
                    return <option key={day} value={day}>{day}</option>
                  })}
                </select>

                <select
                  className="cand-input"
                  value={dobMonth}
                  onChange={e => updateDob('month', e.target.value)}
                  aria-label="Month of Birth"
                >
                  <option value="">Month</option>
                  {[
                    { num: '01', name: 'Jan' },
                    { num: '02', name: 'Feb' },
                    { num: '03', name: 'Mar' },
                    { num: '04', name: 'Apr' },
                    { num: '05', name: 'May' },
                    { num: '06', name: 'Jun' },
                    { num: '07', name: 'Jul' },
                    { num: '08', name: 'Aug' },
                    { num: '09', name: 'Sep' },
                    { num: '10', name: 'Oct' },
                    { num: '11', name: 'Nov' },
                    { num: '12', name: 'Dec' }
                  ].map(m => (
                    <option key={m.num} value={m.num}>{m.name}</option>
                  ))}
                </select>

                <select
                  className="cand-input"
                  value={dobYear}
                  onChange={e => updateDob('year', e.target.value)}
                  aria-label="Year of Birth"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = String(2008 - i)
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
            </div>

            {/* Gender Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Gender <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.gender}
                onChange={e => updateField('gender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Nationality Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Nationality <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.nationality}
                onChange={e => updateField('nationality', e.target.value)}
              >
                <option value="Indian">Indian</option>
                <option value="NRI (Non-Resident Indian)">NRI (Non-Resident Indian)</option>
                <option value="OCI / PIO Cardholder">OCI / PIO Cardholder</option>
                <option value="Nepal / Bhutan Citizen">Nepal / Bhutan Citizen</option>
                <option value="Other Foreign National">Other Foreign National</option>
              </select>
            </div>

            {/* Category / Reservation Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Social Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="cand-input"
                value={formData.category || 'General'}
                onChange={e => updateField('category', e.target.value)}
              >
                <option value="General">General / Unreserved (UR)</option>
                <option value="OBC">OBC - Non Creamy Layer</option>
                <option value="OBC Creamy">OBC - Creamy Layer</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>

            {/* Marital Status Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Marital Status <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                className="cand-input"
                value={formData.maritalStatus || 'Single'}
                onChange={e => updateField('maritalStatus', e.target.value)}
              >
                <option value="Single">Single / Unmarried</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Work Permit Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Valid Work Permit in India? <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.workPermit}
                onChange={e => updateField('workPermit', e.target.value)}
              >
                <option value="Yes">Yes — Citizen / Full Work Rights</option>
                <option value="Need Visa">Need Visa / Sponsorship</option>
                <option value="No">No — Not currently eligible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadrant 2: Address Details */}
        <div className="cand-review-card">
          <div className="cand-card-header">
            <div className="cand-card-icon-badge">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="cand-card-title">Address Details</h3>
              <p className="cand-card-desc">Current residential & communication location</p>
            </div>
          </div>

          <div className="cand-form-grid" style={{ gap: '14px 16px', marginBottom: 0 }}>
            {/* Address Line 1 */}
            <div className="cand-field-group full-width">
              <label className="cand-field-label">Address Line 1 <span className="req">*</span></label>
              <input
                type="text"
                className="cand-input"
                placeholder="Flat / House No., Building Name, Street"
                value={formData.addressLine1}
                onChange={e => updateField('addressLine1', e.target.value)}
                required
              />
            </div>

            {/* Address Line 2 */}
            <div className="cand-field-group full-width">
              <label className="cand-field-label">Address Line 2 (Optional)</label>
              <input
                type="text"
                className="cand-input"
                placeholder="Landmark, Area, Colony"
                value={formData.addressLine2}
                onChange={e => updateField('addressLine2', e.target.value)}
              />
            </div>

            {/* State / UT Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">State / Union Territory <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.state}
                onChange={e => updateField('state', e.target.value)}
                required
              >
                <option value="">Select State / UT</option>
                {INDIAN_STATES_AND_UTS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* City with Datalist Suggestions */}
            <div className="cand-field-group">
              <label className="cand-field-label">City <span className="req">*</span></label>
              <div className="cand-input-wrapper">
                <span className="cand-input-icon">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  className="cand-input"
                  placeholder="Enter or select city"
                  list="major-cities-list"
                  value={formData.city}
                  onChange={e => updateField('city', e.target.value)}
                  required
                />
                <datalist id="major-cities-list">
                  {MAJOR_INDIAN_CITIES.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* PIN Code */}
            <div className="cand-field-group">
              <label className="cand-field-label">PIN Code <span className="req">*</span></label>
              <input
                type="text"
                className="cand-input"
                placeholder="6-digit PIN (e.g. 560103)"
                maxLength={6}
                value={formData.pinCode}
                onChange={e => updateField('pinCode', e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            {/* Country Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Country</label>
              <select className="cand-input" defaultValue="India">
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Canada">Canada</option>
                <option value="Singapore">Singapore</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadrant 3: Diversity & Inclusion (Optional) */}
        <div className="cand-review-card">
          <div className="cand-card-header">
            <div className="cand-card-icon-badge">
              <Users size={18} />
            </div>
            <div>
              <h3 className="cand-card-title">Diversity & Inclusion (Optional)</h3>
              <p className="cand-card-desc">Confidential affirmative hiring & support options</p>
            </div>
          </div>

          <div className="cand-form-grid" style={{ gap: '14px 16px', marginBottom: 0 }}>
            {/* Disability Status Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Do you have a disability (PwD)?</label>
              <select
                className="cand-input"
                value={formData.hasDisability}
                onChange={e => updateField('hasDisability', e.target.value)}
              >
                <option value="No">No</option>
                <option value="Yes - Locomotor Disability">Yes — Locomotor / Mobility</option>
                <option value="Yes - Visual Impairment">Yes — Visual Impairment</option>
                <option value="Yes - Hearing Impairment">Yes — Hearing Impairment</option>
                <option value="Yes - Speech & Language">Yes — Speech and Language</option>
                <option value="Yes - Intellectual / Learning">Yes — Intellectual / Learning</option>
                <option value="Yes - Other Disability">Yes — Other / Multiple</option>
              </select>
            </div>

            {/* Career Gap Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Have you taken a career gap?</label>
              <select
                className="cand-input"
                value={formData.hasCareerGap}
                onChange={e => updateField('hasCareerGap', e.target.value)}
              >
                <option value="No">No Career Gap</option>
                <option value="Yes - < 6 months">Yes — Less than 6 months</option>
                <option value="Yes - 6-12 months">Yes — 6 to 12 months</option>
                <option value="Yes - 1-2 years">Yes — 1 to 2 years</option>
                <option value="Yes - > 2 years">Yes — 2+ years</option>
              </select>
            </div>

            {/* Government Experience Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Government / Defense Experience</label>
              <select
                className="cand-input"
                value={formData.govtExperience}
                onChange={e => updateField('govtExperience', e.target.value)}
              >
                <option value="No">No Government Experience</option>
                <option value="Yes - Defense / Armed Forces">Yes — Ex-Serviceman / Defense</option>
                <option value="Yes - Central Govt / PSU">Yes — Central Govt / PSU</option>
                <option value="Yes - State Govt">Yes — State Govt Department</option>
                <option value="Yes - Quasi-Govt">Yes — Quasi-Government / Autonomous</option>
              </select>
            </div>

            {/* Relocation Preference Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Are you open to relocation?</label>
              <select
                className="cand-input"
                value={formData.openToRelocate}
                onChange={e => updateField('openToRelocate', e.target.value)}
              >
                <option value="Yes">Yes — Anywhere in India</option>
                <option value="Within State">Yes — Within Current State Only</option>
                <option value="Remote Only">Remote / Hybrid Roles Only</option>
                <option value="International">Yes — International Relocation</option>
                <option value="No">No — Prefer Current City Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quadrant 4: Online Presence */}
        <div className="cand-review-card">
          <div className="cand-card-header">
            <div className="cand-card-icon-badge">
              <LinkIcon size={18} />
            </div>
            <div>
              <h3 className="cand-card-title">Online & Professional Profiles</h3>
              <p className="cand-card-desc">Showcase your public profiles and projects (optional)</p>
            </div>
          </div>

          <div className="cand-form-grid single-col" style={{ gap: '14px', marginBottom: 0 }}>
            {/* LinkedIn */}
            <div className="cand-field-group">
              <label className="cand-field-label">LinkedIn Profile URL <span style={{ color: '#ef4444' }}>*</span></label>
              <div className="cand-input-wrapper">
                <span className="cand-input-icon">
                  <Share2 size={16} />
                </span>
                <input
                  type="url"
                  className="cand-input"
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={formData.linkedInUrl}
                  onChange={e => updateField('linkedInUrl', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="cand-field-group">
              <label className="cand-field-label">GitHub Profile URL</label>
              <div className="cand-input-wrapper">
                <span className="cand-input-icon">
                  <Globe size={16} />
                </span>
                <input
                  type="url"
                  className="cand-input"
                  placeholder="https://github.com/yourprofile"
                  value={formData.gitHubUrl}
                  onChange={e => updateField('gitHubUrl', e.target.value)}
                />
              </div>
            </div>

            {/* Portfolio / Personal Website */}
            <div className="cand-field-group">
              <label className="cand-field-label">Portfolio / Personal Website</label>
              <div className="cand-input-wrapper">
                <span className="cand-input-icon">
                  <LinkIcon size={16} />
                </span>
                <input
                  type="url"
                  className="cand-input"
                  placeholder="https://yourwebsite.dev"
                  value={formData.portfolioUrl}
                  onChange={e => updateField('portfolioUrl', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Certifications (Full Width Bottom Card) */}
      <div className="cand-review-card" style={{ marginBottom: '28px' }}>
        <div className="cand-card-header">
          <div className="cand-card-icon-badge">
            <Award size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="cand-card-title">Achievements & Certifications (Optional)</h3>
            <p className="cand-card-desc">
              Add recognized certifications, hackathons, academic awards, patents or publications
            </p>
          </div>
          <button
            type="button"
            className="cand-btn-primary"
            style={{ padding: '6px 14px', fontSize: '13px', height: '36px' }}
            onClick={() => setShowAchieveModal(true)}
          >
            <Plus size={16} /> Add Achievement
          </button>
        </div>

        {formData.achievements.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {formData.achievements.map((item, idx) => (
              <span key={idx} className="cand-achieve-pill">
                <Award size={14} color="#09090b" />
                <span>{item}</span>
                <button
                  type="button"
                  className="cand-achieve-delete-btn"
                  onClick={() => handleRemoveAchieve(idx)}
                  title="Remove"
                  aria-label={`Remove achievement ${item}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#64748b',
              fontSize: '13px'
            }}
          >
            No certifications or achievements added yet. Click &ldquo;Add Achievement&rdquo; above to boost your candidate rating.
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <button type="button" className="cand-btn-back" onClick={prevStep}>
          <ArrowLeft size={16} /> Back
        </button>

        <button type="button" className="cand-btn-primary" onClick={handleContinue}>
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
              padding: '26px',
              maxWidth: '460px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                Add Certification / Award
              </h4>
              <button
                type="button"
                onClick={() => setShowAchieveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="cand-field-group">
              <label className="cand-field-label">Achievement Category</label>
              <select
                className="cand-input"
                value={achieveCategory}
                onChange={e => setAchieveCategory(e.target.value)}
              >
                <option value="Industry Certification">Industry Certification (AWS, GCP, Cisco, etc.)</option>
                <option value="Hackathon / Coding Award">Hackathon / Coding Competition</option>
                <option value="Academic Honor">Academic Honor / Scholarship / Dean&apos;s List</option>
                <option value="Patent / Publication">Patent / Research Paper Publication</option>
                <option value="Open Source">Open Source Contribution</option>
                <option value="Leadership Award">Leadership / Extracurricular Recognition</option>
              </select>
            </div>

            {/* Name / Title */}
            <div className="cand-field-group">
              <label className="cand-field-label">Title / Recognition Name <span className="req">*</span></label>
              <input
                type="text"
                className="cand-input"
                placeholder="e.g. AWS Certified Solutions Architect, Smart India Hackathon Winner"
                value={newAchieve}
                onChange={e => setNewAchieve(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowAchieveModal(false)}>
                Cancel
              </button>
              <button type="submit" className="cand-btn-primary">
                Add to Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Step5PersonalDetails
