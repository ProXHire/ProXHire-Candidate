import React, { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  TrendingUp,
  Search,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import { authService } from '../../services/authService'

// Google "G" official multi-color SVG icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.2C9.5 37.4 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.7l6.2 5.2C41.2 36.1 44 30.5 44 24c0-1.2-.1-2.4-.4-3.5z"/>
  </svg>
)

export const CandidateLogin: React.FC = () => {
  const { formData, setViewMode, setStep, loginCandidate } = useCandidate()

  // State - Real Clean Defaults (no dummy prefill)
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [emailOrPhone, setEmailOrPhone] = useState(formData.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // OTP State
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || '')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpTimer, setOtpTimer] = useState(30)

  // Loading & Error State
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // Handle Password Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!emailOrPhone.trim() || !password) {
      setErrorMsg('Please enter your email/phone and password.')
      return
    }

    setIsLoading(true)
    try {
      await loginCandidate(emailOrPhone, password)
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials or register.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP Dispatch for Candidate Mobile Login
  const handleSendOtp = async () => {
    const cleanMobile = mobileNumber.replace(/[\s\-\+]/g, '')
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.')
      return
    }

    setErrorMsg(null)
    setIsLoading(true)
    try {
      await authService.resendOtp(undefined, undefined, cleanMobile)
      setOtpSent(true)
      setOtpTimer(30)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch OTP. Please check the number.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP Verification for Candidate Mobile Login
  const handleVerifyOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanMobile = mobileNumber.replace(/[\s\-\+]/g, '')
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP.')
      return
    }

    setIsLoading(true)
    try {
      const res = await authService.verifyOtp({
        mobileNumber: cleanMobile,
        otpCode: otpCode.trim(),
        purpose: 'CANDIDATE_LOGIN'
      })

      if (res.token) {
        localStorage.setItem('proxhire_candidate_token', res.token)
        localStorage.setItem('proxhire_candidate_verified', 'true')
        localStorage.setItem('proxhire_candidate_registered', 'true')
        setViewMode('dashboard')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cand-split-container cand-login-container cand-single-page-container">
      {/* Left Column - Hero Visual Branding */}
      <div className="cand-hero-col cand-login-hero cand-single-page-hero">
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

          {/* Headline */}
          <div className="cand-hero-main">
            <h1 className="cand-hero-title">
              Welcome<br />
              Back to<br />
              <span className="muted-text">Opportunities.</span>
            </h1>
            <p className="cand-hero-desc">
              Log in to your verified candidate profile, track applications, and engage with top corporate recruiters across India.
            </p>

            <div className="cand-feature-list">
              {[
                {
                  icon: Search,
                  title: 'Real-Time Job Alerts',
                  desc: 'Handpicked openings matching your skills'
                },
                {
                  icon: ShieldCheck,
                  title: 'Verified Badged Status',
                  desc: 'High priority ranking with hiring managers'
                },
                {
                  icon: TrendingUp,
                  title: 'Application Pipeline',
                  desc: 'Live interview feedback & progress updates'
                }
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="cand-feature-item">
                    <div className="cand-feature-icon-box">
                      <Icon size={20} strokeWidth={2} />
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

          {/* Footer Kicker */}
          <div className="cand-hero-footer">
            <div className="cand-hero-kicker">AUTHENTIC &nbsp;|&nbsp; VERIFIED &nbsp;|&nbsp; EMPOWERED</div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="cand-form-col cand-login-col cand-single-page-col">
        {/* Top Header Bar */}
        <div className="cand-form-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Don't have an account?{' '}
              <a
                href="#register"
                onClick={e => {
                  e.preventDefault()
                  setStep(1)
                  setViewMode('registration')
                }}
                style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
              >
                Register as Candidate
              </a>
            </span>
          </div>

          <button
            type="button"
            className="cand-role-switch-btn"
            onClick={() => window.open('http://localhost:5175', '_blank')}
          >
            Employer Portal →
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="cand-form-content">
          <div className="cand-login-form-wrapper">
            <div className="cand-step-intro" style={{ marginBottom: '14px' }}>
              <div className="cand-step-indicator">CANDIDATE SIGN IN</div>
              <h2 className="cand-step-title">Welcome Back</h2>
              <p className="cand-step-subtitle">
                Access your candidate dashboard, saved jobs, and application status.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Method Toggle */}
            <div className="cand-login-tabs">
              <button
                type="button"
                className={`cand-login-tab-btn ${loginMethod === 'password' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMethod('password')
                  setErrorMsg(null)
                }}
              >
                Password Login
              </button>
              <button
                type="button"
                className={`cand-login-tab-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMethod('otp')
                  setErrorMsg(null)
                }}
              >
                Mobile OTP Login
              </button>
            </div>

            {/* PASSWORD LOGIN FORM */}
            {loginMethod === 'password' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Email / Mobile Field */}
                <div className="cand-field-group">
                  <label className="cand-field-label">
                    Email or Mobile Number <span className="req">*</span>
                  </label>
                  <div className="cand-input-wrapper">
                    <span className="cand-input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      className="cand-input"
                      placeholder="Enter registered email or phone"
                      value={emailOrPhone}
                      onChange={e => setEmailOrPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="cand-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="cand-field-label">
                      Password <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                      onClick={() => setShowForgotModal(true)}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="cand-input-wrapper">
                    <span className="cand-input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="cand-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                </div>

                {/* Remember Me */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475467', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Remember my credentials
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="cand-btn-primary"
                  style={{ height: '44px', marginTop: '4px', justifyContent: 'center' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* OTP LOGIN FORM */}
            {loginMethod === 'otp' && (
              <form onSubmit={otpSent ? handleVerifyOtpLogin : e => { e.preventDefault(); handleSendOtp(); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="cand-field-group">
                  <label className="cand-field-label">
                    Registered Mobile Number <span className="req">*</span>
                  </label>
                  <div className="cand-phone-wrap">
                    <select
                      className="cand-country-code-select"
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91 (IN)</option>
                    </select>
                    <div className="cand-input-wrapper" style={{ flex: 1 }}>
                      <span className="cand-input-icon">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        className="cand-input"
                        placeholder="Enter 10-digit mobile number"
                        value={mobileNumber}
                        maxLength={10}
                        onChange={e => setMobileNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    className="cand-btn-primary"
                    style={{ height: '42px', marginTop: '6px', justifyContent: 'center' }}
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Dispatching OTP...' : 'Send OTP to Mobile'} <ArrowRight size={15} />
                  </button>
                ) : (
                  <div className="cand-field-group" style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="cand-field-label">
                        Enter 6-Digit OTP <span className="req">*</span>
                      </label>
                      <span style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>
                        OTP sent to {countryCode} {mobileNumber}
                      </span>
                    </div>
                    <div className="cand-input-wrapper">
                      <span className="cand-input-icon">
                        <LockKeyhole size={16} />
                      </span>
                      <input
                        type="text"
                        className="cand-input"
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        maxLength={6}
                        onChange={e => setOtpCode(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11.5px',
                          color: '#475467',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                        onClick={handleSendOtp}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="cand-btn-primary"
                      style={{ height: '42px', marginTop: '10px', justifyContent: 'center' }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Verifying OTP...' : 'Verify OTP & Enter'} <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Quick Registration Redirect */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                New to ProXHire?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                  onClick={() => {
                    setStep(1)
                    setViewMode('registration')
                  }}
                >
                  Create an account now →
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
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
          onClick={() => setShowForgotModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '460px',
              width: '100%'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              Reset Password
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.5 }}>
              Enter your registered email address or mobile number. We'll send you an OTP to reset your password.
            </p>

            {forgotSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 6px' }}>
                  Reset Link Dispatched
                </h5>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  If an account exists for {forgotEmail}, instructions have been sent.
                </p>
                <button
                  type="button"
                  className="cand-btn-primary"
                  style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setShowForgotModal(false)
                    setForgotSubmitted(false)
                    setForgotEmail('')
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (forgotEmail) setForgotSubmitted(true)
                }}
              >
                <div className="cand-field-group" style={{ marginBottom: '16px' }}>
                  <label className="cand-field-label">Registered Email / Phone</label>
                  <div className="cand-input-wrapper">
                    <span className="cand-input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      className="cand-input"
                      placeholder="e.g. candidate@gmail.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="cand-btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cand-btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Send OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
