import React, { useState } from 'react'
import {
  User,
  Mail,
  Smartphone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step2BasicDetails: React.FC = () => {
  const { formData, updateField, nextStep, prevStep } = useCandidate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showBgvModal, setShowBgvModal] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.mobileNumber.trim() ||
      !formData.panNumber.trim() ||
      !formData.password
    ) {
      setErrorMsg('Please complete all mandatory fields marked with *')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.')
      return
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Please accept the Terms & Conditions to proceed.')
      return
    }

    nextStep()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 2 OF 6</div>
      <h2 className="cand-step-title">Basic Account Details</h2>
      <p className="cand-step-subtitle">
        Create your account with a few quick details.
      </p>

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '20px'
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="cand-form-grid">
        {/* Full Name */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Full Name <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <User size={18} />
            </span>
            <input
              type="text"
              className="cand-input"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email ID */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Email ID <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <Mail size={18} />
            </span>
            <input
              type="email"
              className="cand-input"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Mobile Number <span className="req">*</span>
          </label>
          <div className="cand-phone-wrap">
            <select
              className="cand-country-code-select"
              value={formData.countryCode}
              onChange={e => updateField('countryCode', e.target.value)}
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+65">+65</option>
            </select>
            <div className="cand-input-wrapper">
              <span className="cand-input-icon">
                <Smartphone size={18} />
              </span>
              <input
                type="tel"
                className="cand-input"
                placeholder="Enter your mobile number"
                value={formData.mobileNumber}
                onChange={e => updateField('mobileNumber', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* PAN Number */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            PAN Number <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <CreditCard size={18} />
            </span>
            <input
              type="text"
              className="cand-input"
              placeholder="Enter your PAN number (e.g. ABCDE1234F)"
              value={formData.panNumber}
              maxLength={10}
              onChange={e => updateField('panNumber', e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Password <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="cand-input"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={e => updateField('password', e.target.value)}
              required
            />
            <button
              type="button"
              style={{ position: 'absolute', right: '12px', color: '#71717a' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Confirm Password <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <Lock size={18} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="cand-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              required
            />
            <button
              type="button"
              style={{ position: 'absolute', right: '12px', color: '#71717a' }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Password Strength Indicator */}
      <div className="cand-pwd-strength-row">
        <span>Password strength</span>
        <div className="cand-pwd-bars">
          <div className="cand-pwd-bar-segment filled" />
          <div className="cand-pwd-bar-segment filled" />
          <div className="cand-pwd-bar-segment filled" />
          <div className="cand-pwd-bar-segment filled" />
        </div>
      </div>

      {/* Pre-BGV Consent Card */}
      <div className="cand-prebgv-card">
        <input
          type="checkbox"
          checked={formData.preBgvConsent}
          onChange={e => updateField('preBgvConsent', e.target.checked)}
          style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#000000', cursor: 'pointer' }}
        />
        <div className="cand-prebgv-content" style={{ flex: 1 }}>
          <h5>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              I consent to Pre-BGV (Background Verification) <Info size={14} color="#71717a" />
            </span>
            <span
              className="cand-prebgv-link"
              onClick={() => setShowBgvModal(true)}
            >
              View Pre-BGV Notice
            </span>
          </h5>
          <p>
            I allow ProXHire to process my information for background verification checks to help employers assess my credentials. This is optional and can be completed later.
          </p>
        </div>
      </div>

      {/* Terms & Privacy Checkbox */}
      <label className="cand-checkbox-label">
        <input
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={e => updateField('agreeTerms', e.target.checked)}
          required
        />
        <span>
          I agree to the <a href="#terms">Terms & Conditions</a> and{' '}
          <a href="#privacy">Privacy Policy</a> *
        </span>
      </label>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <button type="button" className="cand-btn-back" onClick={prevStep}>
          <ArrowLeft size={16} /> Back
        </button>

        <button type="submit" className="cand-btn-primary">
          Continue <ArrowRight size={16} />
        </button>
      </div>

      {/* Pre-BGV Info Modal */}
      {showBgvModal && (
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
          onClick={() => setShowBgvModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '500px',
              width: '100%'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              Pre-BGV Verification Notice
            </h4>
            <p style={{ fontSize: '13.5px', color: '#475467', lineHeight: 1.5, marginBottom: '16px' }}>
              ProXHire conducts non-intrusive automated credential verification (Aadhaar/PAN format validity, academic records and employment tenure checks) to grant job seekers the verified candidate badge. Verified badges lead to 3x higher interview invite rates from top corporate recruiters.
            </p>
            <button
              type="button"
              className="cand-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowBgvModal(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
