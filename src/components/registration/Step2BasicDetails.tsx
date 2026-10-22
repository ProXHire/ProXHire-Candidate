import React, { useState, useEffect, useRef } from 'react'
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
  const [showBgvModal, setShowBgvModal] = useState(false)
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
      !formData.panNumber.trim() ||
      !formData.password
    ) {
      setLocalError('Please complete all mandatory fields marked with *')
      return
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(formData.panNumber.trim().toUpperCase())) {
      setLocalError('Invalid PAN format. Must be 10 characters: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).')
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

    return (
      <div className="cand-step-2-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, justifyContent: 'space-between' }}>
        <div>
          <div className="cand-step-intro">
            <div className="cand-step-indicator">TWO-FACTOR VERIFICATION</div>
            <h2 className="cand-step-title">Verify Mobile & Email OTP</h2>
            <p className="cand-step-subtitle">
              We've dispatched verification codes to your mobile <strong>+91 {formData.mobileNumber}</strong> (via Google Firebase SMS) and email <strong>{formData.email}</strong> (via Resend).
            </p>
          </div>

          {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
          <div id="candidate-recaptcha-container" style={{ margin: 0, padding: 0 }}></div>

          {(localError || errorMsg) && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px'
              }}
            >
              {localError || errorMsg}
            </div>
          )}

          {smsSuccess && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> Cellular SMS OTP dispatched to +91 {formData.mobileNumber} via Firebase!
            </div>
          )}

          {smsError && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                color: '#854d0e',
                borderRadius: '8px',
                fontSize: '12.5px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>ℹ️ Mobile SMS notice: {smsError} (You can enter the OTP received in your email).</span>
              <button
                type="button"
                onClick={handleSendFirebaseSms}
                disabled={isSendingSms}
                style={{
                  background: '#854d0e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSendingSms ? 'Sending...' : 'Retry SMS'}
              </button>
            </div>
          )}

          {resendSuccess && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                borderRadius: '8px',
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

          {/* Delivery Channels Status Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            {/* Email Channel */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Mail size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>EMAIL (RESEND)</div>
                <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formData.email}
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                Sent
              </span>
            </div>

            {/* Mobile Channel */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Smartphone size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>MOBILE SMS (FIREBASE)</div>
                <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                  +91 {formData.mobileNumber}
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: confirmationResult ? '#16a34a' : isSendingSms ? '#2563eb' : '#d97706',
                  backgroundColor: confirmationResult ? '#dcfce7' : isSendingSms ? '#dbeafe' : '#fef3c7',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {isSendingSms ? 'Sending' : confirmationResult ? 'SMS Sent' : 'Ready'}
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              marginTop: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Enter 6-Digit OTP Code
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b' }}>
                <Clock size={14} />
                <span>Expires in <strong style={{ color: '#0f172a' }}>{formattedTimer}</strong></span>
              </div>
            </div>

            {/* 6 Digit Inputs */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpInputRefs.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    border: digit ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    boxShadow: digit ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {/* Resend actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                Didn't receive the OTP?
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleSendFirebaseSms}
                  disabled={isSendingSms}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSendingSms ? '#94a3b8' : '#2563eb',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: isSendingSms ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Smartphone size={13} /> {isSendingSms ? 'Sending SMS...' : 'Resend SMS'}
                </button>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isSubmitting}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canResend ? '#2563eb' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0
                  }}
                >
                  <RotateCcw size={14} /> Resend All
                </button>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              padding: '14px',
              backgroundColor: '#eff6ff',
              borderRadius: '10px',
              marginTop: '16px',
              border: '1px solid #bfdbfe'
            }}
          >
            <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '12.5px', color: '#1e40af', lineHeight: 1.5 }}>
              For your account safety and candidate credibility, your mobile number and email must be verified. Dashboard access is unlocked immediately following verification.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="cand-step-footer" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="cand-btn-secondary"
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
            style={{ minWidth: '160px', justifyContent: 'center' }}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------------------
  // Default Account Details Form
  // --------------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmitDetails} className="cand-step-2-form" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, justifyContent: 'space-between' }}>
      <div className="cand-step-intro">
        <div className="cand-step-indicator">STEP 2 OF 6</div>
        <h2 className="cand-step-title">Basic Account Details</h2>
        <p className="cand-step-subtitle">
          Create your account with a few quick details. Real verification codes will be sent to your mobile and email via Resend.
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
          {localError || errorMsg}
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
          <div className="cand-input-wrapper" style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                borderRight: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475467'
              }}
            >
              🇮🇳 +91
            </div>
            <input
              type="tel"
              className="cand-input"
              style={{ paddingLeft: '12px' }}
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={e => updateField('mobileNumber', e.target.value)}
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* PAN Number */}
        <div className="cand-field-group">
          <label className="cand-field-label">
            PAN Number <span className="req">*</span>
          </label>
          <div className="cand-input-wrapper">
            <span className="cand-input-icon">
              <CreditCard size={16} />
            </span>
            <input
              type="text"
              className="cand-input"
              placeholder="10-digit PAN (e.g. ABCDE1234F)"
              value={formData.panNumber}
              onChange={e => updateField('panNumber', e.target.value.toUpperCase())}
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
              placeholder="Min. 8 chars (A-Z, a-z, 0-9, symbol)"
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

          {/* Real-time Security Criteria Checklist */}
          <div className="cand-pwd-criteria-grid">
            <span className={`cand-pwd-chip ${pwdCriteria.minLength ? 'met' : ''}`}>
              {pwdCriteria.minLength ? <Check size={10} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              8+ chars
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.uppercase ? 'met' : ''}`}>
              {pwdCriteria.uppercase ? <Check size={10} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Uppercase (A-Z)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.lowercase ? 'met' : ''}`}>
              {pwdCriteria.lowercase ? <Check size={10} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Lowercase (a-z)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.number ? 'met' : ''}`}>
              {pwdCriteria.number ? <Check size={10} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Number (0-9)
            </span>
            <span className={`cand-pwd-chip ${pwdCriteria.specialChar ? 'met' : ''}`}>
              {pwdCriteria.specialChar ? <Check size={10} strokeWidth={3} /> : <span className="cand-pwd-dot" />}
              Special char (!@#...)
            </span>
          </div>
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
              placeholder="Re-enter your password"
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
      </div>

      {/* Trust & Verification Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          margin: '10px 0'
        }}
      >
        <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
          Your data is encrypted end-to-end. We verify candidates to boost your profile visibility with verified employers.
        </span>
      </div>

      {/* Consent Checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0 12px' }}>
        {/* Pre-BGV Consent */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12px',
            color: '#344054',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={formData.preBgvConsent}
            onChange={e => updateField('preBgvConsent', e.target.checked)}
            style={{ marginTop: '2px', cursor: 'pointer' }}
          />
          <span>
            I consent to automated pre-BGV checks to receive a verified profile badge.{' '}
            <button
              type="button"
              onClick={() => setShowBgvModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
                cursor: 'pointer'
              }}
            >
              Learn more
            </button>
          </span>
        </label>

        {/* Terms & Conditions */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12px',
            color: '#344054',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={e => updateField('agreeTerms', e.target.checked)}
            style={{ marginTop: '2px', cursor: 'pointer' }}
            required
          />
          <span>
            I agree to the{' '}
            <a href="#terms" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="#privacy" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              Privacy Policy
            </a>
            .
          </span>
        </label>
      </div>

      {/* Footer Buttons */}
      <div className="cand-step-footer">
        <button
          type="button"
          className="cand-btn-secondary"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          type="submit"
          className="cand-btn-primary"
          disabled={isSubmitting}
          style={{ minWidth: '180px', justifyContent: 'center' }}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send OTP & Verify'} <ArrowRight size={16} />
        </button>
      </div>

      {/* Pre-BGV Modal */}
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
