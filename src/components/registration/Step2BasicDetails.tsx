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
  AlertCircle,
  Zap
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import { phoneAuthService } from '../../services/phoneAuthService'
import type { ConfirmationResult } from 'firebase/auth'

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

  // OTP inputs state (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Firebase SMS Phone Auth states
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isSendingSms, setIsSendingSms] = useState(false)
  const [smsSuccess, setSmsSuccess] = useState(false)
  const [smsError, setSmsError] = useState<string | null>(null)

  // Countdown timer for OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (otpPending && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    } else if (otpTimer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [otpPending, otpTimer])

  // Trigger Firebase SMS automatically when otpPending is activated
  useEffect(() => {
    let active = true
    if (otpPending && formData.mobileNumber && !confirmationResult && !isSendingSms) {
      const triggerSms = async () => {
        try {
          setIsSendingSms(true)
          setSmsError(null)
          const result = await phoneAuthService.sendPhoneOtp(
            formData.mobileNumber,
            'candidate-recaptcha-container'
          )
          if (active) {
            setConfirmationResult(result)
            setSmsSuccess(true)
            setTimeout(() => setSmsSuccess(false), 5000)
          }
        } catch (err: any) {
          console.warn('Firebase SMS Phone Auth notice:', err.message)
          if (active) {
            setSmsError(err.message || 'Failed to dispatch SMS via Firebase.')
          }
        } finally {
          if (active) setIsSendingSms(false)
        }
      }

      const timer = setTimeout(triggerSms, 400)
      return () => {
        active = false
        clearTimeout(timer)
        phoneAuthService.clearRecaptcha()
      }
    }
  }, [otpPending, formData.mobileNumber])

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
      setOtpTimer(60)
      setCanResend(false)
    } catch {
      // Error message is stored in context
    }
  }

  // Handle individual OTP digit change
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '')
    if (cleaned.length > 1) {
      // Handle paste
      const pasted = cleaned.slice(0, 6).split('')
      const nextDigits = [...otpDigits]
      pasted.forEach((d, i) => {
        if (i < 6) nextDigits[i] = d
      })
      setOtpDigits(nextDigits)
      const focusIndex = Math.min(pasted.length, 5)
      otpInputRefs.current[focusIndex]?.focus()
      return
    }

    const nextDigits = [...otpDigits]
    nextDigits[index] = cleaned
    setOtpDigits(nextDigits)

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle OTP Verification Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setErrorMsg(null)

    const code = otpDigits.join('').trim()
    if (code.length < 6) {
      setLocalError('Please enter the full 6-digit verification code.')
      return
    }

    // 1. If Firebase confirmationResult exists, attempt Firebase verification first
    if (confirmationResult) {
      try {
        await phoneAuthService.verifyPhoneOtp(confirmationResult, code)
        // Firebase SMS OTP succeeded! Sync verification state with backend
        await submitVerifyOtp(code, true)
        return
      } catch (fbErr: any) {
        console.warn('Firebase verify notice, attempting backend verification...', fbErr.message)
      }
    }

    // 2. Direct backend OTP verification (validates Resend email code or devOtp)
    try {
      await submitVerifyOtp(code, false)
    } catch {
      // Error message handled in context
    }
  }

  // Manual Trigger or Resend Firebase SMS
  const handleSendFirebaseSms = async () => {
    if (isSendingSms || !formData.mobileNumber) return
    try {
      setIsSendingSms(true)
      setSmsError(null)
      const result = await phoneAuthService.sendPhoneOtp(
        formData.mobileNumber,
        'candidate-recaptcha-container'
      )
      setConfirmationResult(result)
      setSmsSuccess(true)
      setTimeout(() => setSmsSuccess(false), 5000)
    } catch (err: any) {
      console.warn('Firebase SMS Resend notice:', err.message)
      setSmsError(err.message || 'SMS dispatch failed')
    } finally {
      setIsSendingSms(false)
    }
  }

  // Handle Resend OTP (Both Resend Email + Firebase SMS)
  const handleResend = async () => {
    if (!canResend || isSubmitting) return
    setLocalError(null)
    setErrorMsg(null)
    setOtpTimer(60)
    setCanResend(false)

    // Trigger SMS Resend
    handleSendFirebaseSms()

    // Trigger Email Resend
    try {
      await resendVerificationOtp()
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 4000)
    } catch {
      // Handled in context
    }
  }

  // --------------------------------------------------------------------------
  // OTP Verification View (Dispatched to Mobile & Gmail)
  // --------------------------------------------------------------------------
  if (otpPending) {
    const formattedTimer = `00:${otpTimer < 10 ? `0${otpTimer}` : otpTimer}`
    
    // Friendly error messaging for SMS carrier sandbox fallback
    const friendlySmsNotice = smsError
      ? smsError.includes('billing-not-enabled') || smsError.includes('auth/')
        ? 'Carrier SMS delivery is in fallback mode. Please use the 6-digit OTP code sent to your registered email.'
        : smsError
      : null

    return (
      <div className="cand-step-2-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, justifyContent: 'space-between' }}>
        <div>
          <div className="cand-step-intro">
            <div className="cand-step-indicator">TWO-FACTOR AUTHENTICATION</div>
            <h2 className="cand-step-title">Verify Your Account</h2>
            <p className="cand-step-subtitle">
              We've dispatched a 6-digit verification code to your registered mobile and email address.
            </p>
          </div>

          {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
          <div id="candidate-recaptcha-container" style={{ margin: 0, padding: 0 }}></div>

          {(localError || errorMsg) && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '10px',
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

          {smsSuccess && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> Mobile SMS OTP dispatched to +91 {formData.mobileNumber}
            </div>
          )}

          {friendlySmsNotice && (
            <div className="cand-otp-notice-banner">
              <div className="cand-otp-notice-content">
                <Info size={16} style={{ flexShrink: 0, color: '#b45309' }} />
                <span>{friendlySmsNotice}</span>
              </div>
              <button
                type="button"
                className="cand-otp-notice-retry"
                onClick={handleSendFirebaseSms}
                disabled={isSendingSms}
              >
                {isSendingSms ? 'Sending...' : 'Retry SMS'}
              </button>
            </div>
          )}

          {resendSuccess && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> Fresh OTP verification code dispatched to your email & mobile.
            </div>
          )}

          {/* Delivery Channels Status Cards */}
          <div className="cand-otp-channel-grid">
            {/* Email Channel */}
            <div className="cand-otp-channel-card">
              <div className="cand-otp-channel-icon email">
                <Mail size={18} />
              </div>
              <div className="cand-otp-channel-info">
                <span className="cand-otp-channel-label">Email Address</span>
                <span className="cand-otp-channel-val">{formData.email}</span>
              </div>
              <span className="cand-otp-badge-sent">
                <span className="cand-badge-dot"></span> Sent
              </span>
            </div>

            {/* Mobile Channel */}
            <div className="cand-otp-channel-card">
              <div className="cand-otp-channel-icon phone">
                <Smartphone size={18} />
              </div>
              <div className="cand-otp-channel-info">
                <span className="cand-otp-channel-label">Mobile Number</span>
                <span className="cand-otp-channel-val">+91 {formData.mobileNumber}</span>
              </div>
              <span className={confirmationResult ? "cand-otp-badge-sent" : "cand-otp-badge-ready"}>
                <span className="cand-badge-dot"></span> {confirmationResult ? 'Sent' : isSendingSms ? 'Sending' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Main OTP Input Card */}
          <div className="cand-otp-main-card">
            <div className="cand-otp-header-row">
              <span className="cand-otp-card-title">Enter 6-Digit OTP Code</span>
              <div className="cand-otp-timer-badge">
                <Clock size={13} />
                <span>Expires in <strong>{formattedTimer}</strong></span>
              </div>
            </div>

            {/* 6 Digit Inputs */}
            <div className="cand-otp-container">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpInputRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  className={`cand-otp-input ${digit ? 'filled' : ''}`}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(idx, e)}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>

            {/* Resend actions */}
            <div className="cand-otp-footer-row">
              <span className="cand-otp-resend-prompt">Didn't receive the OTP?</span>
              <div className="cand-otp-actions-group">
                <button
                  type="button"
                  className="cand-otp-text-btn"
                  onClick={handleSendFirebaseSms}
                  disabled={isSendingSms}
                >
                  <Smartphone size={13} /> {isSendingSms ? 'Sending SMS...' : 'Resend SMS'}
                </button>
                <span className="cand-otp-action-sep">|</span>
                <button
                  type="button"
                  className="cand-otp-text-btn bold"
                  onClick={handleResend}
                  disabled={!canResend || isSubmitting}
                >
                  <RotateCcw size={13} /> Resend All {!canResend ? `(${otpTimer}s)` : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Trust Notice Box */}
          <div className="cand-otp-trust-box">
            <div className="cand-otp-trust-icon">
              <ShieldCheck size={18} />
            </div>
            <p className="cand-otp-trust-text">
              For your account safety and candidate credibility, your mobile number and email must be verified. Dashboard access is unlocked immediately following verification.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="cand-action-footer cand-otp-action-footer">
          <button
            type="button"
            className="cand-btn-back"
            onClick={() => setOtpPending(false)}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} /> Edit Phone or Email
          </button>

          <button
            type="button"
            className="cand-btn-primary"
            onClick={handleVerifyOtp}
            disabled={isSubmitting || otpDigits.join('').length < 6}
            style={{ minWidth: '170px', justifyContent: 'center' }}
          >
            {isSubmitting ? 'Verifying...' : (
              <>
                Verify & Continue <ArrowRight size={16} />
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
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="candidate-recaptcha-container" style={{ margin: 0, padding: 0 }}></div>
      <div className="cand-step-intro">
        <div className="cand-step-indicator">STEP 2 OF 2</div>
        <h2 className="cand-step-title">Basic Account Details</h2>
        <p className="cand-step-subtitle">
          Create your account with a few quick details. Real verification codes will be sent to your mobile and email.
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
