import React, { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
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
  const [emailOrPhone, setEmailOrPhone] = useState(formData.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

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
      const msg = err.message?.includes('Failed to fetch')
        ? 'Backend service is starting up or offline. Please retry in a few moments.'
        : (err.message || 'Login failed. Please verify credentials or register.')
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="cand-split-container cand-login-container cand-single-page-container">
      {/* Left Column - Constant Architectural Visual Branding */}
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

          {/* Constant Headline & Features across all screens */}
          <div className="cand-hero-main">
            <h1 className="cand-hero-title">
              One Profile.<br />
              More<br />
              <span className="muted-text">Opportunities.</span>
            </h1>
            <p className="cand-hero-desc">
              Get verified, showcase your skills and connect with top employers across India.
            </p>

            <div className="cand-feature-list">
              {[
                {
                  icon: Search,
                  title: 'Relevant Job Opportunities',
                  desc: 'Find roles that match your skills'
                },
                {
                  icon: ShieldCheck,
                  title: 'Verified & Trusted Platform',
                  desc: 'Build credibility with employers'
                },
                {
                  icon: TrendingUp,
                  title: 'Career Growth',
                  desc: 'More interviews, better opportunities'
                },
                {
                  icon: FileText,
                  title: 'Secure & Private',
                  desc: 'Your information stays protected'
                }
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="cand-feature-item">
                    <div className="cand-feature-icon-box">
                      <Icon size={22} strokeWidth={2} />
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

          {/* Footer Area: Constant kicker across all screens */}
          <div className="cand-hero-footer">
            <div className="cand-hero-kicker">SKILLS &nbsp;|&nbsp; OPPORTUNITIES &nbsp;|&nbsp; GROWTH</div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="cand-form-col cand-login-col cand-single-page-col">

        {/* Centered Form Body */}
        <div className="cand-login-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <div className="cand-login-form-wrapper" style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
            <div className="cand-step-intro" style={{ marginBottom: '18px' }}>
              <div className="cand-step-indicator">CANDIDATE SIGN IN</div>
              <h2 className="cand-step-title" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Welcome Back</h2>
              <p className="cand-step-subtitle" style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
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
                  padding: '12px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* PASSWORD LOGIN FORM */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                      color: '#09090b',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'underline',
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475467', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#09090b' }}
                  />
                  Remember my credentials
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="cand-btn-primary"
                style={{
                  height: '46px',
                  marginTop: '6px',
                  justifyContent: 'center',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'} <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Registration Redirect */}
            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13.5px', color: '#64748b' }}>
                New to ProXHire?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#09090b',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    textDecoration: 'underline',
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
