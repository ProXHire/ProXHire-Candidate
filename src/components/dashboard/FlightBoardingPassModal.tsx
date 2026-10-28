import React, { useEffect } from 'react'
import { Plane, X } from 'lucide-react'
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
  const isRelativeDate = !application.appliedOn || ['today', 'recently', 'just now', 'yesterday'].includes(application.appliedOn.trim().toLowerCase())
  const initialDate = isRelativeDate ? getFormattedToday() : application.appliedOn.toUpperCase()

  // Dynamic candidate details
  const candidateName = initialCandidateName
  const position = initialPosition
  const company = initialCompany
  const originCity = initialOriginCity
  const destCity = initialDestCity
  const applicationDate = initialDate
  const statusTag = 'SHORTLISTED · INTERVIEW ROUND'
  const bgvTier = 'TIER-1'

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
      </div>
    </div>
  )
}

export default FlightBoardingPassModal
