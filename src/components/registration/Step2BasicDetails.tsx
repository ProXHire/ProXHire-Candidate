import React, { useState, useEffect, useRef } from 'react'
import {
  User,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  Clock,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step2BasicDetails: React.FC = () => {
  const {
    formData,
    updateField,
    nextStep,
    prevStep,
    submitBasicDetails,
    submitVerifyOtp,
    resendVerificationOtp,
    isSubmitting,
    isVerified,
    otpPending,
    setOtpPending,
    errorMsg,
    setErrorMsg
  } = useCandidate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Real-time password criteria evaluation
  const pwd = formData.password || ''
  const pwdCriteria = {
    minLength: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)
  }
  const metCount = Object.values(pwdCriteria).filter(Boolean).length
  const isPwdAllValid = metCount === 5

  const getPwdStrength = () => {
    if (!pwd) return { score: 0, label: '', color: '#e4e4e7' }
    if (metCount <= 2) return { score: 1, label: 'Weak', color: '#ef4444' }
    if (metCount === 3) return { score: 2, label: 'Fair', color: '#f59e0b' }
    if (metCount === 4) return { score: 3, label: 'Good', color: '#3b82f6' }
    return { score: 4, label: 'Strong', color: '#10b981' }
  }

  const pwdStrength = getPwdStrength()
  const passwordsMatch = Boolean(formData.confirmPassword && formData.password === formData.confirmPassword)

  // Email OTP input state (6 digits)
  const [emailOtpDigits, setEmailOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [emailVerified, setEmailVerified] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  // Countdown timer for Email OTP resend
  const [emailTimer, setEmailTimer] = useState(60)
  const [canResendEmail, setCanResendEmail] = useState(false)
  const [resendEmailSuccess, setResendEmailSuccess] = useState(false)

  // Countdown timer for Email OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (otpPending && emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1)
      }, 1000)
    } else if (emailTimer === 0) {
      setCanResendEmail(true)
    }
    return () => clearInterval(interval)
  }, [otpPending, emailTimer])

  // Handle Form Submit for Initial Basic Registration
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setErrorMsg(null)

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.mobileNumber.trim() ||
      !formData.password
    ) {
      setLocalError('Please complete all mandatory fields marked with *')
      return
    }

    if (!isPwdAllValid) {
      const missing: string[] = []
      if (!pwdCriteria.minLength) missing.push('at least 8 characters')
      if (!pwdCriteria.uppercase) missing.push('an uppercase letter (A-Z)')
      if (!pwdCriteria.lowercase) missing.push('a lowercase letter (a-z)')
      if (!pwdCriteria.number) missing.push('a number (0-9)')
      if (!pwdCriteria.specialChar) missing.push('a special character (!@#$%...)')
      setLocalError(`Password does not meet security requirements. Please include: ${missing.join(', ')}.`)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match. Please verify both passwords.')
      return
    }

    if (!formData.agreeTerms) {
      setLocalError('Please accept the Terms & Conditions to proceed.')
      return
    }

    // If candidate is already verified, proceed directly
    if (isVerified) {
      nextStep()
      return
    }

    try {
      await submitBasicDetails()
      setEmailVerified(false)
      setEmailOtpDigits(['', '', '', '', '', ''])
      setEmailTimer(60)
      setCanResendEmail(false)
    } catch {
      // Error message is stored in context
    }
  }

  // Handle individual Email OTP digit change
  const handleEmailDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '')
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('')
      const nextDigits = [...emailOtpDigits]
      pasted.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d
      })
      setEmailOtpDigits(nextDigits)
      const focusIndex = Math.min(pasted.length, 5)
      emailInputRefs.current[focusIndex]?.focus()
      return
    }

    const nextDigits = [...emailOtpDigits]
    nextDigits[index] = cleaned
    setEmailOtpDigits(nextDigits)

    if (cleaned && index < 5) {
      emailInputRefs.current[index + 1]?.focus()
    }
  }

  const handleEmailDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOtpDigits[index] && index > 0) {
      emailInputRefs.current[index - 1]?.focus()
    }
  }

  // Resend Email OTP
  const handleResendEmail = async () => {
    if (!canResendEmail || isSubmitting) return
    setLocalError(null)
    setErrorMsg(null)
    setEmailTimer(60)
    setCanResendEmail(false)
    try {
      await resendVerificationOtp()
      setResendEmailSuccess(true)
      setTimeout(() => setResendEmailSuccess(false), 4000)
    } catch {
      // Handled in context
    }
  }

  // Verify Email & Continue
  const handleVerifyAndContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLocalError(null)
    setErrorMsg(null)

    const code = emailOtpDigits.join('').trim()
    if (code.length < 6) {
      setLocalError('Please enter the complete 6-digit verification code sent to your email.')
      return
    }

    setIsVerifyingEmail(true)

    try {
      await submitVerifyOtp({
        channel: 'EMAIL',
        emailOtp: code,
      })
      setEmailVerified(true)
    } catch (err: any) {
      setLocalError(err.message || 'Invalid email verification code. Please check your inbox.')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  // --------------------------------------------------------------------------
  // OTP Verification View (Email Verification)
  // --------------------------------------------------------------------------
  if (otpPending) {
    const formattedEmailTimer = `00:${emailTimer < 10 ? `0${emailTimer}` : emailTimer}`

    return (
      <div className="cand-step-2-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, justifyContent: 'space-between' }}>
        <div>
          {/* Header */}
          <div className="cand-step-intro">
            <div className="cand-step-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={12} color="#4f46e5" /> EMAIL AUTHENTICATION
            </div>
            <h2 className="cand-step-title">Verify Your Email Address</h2>
            <p className="cand-step-subtitle">
              Please enter the 6-digit verification code sent to your registered email address ({formData.email}).
            </p>
          </div>

          {/* Alerts */}
          {(localError || errorMsg) && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} /> {localError || errorMsg}
            </div>
          )}

          {resendEmailSuccess && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> Fresh OTP verification code sent to your email inbox ({formData.email}).
            </div>
          )}

          {/* Email Verification Card */}
          <div className="cand-single-otp-wrap">
            <div className={`cand-otp-subcard ${emailVerified ? 'is-verified' : ''}`}>
              <div>
                <div className="cand-otp-subcard-header">
                  <div className="cand-otp-subcard-lead">
                    <div className="cand-otp-circle-icon email">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h3 className="cand-otp-subcard-title">Email Verification Code</h3>
                      <p className="cand-otp-subcard-sub">{formData.email}</p>
                    </div>
                  </div>
                  <div>
                    {emailVerified && (
                      <span className="cand-otp-status-pill verified">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* 6 Digit Inputs */}
                <div className="cand-otp-inputs-row">
                  {emailOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { emailInputRefs.current[idx] = el }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      disabled={emailVerified || isSubmitting || isVerifyingEmail}
                      className={`cand-otp-input-box ${digit ? 'filled' : ''}`}
                      onChange={e => handleEmailDigitChange(idx, e.target.value)}
                      onKeyDown={e => handleEmailDigitKeyDown(idx, e)}
                      onFocus={e => e.target.select()}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="cand-otp-subcard-footer">
                  <div>
                    {emailVerified ? (
                      <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={13} strokeWidth={3} /> Email Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="cand-otp-quick-btn"
                        onClick={handleResendEmail}
                        disabled={!canResendEmail || isSubmitting}
                      >
                        <RotateCcw size={12} />
                        {!canResendEmail ? `Resend in ${formattedEmailTimer}` : 'Resend Email Code'}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!emailVerified && (
                      <button
                        type="button"
                        className="cand-otp-card-inline-btn"
                        onClick={handleVerifyAndContinue}
                        disabled={isVerifyingEmail || emailOtpDigits.join('').length < 6 || emailVerified}
                      >
                        {isVerifyingEmail ? 'Checking...' : 'Verify Code'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Helpful note */}
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Check your inbox or spam folder.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Notice Box */}
          <div className="cand-otp-trust-box">
            <div className="cand-otp-trust-icon">
              <ShieldCheck size={18} />
            </div>
            <p className="cand-otp-trust-text">
              For your account safety and candidate credibility, your email address must be verified. Once verified, you will proceed to create your mandatory candidate profile.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="cand-action-footer cand-otp-action-footer">
          <button
            type="button"
            className="cand-btn-back"
            onClick={() => setOtpPending(false)}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} /> Edit Email or Details
          </button>

          <button
            type="button"
            className="cand-btn-primary"
            onClick={handleVerifyAndContinue}
            disabled={
              isSubmitting ||
              isVerifyingEmail ||
              (!emailVerified && emailOtpDigits.join('').length < 6)
            }
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            {isSubmitting || isVerifyingEmail ? 'Verifying...' : (
              <>
                Verify Email & Create Profile <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // Default Account Details Form
  // --------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmitDetails} className="cand-step-2-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="cand-step-intro">
        <div className="cand-step-indicator">STEP 2 OF 6: ACCOUNT SETUP</div>
        <h2 className="cand-step-title">Basic Account Details</h2>
        <p className="cand-step-subtitle">
          Create your account with a few quick details. A verification code will be sent to your registered email.
        </p>
      </div>

      {(localError || errorMsg) && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '10px'
          }}
        >
          {String(localError || errorMsg).includes('Failed to fetch')
            ? 'Authentication server is reconnecting. Please click "Send OTP & Verify" again.'
            : (localError || errorMsg)}
        </div>
      )}

      {/* Grid Inputs */}
      <div className="cand-form-grid">
        {/* Full Name */}
        <div className="cand-field-group full-width">
          <label className="cand-field-label">
            Full Name <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <User size={16} />
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
              <Mail size={16} />
            </span>
            <input
              type="email"
              className="cand-input"
              placeholder="e.g. name@gmail.com"
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
          <div className="cand-phone-group">
            <div className="cand-phone-prefix">
              <span className="cand-phone-flag">🇮🇳</span>
              <span className="cand-phone-code">+91</span>
            </div>
            <input
              type="tel"
              className="cand-phone-input"
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={e => updateField('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
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
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              className="cand-input"
              placeholder="Min. 8 chars"
              value={formData.password}
              onChange={e => updateField('password', e.target.value)}
              required
            />
            <button
              type="button"
              className="cand-toggle-pwd"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {pwd.length > 0 && (
            <div className="cand-pwd-meter-box">
              <div className="cand-pwd-meter-header">
                <span className="cand-pwd-meter-text">Strength:</span>
                <span className="cand-pwd-meter-label" style={{ color: pwdStrength.color }}>
                  {pwdStrength.label}
                </span>
              </div>
              <div className="cand-pwd-bars">
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="cand-pwd-bar-segment"
                    style={{
                      backgroundColor: level <= pwdStrength.score ? pwdStrength.color : '#e4e4e7'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            Confirm Password <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <LockKeyhole size={16} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="cand-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              required
            />
            <button
              type="button"
              className="cand-toggle-pwd"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm Password Match Feedback */}
          {formData.confirmPassword.length > 0 && (
            <div className={`cand-pwd-match-pill ${passwordsMatch ? 'matched' : 'mismatch'}`}>
              {passwordsMatch ? (
                <>
                  <CheckCircle2 size={12} strokeWidth={2.5} />
                  <span>Passwords match</span>
                </>
              ) : (
                <>
                  <AlertCircle size={12} strokeWidth={2.5} />
                  <span>Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Real-time Security Criteria Checklist spanning full width */}
        <div className="cand-pwd-requirements-bar">
          <span className="cand-pwd-req-title">Password must include:</span>
          <div className="cand-pwd-chips-row">
            <span className={`cand-pwd-chip ${pwdCriteria.minLength ? 'met' : ''}`}>
              {pwdCriteria.minLength ? <Check size={11} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              8+ chars
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.uppercase ? 'met' : ''}`}>
              {pwdCriteria.uppercase ? <Check size={11} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Uppercase (A-Z)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.lowercase ? 'met' : ''}`}>
              {pwdCriteria.lowercase ? <Check size={11} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Lowercase (a-z)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.number ? 'met' : ''}`}>
              {pwdCriteria.number ? <Check size={11} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Number (0-9)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.specialChar ? 'met' : ''}`}>
              {pwdCriteria.specialChar ? <Check size={11} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Special char (!@#...)
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Data Privacy Assurance Strip */}
      <div className="cand-trust-assurance-grid">
        <div className="cand-trust-item">
          <div className="cand-trust-icon-box">
            <Lock size={15} color="#09090b" />
          </div>
          <div className="cand-trust-text">
            <h4>256-Bit SSL Encrypted</h4>
            <p>Your password & credentials are encrypted at rest.</p>
          </div>
        </div>

        <div className="cand-trust-item">
          <div className="cand-trust-icon-box">
            <ShieldCheck size={15} color="#09090b" />
          </div>
          <div className="cand-trust-text">
            <h4>DPDP Act 2023 Compliant</h4>
            <p>Strict data privacy adhering to Indian laws.</p>
          </div>
        </div>

        <div className="cand-trust-item">
          <div className="cand-trust-icon-box">
            <CheckCircle2 size={15} color="#09090b" />
          </div>
          <div className="cand-trust-text">
            <h4>Zero Spam Guarantee</h4>
            <p>Only verified employers can view your profile.</p>
          </div>
        </div>
      </div>

      {/* Terms & Privacy Checkbox */}
      <label className="cand-checkbox-label" style={{ margin: '4px 0 16px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#334155' }}>
        <input
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={e => updateField('agreeTerms', e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: '#09090b', cursor: 'pointer' }}
          required
        />
        <span>
          I agree to the <a href="#terms" style={{ color: '#09090b', fontWeight: 600, textDecoration: 'underline' }}>Terms & Conditions</a> and{' '}
          <a href="#privacy" style={{ color: '#09090b', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</a> *
        </span>
      </label>

      {/* Footer Buttons */}
      <div className="cand-action-footer">
        <button
          type="button"
          className="cand-btn-back"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="cand-footer-next-hint">
          <span>Verification via <strong>Instant OTP</strong></span>
        </div>

        <button
          type="submit"
          className="cand-btn-primary"
          disabled={isSubmitting}
          style={{ minWidth: '180px', justifyContent: 'center' }}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send OTP & Verify'} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  )
}
