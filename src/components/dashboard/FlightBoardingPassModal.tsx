import React, { useEffect, useState } from 'react'
import {
  Plane,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  XCircle,
  FileText,
  Share2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react'
import confetti from 'canvas-confetti'
import type { ApplicationRowData, ApplicationStatusType } from '../../types'

interface FlightBoardingPassModalProps {
  application: ApplicationRowData
  onClose: () => void
  onStatusChange?: (newStatus: ApplicationStatusType) => void
}

export const FlightBoardingPassModal: React.FC<FlightBoardingPassModalProps> = ({
  application,
  onClose,
  onStatusChange
}) => {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatusType>(application.status || 'Submitted')
  const [copiedLink, setCopiedLink] = useState(false)

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
      })
    } catch {
      // Ignore if unavailable
    }
  }, [])

  const handleStatusUpdate = (status: ApplicationStatusType) => {
    setCurrentStatus(status)
    if (onStatusChange) {
      onStatusChange(status)
    }
  }

  // Derive Airport Origin Code from candidate city / location
  const getAirportCode = (city?: string) => {
    if (!city) return 'BLR'
    const c = city.toLowerCase()
    if (c.includes('bengaluru') || c.includes('bangalore')) return 'BLR'
    if (c.includes('mumbai') || c.includes('bombay')) return 'BOM'
    if (c.includes('delhi') || c.includes('noida') || c.includes('gurugram')) return 'DEL'
    if (c.includes('hyderabad')) return 'HYD'
    if (c.includes('pune')) return 'PNQ'
    if (c.includes('chennai') || c.includes('madras')) return 'MAA'
    if (c.includes('kolkata') || c.includes('calcutta')) return 'CCU'
    return c.slice(0, 3).toUpperCase()
  }

  // Derive Destination Code from company name
  const getCompanyCode = (comp: string) => {
    const clean = comp.replace(/[^a-zA-Z]/g, '').toUpperCase()
    return clean.slice(0, 4) || 'CORP'
  }

  const originCode = getAirportCode(application.candidateCity || application.location)
  const destCode = getCompanyCode(application.company)
  const passengerName = (application.candidateName || 'VERIFIED CANDIDATE').toUpperCase()
  const flightCode = application.flightNumber || `PX-${Math.floor(100 + Math.random() * 899)}`
  const gateCode = application.gate || 'G-02'
  const seatCode = application.seat || '01A'
  const ticketNo = application.ticketNumber || `ETKT-${Math.floor(1000000000 + Math.random() * 9000000000)}`
  const appliedDate = application.appliedOn || 'TODAY'

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out my verified ProXHire Boarding Pass for ${application.jobTitle} at ${application.company}! Application ID: ${application.id}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  return (
    <div className="boarding-modal-backdrop" onClick={onClose}>
      <div className="boarding-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Top Dismiss / Action Bar */}
        <div className="boarding-modal-topbar">
          <div className="boarding-modal-topbar-left">
            <span className="boarding-pill-badge">
              <Plane size={14} className="boarding-plane-icon" /> OFFICIAL FLIGHT BOARDING PASS
            </span>
            <span className="boarding-e-ticket-tag">
              {ticketNo}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="boarding-icon-btn"
              onClick={handleShare}
              title="Share Boarding Pass"
            >
              <Share2 size={16} />
              {copiedLink ? 'Copied!' : 'Share'}
            </button>
            <button
              type="button"
              className="boarding-icon-btn"
              onClick={handlePrint}
              title="Print Boarding Pass"
            >
              <Printer size={16} /> Print
            </button>
            <button
              type="button"
              className="boarding-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===================== THE BOARDING PASS TICKET ===================== */}
        <div className="boarding-pass-ticket" id="proxhire-boarding-pass">
          
          {/* LEFT: MAIN PASS BODY (70% width) */}
          <div className="boarding-pass-main">
            
            {/* Airline Header */}
            <div className="boarding-pass-header">
              <div className="boarding-airline-brand">
                <div className="boarding-airline-logo">
                  <Plane size={20} color="#ffffff" style={{ transform: 'rotate(-45deg)' }} />
                </div>
                <div>
                  <div className="boarding-airline-name">PROXHIRE AIRWAYS</div>
                  <div className="boarding-airline-sub">TALENT EXPRESS · TIER-1 VERIFIED HIRING</div>
                </div>
              </div>
              <div className="boarding-class-badge">
                FIRST CLASS · PRIORITY GATE
              </div>
            </div>

            {/* Flight Route Banner */}
            <div className="boarding-route-row">
              <div className="boarding-route-point">
                <div className="boarding-airport-code">{originCode}</div>
                <div className="boarding-airport-name">
                  {application.candidateCity || application.location || 'Bengaluru, IN'}
                </div>
                <div className="boarding-airport-role-tag">Candidate Origin</div>
              </div>

              <div className="boarding-flight-vector">
                <div className="boarding-flight-code-pill">{flightCode}</div>
                <div className="boarding-flight-line">
                  <div className="boarding-flight-line-dot start" />
                  <div className="boarding-flight-plane-bubble">
                    <Plane size={18} color="#2563eb" />
                  </div>
                  <div className="boarding-flight-line-dot end" />
                </div>
                <div className="boarding-flight-duration">DIRECT CAREER TRANSIT</div>
              </div>

              <div className="boarding-route-point right">
                <div className="boarding-airport-code destination">{destCode}</div>
                <div className="boarding-airport-name destination">{application.company}</div>
                <div className="boarding-airport-role-tag">Employer Destination</div>
              </div>
            </div>

            {/* Passenger & Flight Details Grid */}
            {/* Candidate & Application Details Grid */}
            <div className="boarding-details-grid">
              <div className="boarding-data-cell span-2">
                <span className="boarding-label">CANDIDATE NAME</span>
                <span className="boarding-value highlight">{passengerName}</span>
              </div>

              <div className="boarding-data-cell span-2">
                <span className="boarding-label">APPLIED POSITION / ROLE</span>
                <span className="boarding-value highlight">{application.jobTitle.toUpperCase()}</span>
              </div>

              <div className="boarding-data-cell span-2">
                <span className="boarding-label">EMPLOYER / COMPANY</span>
                <span className="boarding-value">{application.company.toUpperCase()}</span>
              </div>

              <div className="boarding-data-cell span-2">
                <span className="boarding-label">LOCATION</span>
                <span className="boarding-value">{(application.location || 'Bengaluru, Karnataka').toUpperCase()}</span>
              </div>

              <div className="boarding-data-cell">
                <span className="boarding-label">APPLICATION DATE</span>
                <span className="boarding-value">{appliedDate.toUpperCase()}</span>
              </div>

              <div className="boarding-data-cell">
                <span className="boarding-label">VERIFICATION TIER</span>
                <span className="boarding-value verified">
                  <ShieldCheck size={14} /> TIER-1 BGV
                </span>
              </div>

              <div className="boarding-data-cell">
                <span className="boarding-label">EXPECTED REVIEW</span>
                <span className="boarding-value">24 - 48 HRS</span>
              </div>

              <div className="boarding-data-cell">
                <span className="boarding-label">STATUS</span>
                <span className={`boarding-status-pill status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                  ● {currentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Application Flight Lifecycle Progression Track */}
            <div className="boarding-lifecycle-box">
              <div className="boarding-lifecycle-header">
                <span className="boarding-lifecycle-title">
                  APPLICATION FLIGHT STATUS & LIFECYCLE
                </span>
                <span className="boarding-lifecycle-sub">
                  Live tracking across hiring milestones
                </span>
              </div>

              <div className="boarding-lifecycle-steps">
                {/* Step 1: Submitted */}
                <div className={`boarding-step-node ${currentStatus === 'Submitted' || currentStatus === 'Applied' || currentStatus === 'Under Review' || currentStatus === 'Shortlisted' || currentStatus === 'Interview' ? 'completed' : ''}`}>
                  <div className="boarding-step-circle">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="boarding-step-label">1. Submitted</div>
                  <div className="boarding-step-desc">Application Boarded</div>
                </div>

                <div className={`boarding-step-connector ${currentStatus === 'Under Review' || currentStatus === 'Shortlisted' || currentStatus === 'Interview' ? 'active' : ''}`} />

                {/* Step 2: Under Review */}
                <div className={`boarding-step-node ${currentStatus === 'Under Review' ? 'current' : currentStatus === 'Shortlisted' || currentStatus === 'Interview' ? 'completed' : ''}`}>
                  <div className="boarding-step-circle">
                    <Clock size={15} />
                  </div>
                  <div className="boarding-step-label">2. Under Review</div>
                  <div className="boarding-step-desc">Next / Active State</div>
                </div>

                <div className={`boarding-step-connector ${currentStatus === 'Shortlisted' || currentStatus === 'Interview' || currentStatus === 'Rejected' ? 'active' : ''}`} />

                {/* Step 3: Decision */}
                <div className={`boarding-step-node ${currentStatus === 'Rejected' ? 'rejected' : currentStatus === 'Shortlisted' || currentStatus === 'Interview' ? 'completed' : 'pending'}`}>
                  <div className="boarding-step-circle">
                    {currentStatus === 'Rejected' ? <XCircle size={15} /> : <Sparkles size={15} />}
                  </div>
                  <div className="boarding-step-label">
                    {currentStatus === 'Rejected' ? '3. Rejected' : '3. Shortlisted'}
                  </div>
                  <div className="boarding-step-desc">
                    {currentStatus === 'Rejected' ? 'Not Selected' : 'Interview Gate'}
                  </div>
                </div>
              </div>

              {/* Status Explanation Banner */}
              <div className={`boarding-status-memo status-memo-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {currentStatus === 'Submitted' || currentStatus === 'Applied' ? (
                  <>
                    <CheckCircle2 size={16} className="boarding-memo-icon" />
                    <div>
                      <strong>Application Boarded & Submitted Successfully!</strong>
                      <p>Your profile is in the flight queue. The next milestone is <strong>Under Review</strong> by {application.company}'s recruitment team. If approved, you will advance to <strong>Interview / Shortlisted</strong>; if not selected, it will reflect as <strong>Rejected</strong>.</p>
                    </div>
                  </>
                ) : currentStatus === 'Under Review' ? (
                  <>
                    <Clock size={16} className="boarding-memo-icon in-review" />
                    <div>
                      <strong>Flight In Transit: Profile Under Review!</strong>
                      <p>The employer has accepted your boarded application and is actively reviewing your verified credentials and past experience. Stay tuned for interview invitations.</p>
                    </div>
                  </>
                ) : currentStatus === 'Rejected' ? (
                  <>
                    <XCircle size={16} className="boarding-memo-icon rejected" />
                    <div>
                      <strong>Flight Diverted: Application Rejected by Employer.</strong>
                      <p>The recruitment team at {application.company} has closed this opening or moved forward with other applicants. Keep applying to matching verified roles!</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="boarding-memo-icon shortlisted" />
                    <div>
                      <strong>Congratulations! Profile Shortlisted for Interview!</strong>
                      <p>{application.company} has accepted your application and scheduled you for the next interview round.</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Footer Notice */}
            <div className="boarding-pass-footer">
              <span>SECURITY NOTICE: PRESENT THIS PASS WITH VALID GOVT PHOTO ID / BGV VERIFIED STATUS</span>
              <span>PROXHIRE INDIA PRIVATE LIMITED</span>
            </div>
          </div>

          {/* PERFORATED DIVIDER WITH NOTCHES */}
          <div className="boarding-perforation">
            <div className="boarding-notch top" />
            <div className="boarding-dashed-line" />
            <div className="boarding-notch bottom" />
          </div>

          {/* RIGHT: PASSENGER BOARDING STUB (30% width) */}
          <div className="boarding-pass-stub">
            <div className="boarding-stub-header">
              <div className="boarding-stub-brand">
                <Plane size={14} /> PROXHIRE
              </div>
              <div className="boarding-stub-title">BOARDING STUB</div>
            </div>

            <div className="boarding-stub-route">
              <span>{originCode}</span>
              <Plane size={12} />
              <span>{destCode}</span>
            </div>

            <div className="boarding-stub-details">
              <div className="boarding-stub-row">
                <span className="stub-lbl">CANDIDATE</span>
                <span className="stub-val">{passengerName.split(' ')[0]} {passengerName.split(' ')[1] || ''}</span>
              </div>

              <div className="boarding-stub-row">
                <span className="stub-lbl">ROLE</span>
                <span className="stub-val truncate">{application.jobTitle}</span>
              </div>

              <div className="boarding-stub-row">
                <span className="stub-lbl">COMPANY</span>
                <span className="stub-val truncate">{application.company}</span>
              </div>

              <div className="boarding-stub-row">
                <span className="stub-lbl">STATUS</span>
                <span className="stub-val bold" style={{ color: '#059669' }}>{currentStatus}</span>
              </div>

              <div className="boarding-stub-row">
                <span className="stub-lbl">DATE</span>
                <span className="stub-val">{appliedDate}</span>
              </div>
            </div>

            {/* High-Fidelity SVG Barcode & QR Stamp */}
            <div className="boarding-barcode-wrap">
              <svg className="boarding-barcode" viewBox="0 0 160 48" preserveAspectRatio="none">
                {/* Simulated varied barcode stripes */}
                <rect x="0" y="0" width="3" height="48" fill="#09090b" />
                <rect x="5" y="0" width="2" height="48" fill="#09090b" />
                <rect x="9" y="0" width="4" height="48" fill="#09090b" />
                <rect x="15" y="0" width="1" height="48" fill="#09090b" />
                <rect x="18" y="0" width="3" height="48" fill="#09090b" />
                <rect x="23" y="0" width="2" height="48" fill="#09090b" />
                <rect x="27" y="0" width="5" height="48" fill="#09090b" />
                <rect x="34" y="0" width="2" height="48" fill="#09090b" />
                <rect x="38" y="0" width="3" height="48" fill="#09090b" />
                <rect x="43" y="0" width="1" height="48" fill="#09090b" />
                <rect x="46" y="0" width="4" height="48" fill="#09090b" />
                <rect x="52" y="0" width="2" height="48" fill="#09090b" />
                <rect x="56" y="0" width="3" height="48" fill="#09090b" />
                <rect x="61" y="0" width="5" height="48" fill="#09090b" />
                <rect x="68" y="0" width="1" height="48" fill="#09090b" />
                <rect x="71" y="0" width="3" height="48" fill="#09090b" />
                <rect x="76" y="0" width="2" height="48" fill="#09090b" />
                <rect x="80" y="0" width="4" height="48" fill="#09090b" />
                <rect x="86" y="0" width="2" height="48" fill="#09090b" />
                <rect x="90" y="0" width="5" height="48" fill="#09090b" />
                <rect x="97" y="0" width="1" height="48" fill="#09090b" />
                <rect x="100" y="0" width="3" height="48" fill="#09090b" />
                <rect x="105" y="0" width="4" height="48" fill="#09090b" />
                <rect x="111" y="0" width="2" height="48" fill="#09090b" />
                <rect x="115" y="0" width="5" height="48" fill="#09090b" />
                <rect x="122" y="0" width="2" height="48" fill="#09090b" />
                <rect x="126" y="0" width="4" height="48" fill="#09090b" />
                <rect x="132" y="0" width="1" height="48" fill="#09090b" />
                <rect x="135" y="0" width="3" height="48" fill="#09090b" />
                <rect x="140" y="0" width="2" height="48" fill="#09090b" />
                <rect x="144" y="0" width="4" height="48" fill="#09090b" />
                <rect x="150" y="0" width="2" height="48" fill="#09090b" />
                <rect x="154" y="0" width="4" height="48" fill="#09090b" />
              </svg>
              <div className="boarding-barcode-number">{ticketNo}</div>
            </div>

            <div className="boarding-stub-footer">
              AUTHENTIC ELECTRONIC PASS
            </div>
          </div>
        </div>

        {/* ===================== STATUS SIMULATOR / CONTROLS ===================== */}
        <div className="boarding-modal-actions">
          <div className="boarding-sim-box">
            <span className="boarding-sim-label">PREVIEW RECRUITER ACTIONS:</span>
            <div className="boarding-sim-buttons">
              <button
                type="button"
                className={`boarding-sim-btn ${currentStatus === 'Submitted' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('Submitted')}
              >
                Submitted
              </button>
              <button
                type="button"
                className={`boarding-sim-btn ${currentStatus === 'Under Review' ? 'active in-review' : ''}`}
                onClick={() => handleStatusUpdate('Under Review')}
              >
                Under Review
              </button>
              <button
                type="button"
                className={`boarding-sim-btn ${currentStatus === 'Shortlisted' ? 'active shortlisted' : ''}`}
                onClick={() => handleStatusUpdate('Shortlisted')}
              >
                Shortlisted
              </button>
              <button
                type="button"
                className={`boarding-sim-btn ${currentStatus === 'Rejected' ? 'active rejected' : ''}`}
                onClick={() => handleStatusUpdate('Rejected')}
              >
                Rejected
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="cand-btn-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '100px' }}
              onClick={onClose}
            >
              Boarding Confirmed <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
