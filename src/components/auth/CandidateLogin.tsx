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
  Sparkles
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
  const { formData, setViewMode, setStep } = useCandidate()

  // State
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password')
  const [emailOrPhone, setEmailOrPhone] = useState(formData.email || 'sreekumar.student@gmail.com')
  const [password, setPassword] = useState('Password@123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // OTP State
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileNumber, setMobileNumber] = useState(formData.mobileNumber || '98765 43210')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpTimer, setOtpTimer] = useState(30)

  // Loading & Modal State
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitted, setForgotSubmitted] = useState(false)

  // Handle Form Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setViewMode('dashboard')
    }, 600)
  }

  // Handle Google Login
  const handleGoogleLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setViewMode('dashboard')
    }, 600)
  }

  // Handle Send OTP
  const handleSendOtp = () => {
    if (!mobileNumber) return
    setOtpSent(true)
    setOtpTimer(30)
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

          {/* Dynamic Headline & Features */}
          <div className="cand-hero-main">
            <h1 className="cand-hero-title">
              Welcome Back.<br />
              Shape<br />
              <span className="muted-text">Your Career.</span>
            </h1>
            <p className="cand-hero-desc">
              Sign in to access your verified profile, track applications live, and connect with top recruiters across India.
            </p>

            <div className="cand-feature-list">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Verified Profile Advantage',
                  desc: 'Pre-verified credentials get 3x higher interview priority'
                },
                {
                  icon: TrendingUp,
                  title: 'Real-Time Application Tracking',
                  desc: 'Track shortlist progress and interview calls live'
                },
                {
                  icon: Search,
                  title: 'Curated Job Matches',
                  desc: 'Discover high-paying roles matching your exact skills'
                },
                {
                  icon: FileText,
                  title: 'Bank-Grade Data Privacy',
                  desc: 'Your credentials remain encrypted & DPDP compliant'
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

          {/* Footer Signature */}
          <div className="cand-hero-footer">
            <div className="cand-hero-script-tag">
              Shape<br />What's Next
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="cand-form-col cand-login-col cand-single-page-col">
        {/* Top Header bar */}
        <div className="cand-form-header-bar">
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Don't have an account?{' '}
            <a
              href="#register"
              onClick={e => {
                e.preventDefault()
                setStep(1)
                setViewMode('registration')
              }}
              style={{ color: '#09090b', fontWeight: 700, textDecoration: 'underline' }}
            >
              Register
            </a>
          </span>
        </div>

        {/* Form Body */}
        <div className="cand-form-body cand-login-body cand-single-page-body">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Titles */}
            <div className="cand-step-indicator">CANDIDATE SIGN IN</div>
            <h2 className="cand-step-title">Sign In to ProXHire</h2>
            <p className="cand-step-subtitle">
              Enter your registered credentials to access your candidate dashboard.
            </p>

            {/* Login Method Segmented Control */}
            <div className="cand-login-tabs-segmented">
              <button
                type="button"
                className={`cand-login-tab-pill ${loginMethod === 'password' ? 'active' : ''}`}
                onClick={() => setLoginMethod('password')}
              >
                <Mail size={15} />
                <span>Email & Password</span>
              </button>
              <button
                type="button"
                className={`cand-login-tab-pill ${loginMethod === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginMethod('otp')}
              >
                <Phone size={15} />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Password Login Fields */}
            {loginMethod === 'password' && (
              <div className="cand-login-fields-wrap">
                {/* Email Field */}
                <div className="cand-field-group">
                  <label className="cand-field-label">
                    Email ID or Mobile Number <span className="req">*</span>
                  </label>
                  <div className="cand-input-wrapper">
                    <span className="cand-input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      className="cand-input"
                      placeholder="Enter registered email (e.g. sreekumar.student@gmail.com)"
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
                        fontSize: '12px',
                        color: '#475467',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => setShowForgotModal(true)}
                    >
                      Forgot Password?
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
                      style={{ position: 'absolute', right: '12px', color: '#71717a' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <label className="cand-checkbox-label" style={{ margin: '4px 0 12px 0' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span style={{ fontSize: '12.5px', color: '#475467' }}>
                    Remember me for 30 days
                  </span>
                </label>
              </div>
            )}

            {/* Mobile OTP Login Fields */}
            {loginMethod === 'otp' && (
              <div className="cand-login-fields-wrap">
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
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+971">+971 (UAE)</option>
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
                        maxLength={12}
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
                  >
                    Send OTP to Mobile <ArrowRight size={15} />
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
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        value={otpCode}
                        maxLength={6}
                        onChange={e => setOtpCode(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
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
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Divider */}
            <div className="cand-social-divider">
              <span className="cand-social-divider-line" />
              <span className="cand-social-divider-text">or continue with</span>
              <span className="cand-social-divider-line" />
            </div>

            {/* 1-Click Google Sign In */}
            <button
              type="button"
              className="cand-google-login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Trust Assurance Strip */}
            <div className="cand-trust-assurance-grid" style={{ marginTop: '14px', marginBottom: '14px' }}>
              <div className="cand-trust-item">
                <div className="cand-trust-icon-box">
                  <Lock size={15} color="#09090b" />
                </div>
                <div className="cand-trust-text">
                  <h4>256-Bit SSL Encrypted</h4>
                  <p>Credentials protected with bank-grade security.</p>
                </div>
              </div>

              <div className="cand-trust-item">
                <div className="cand-trust-icon-box">
                  <ShieldCheck size={15} color="#09090b" />
                </div>
                <div className="cand-trust-text">
                  <h4>DPDP Act Compliant</h4>
                  <p>Strict Indian data privacy compliance.</p>
                </div>
              </div>

              <div className="cand-trust-item">
                <div className="cand-trust-icon-box">
                  <CheckCircle2 size={15} color="#09090b" />
                </div>
                <div className="cand-trust-text">
                  <h4>Zero Spam Guarantee</h4>
                  <p>Only verified employers view profiles.</p>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="cand-action-footer cand-login-footer">
              <button
                type="button"
                className="cand-btn-back"
                onClick={() => {
                  setStep(1)
                  setViewMode('registration')
                }}
              >
                <ArrowLeft size={16} /> Back to Register
              </button>

              <button
                type="submit"
                className="cand-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In to Account'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="cand-modal-backdrop"
          onClick={() => {
            setShowForgotModal(false)
            setForgotSubmitted(false)
          }}
        >
          <div className="cand-modal-dialog" onClick={e => e.stopPropagation()}>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              Reset Your Password
            </h4>
            <p style={{ fontSize: '13.5px', color: '#475467', lineHeight: 1.5, marginBottom: '16px' }}>
              Enter your registered email address or mobile number. We will send a secure verification code to reset your account password.
            </p>

            {!forgotSubmitted ? (
              <div>
                <div className="cand-input-wrapper" style={{ marginBottom: '16px' }}>
                  <span className="cand-input-icon">
                    <Mail size={16} />
                  </span>
                  <input
                    type="text"
                    className="cand-input"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="cand-btn-back"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cand-btn-primary"
                    onClick={() => {
                      if (forgotEmail) setForgotSubmitted(true)
                    }}
                  >
                    Send Reset Link →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13.5px', marginBottom: '16px' }}>
                  A password reset link has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox.
                </div>
                <button
                  type="button"
                  className="cand-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setShowForgotModal(false)
                    setForgotSubmitted(false)
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
