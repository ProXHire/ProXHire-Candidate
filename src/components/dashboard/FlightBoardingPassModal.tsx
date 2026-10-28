import React, { useEffect, useState } from 'react'
import {
  Plane,
  X,
  Printer,
  Share2,
  Sliders,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import confetti from 'canvas-confetti'
import type { ApplicationRowData, ApplicationStatusType } from '../../types'
import { useCandidate } from '../../context/CandidateContext'
import { BoardingPassTheme, getCityCode, getCityName } from './BoardingPassTheme'

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
  const { formData } = useCandidate()

  // Format today's date nicely: e.g. "28 OCT 2026"
  const getFormattedToday = () => {
    const d = new Date()
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  // 1. DYNAMIC DATA RESOLUTION (Priority: Application > Logged-in Candidate Profile > Fallback)
  const initialCandidateName =
    application.candidateName ||
    formData.fullName ||
    'SREE NANDINI'

  const initialPosition =
    application.jobTitle ||
    formData.preferredRole ||
    'SENIOR FULL STACK ENGINEER'

  const initialCompany =
    application.company ||
    'INFOSYS TECHNOLOGIES'

  const initialOriginCity =
    application.candidateCity ||
    formData.city ||
    'BENGALURU'

  const initialDestCity =
    application.location ||
    (formData.preferredLocations && formData.preferredLocations[0]) ||
    'HYDERABAD'

  const initialStatus = application.status || 'Shortlisted'
  const initialDate = application.appliedOn || getFormattedToday()

  // 2. LIVE INTERACTIVE EDITING STATE (Allows user to customize all fields dynamically!)
  const [candidateName, setCandidateName] = useState(initialCandidateName)
  const [position, setPosition] = useState(initialPosition)
  const [company, setCompany] = useState(initialCompany)
  const [originCity, setOriginCity] = useState(initialOriginCity)
  const [destCity, setDestCity] = useState(initialDestCity)
  const [applicationDate, setApplicationDate] = useState(initialDate)
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus)
  const [statusTag, setStatusTag] = useState<string>('SHORTLISTED · INTERVIEW ROUND')
  const [bgvTier, setBgvTier] = useState<string>('TIER-1')
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#38bdf8', '#6366f1', '#f59e0b', '#ec4899']
      })
    } catch {
      // Ignore
    }
  }, [])

  // Sync status changes
  const handleStatusSelect = (statusName: ApplicationStatusType, tagString: string) => {
    setCurrentStatus(statusName)
    setStatusTag(tagString)
    if (onStatusChange) {
      onStatusChange(statusName)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Check out my verified ProXHire Flight Boarding Pass for ${position} at ${company}! Candidate: ${candidateName} | ETKT: ${application.ticketNumber || 'ETKT-9182390123'}`
      )
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleResetToDefaults = () => {
    setCandidateName(initialCandidateName)
    setPosition(initialPosition)
    setCompany(initialCompany)
    setOriginCity(initialOriginCity)
    setDestCity(initialDestCity)
    setApplicationDate(initialDate)
    setCurrentStatus('Shortlisted')
    setStatusTag('SHORTLISTED · INTERVIEW ROUND')
  }

  return (
    <div className="boarding-modal-backdrop" onClick={onClose}>
      <div
        className="boarding-modal-container"
        style={{ maxWidth: '1020px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Dismiss / Action Bar */}
        <div className="boarding-modal-topbar">
          <div className="boarding-modal-topbar-left">
            <span className="boarding-pill-badge">
              <Plane size={14} className="boarding-plane-icon" /> OFFICIAL FLIGHT BOARDING PASS
            </span>
            <span className="boarding-e-ticket-tag">
              {application.ticketNumber || 'ETKT-9182390123'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className={`boarding-icon-btn ${showCustomizer ? 'active' : ''}`}
              onClick={() => setShowCustomizer(!showCustomizer)}
              title="Customize Boarding Pass Data"
              style={{
                background: showCustomizer ? '#0284c7' : undefined,
                color: showCustomizer ? '#ffffff' : undefined
              }}
            >
              <Sliders size={16} />
              {showCustomizer ? 'Hide Controls' : 'Edit Ticket Data'}
            </button>
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
        <BoardingPassTheme
          data={{
            candidateName,
            position,
            company,
            originCode: getCityCode(originCity, 'BLR'),
            originCity: getCityName(originCity, 'BENGALURU'),
            destCode: getCityCode(destCity, 'HYD'),
            destCity: getCityName(destCity, 'HYDERABAD'),
            applicationDate,
            statusText: statusTag,
            bgvTier,
            ticketNumber: application.ticketNumber || 'ETKT-9182390123',
            qrUrl: 'https://proxhire.in'
          }}
        />

        {/* ===================== DYNAMIC CUSTOMIZATION PANEL ===================== */}
        {showCustomizer && (
          <div className="bp-customizer-panel">
            <div className="bp-customizer-header">
              <span className="bp-customizer-title">
                <Sparkles size={14} /> LIVE BOARDING PASS DATA CUSTOMIZER
              </span>
              <button
                type="button"
                className="cand-btn-ghost cand-btn-xs"
                onClick={handleResetToDefaults}
                style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Reset to Profile Defaults
              </button>
            </div>

            <div className="bp-customizer-grid">
              <div className="bp-input-group">
                <label>Passenger / Username</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  placeholder="e.g. SREE NANDINI"
                />
              </div>

              <div className="bp-input-group">
                <label>Position / Role</label>
                <input
                  type="text"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="e.g. SENIOR FULL STACK ENGINEER"
                />
              </div>

              <div className="bp-input-group">
                <label>Company / Airline Host</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. INFOSYS TECHNOLOGIES"
                />
              </div>

              <div className="bp-input-group">
                <label>Origin City</label>
                <input
                  type="text"
                  value={originCity}
                  onChange={e => setOriginCity(e.target.value)}
                  placeholder="e.g. BENGALURU"
                />
              </div>

              <div className="bp-input-group">
                <label>Destination City</label>
                <input
                  type="text"
                  value={destCity}
                  onChange={e => setDestCity(e.target.value)}
                  placeholder="e.g. HYDERABAD"
                />
              </div>

              <div className="bp-input-group">
                <label>Application Date</label>
                <input
                  type="text"
                  value={applicationDate}
                  onChange={e => setApplicationDate(e.target.value)}
                  placeholder="e.g. 26 OCT 2026"
                />
              </div>

              <div className="bp-input-group">
                <label>Verification Tier</label>
                <select value={bgvTier} onChange={e => setBgvTier(e.target.value)}>
                  <option value="TIER-1">TIER-1 (PRE-VERIFIED)</option>
                  <option value="TIER-2">TIER-2 (KYC VERIFIED)</option>
                  <option value="PRO">PRO TALENT</option>
                  <option value="VERIFIED">VERIFIED CANDIDATE</option>
                </select>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                Select Active Application Stage:
              </label>
              <div className="bp-status-chips">
                <button
                  type="button"
                  className={`bp-status-chip ${statusTag.includes('SHORTLISTED') ? 'active' : ''}`}
                  onClick={() => handleStatusSelect('Shortlisted', 'SHORTLISTED · INTERVIEW ROUND')}
                >
                  <Check size={12} style={{ display: statusTag.includes('SHORTLISTED') ? 'inline' : 'none', marginRight: 4 }} />
                  SHORTLISTED · INTERVIEW ROUND
                </button>
                <button
                  type="button"
                  className={`bp-status-chip ${statusTag.includes('UNDER REVIEW') ? 'active' : ''}`}
                  onClick={() => handleStatusSelect('Under Review', 'UNDER REVIEW · IN TRANSIT')}
                >
                  <Check size={12} style={{ display: statusTag.includes('UNDER REVIEW') ? 'inline' : 'none', marginRight: 4 }} />
                  UNDER REVIEW · IN TRANSIT
                </button>
                <button
                  type="button"
                  className={`bp-status-chip ${statusTag.includes('APPLICATION BOARDED') ? 'active' : ''}`}
                  onClick={() => handleStatusSelect('Submitted', 'APPLICATION BOARDED · GATE OPEN')}
                >
                  <Check size={12} style={{ display: statusTag.includes('APPLICATION BOARDED') ? 'inline' : 'none', marginRight: 4 }} />
                  APPLICATION BOARDED
                </button>
                <button
                  type="button"
                  className={`bp-status-chip ${statusTag.includes('OFFER EXTENDED') ? 'active' : ''}`}
                  onClick={() => handleStatusSelect('Selected', 'OFFER EXTENDED · FINAL GATE')}
                >
                  <Check size={12} style={{ display: statusTag.includes('OFFER EXTENDED') ? 'inline' : 'none', marginRight: 4 }} />
                  OFFER EXTENDED · FINAL GATE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlightBoardingPassModal
