import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export interface BoardingPassData {
  candidateName?: string
  position?: string
  company?: string
  originCode?: string
  originCity?: string
  destCode?: string
  destCity?: string
  applicationDate?: string
  statusText?: string
  statusColor?: string
  bgvTier?: string
  ticketNumber?: string
  flightCode?: string
  qrUrl?: string
}

interface BoardingPassThemeProps {
  data?: BoardingPassData
  className?: string
  scale?: number
}

// Derive a 3-letter IATA-style code from city or location
export function getCityCode(city?: string, fallback = 'BLR'): string {
  if (!city) return fallback
  const c = city.toLowerCase()
  if (c.includes('bengaluru') || c.includes('bangalore')) return 'BLR'
  if (c.includes('hyderabad')) return 'HYD'
  if (c.includes('mumbai') || c.includes('bombay')) return 'BOM'
  if (c.includes('delhi') || c.includes('noida') || c.includes('gurgaon') || c.includes('gurugram')) return 'DEL'
  if (c.includes('pune')) return 'PNQ'
  if (c.includes('chennai') || c.includes('madras')) return 'MAA'
  if (c.includes('kolkata') || c.includes('calcutta')) return 'CCU'
  if (c.includes('kochi') || c.includes('cochin')) return 'COK'
  if (c.includes('ahmedabad')) return 'AMD'
  return c.replace(/[^a-z]/g, '').slice(0, 3).toUpperCase() || fallback
}

// Clean city name formatting
export function getCityName(city?: string, fallback = 'BENGALURU'): string {
  if (!city) return fallback
  const cleaned = city.split(',')[0].trim().toUpperCase()
  return cleaned || fallback
}

export const BoardingPassTheme: React.FC<BoardingPassThemeProps> = ({
  data = {},
  className = '',
  scale = 1
}) => {
  // Dynamic fields with authentic defaults from the reference boarding pass
  const candidateName = (data.candidateName || 'SREE NANDINI').toUpperCase()
  const position = (data.position || 'SENIOR FULL STACK ENGINEER').toUpperCase()
  const company = (data.company || 'INFOSYS TECHNOLOGIES').toUpperCase()
  const originCode = (data.originCode || getCityCode(data.originCity, 'BLR')).toUpperCase()
  const originCity = (data.originCity ? getCityName(data.originCity) : 'BENGALURU').toUpperCase()
  const destCode = (data.destCode || getCityCode(data.destCity, 'HYD')).toUpperCase()
  const destCity = (data.destCity ? getCityName(data.destCity) : 'HYDERABAD').toUpperCase()
  const applicationDate = (data.applicationDate || '26 OCT 2026').toUpperCase()
  const statusText = (data.statusText || 'SHORTLISTED · INTERVIEW ROUND').toUpperCase()
  const bgvTier = (data.bgvTier || 'TIER-1').toUpperCase()
  const ticketNumber = data.ticketNumber || 'ETKT-9182390123'
  const qrTargetUrl = data.qrUrl || 'https://proxhire.in'

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    QRCode.toDataURL(qrTargetUrl, {
      margin: 1,
      width: 280,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#09090b',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) setQrCodeDataUrl(url)
      })
      .catch(err => {
        console.error('Failed to generate QR code:', err)
      })
    return () => {
      isMounted = false
    }
  }, [qrTargetUrl])

  return (
    <div
      className={`bp-theme-wrapper ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center'
      }}
    >
      <div className="bp-card" id="boarding-pass-print-area">
        {/* Left Side Semi-Circle Edge Notch */}
        <div className="bp-outer-notch bp-outer-notch-left" />

        {/* ======================================================== */}
        {/* 1. MAIN BOARDING TICKET SECTION (LEFT ~70%)              */}
        {/* ======================================================== */}
        <div className="bp-main">
          {/* Top Angled Dark Ribbon ("BOARDING TICKET") */}
          <div className="bp-top-ribbon">
            <span className="bp-ribbon-text">BOARDING TICKET</span>
          </div>

          {/* Header Row: Logo & Brand */}
          <div className="bp-header">
            <div className="bp-brand">
              {/* Laurel Wreath Crest with Shield & "X" */}
              <div className="bp-crest-icon">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Laurel Leaves Left */}
                  <path d="M12 28C10 24 10 18 15 14C14 17 15 21 17 23" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M10 21C8 18 9 13 13 10C13 13 14 16 16 18" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M14 34C11 31 10 26 13 22" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M18 38C15 36 13 32 15 28" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Outer Laurel Leaves Right */}
                  <path d="M36 28C38 24 38 18 33 14C34 17 33 21 31 23" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M38 21C40 18 39 13 35 10C35 13 34 16 32 18" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M34 34C37 31 38 26 35 22" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M30 38C33 36 35 32 33 28" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Shield Body */}
                  <path d="M24 8L31 11V22C31 28.5 27.5 34.5 24 37C20.5 34.5 17 28.5 17 22V11L24 8Z" fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
                  {/* Crown accent on top */}
                  <path d="M20 7L22 9L24 6L26 9L28 7L27 10H21L20 7Z" fill="#0f172a" />
                  {/* Emerald Letter "X" inside shield */}
                  <path d="M21 16L27 26M27 16L21 26" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="bp-brand-info">
                <div className="bp-brand-title">
                  Pro<span className="bp-brand-x">X</span>Hire
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Identity Row */}
          <div className="bp-passenger-row">
            <div className="bp-passenger-meta">
              <h1 className="bp-candidate-name">{candidateName}</h1>
              <div className="bp-candidate-position">{position}</div>
              <div className="bp-candidate-company">{company}</div>
            </div>
          </div>

          {/* Flight Route Trajectory Row: BLR ➔ HYD */}
          <div className="bp-route-row">
            {/* Origin Airport */}
            <div className="bp-city-block bp-origin">
              <span className="bp-airport-code">{originCode}</span>
              <span className="bp-city-name">({originCity})</span>
            </div>

            {/* Curved Flight Path Arc */}
            <div className="bp-flight-arc-container">
              <svg className="bp-flight-svg" viewBox="0 0 320 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Start Point Dot */}
                <circle cx="8" cy="40" r="4.5" fill="#0f172a" />
                {/* Curved Dotted Flight Arc */}
                <path
                  d="M 12 38 Q 160 -10 304 38"
                  stroke="#0f172a"
                  strokeWidth="2.2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                {/* Airplane Arrowhead leading into destination */}
                <polygon points="314,40 298,32 304,39 298,46" fill="#0f172a" />
              </svg>
              <div className="bp-transit-tag">CAREER TRANSIT FLIGHT</div>
            </div>

            {/* Destination Airport */}
            <div className="bp-city-block bp-destination">
              <span className="bp-airport-code">{destCode}</span>
              <span className="bp-city-name">({destCity})</span>
            </div>
          </div>

          {/* Bottom Row: Application Date */}
          <div className="bp-bottom-row">
            <div className="bp-date-block">
              <span className="bp-date-label">APPLICATION DATE</span>
              <span className="bp-date-value">{applicationDate}</span>
            </div>
          </div>

          {/* Bottom Slate Accent Line */}
          <div className="bp-bottom-slate-bar" />
        </div>

        {/* ======================================================== */}
        {/* 2. PERFORATED TEAR LINE WITH NOTCHES                     */}
        {/* ======================================================== */}
        <div className="bp-perforation-divider">
          <div className="bp-tear-notch bp-tear-notch-top" />
          <div className="bp-dashed-line" />
          <div className="bp-tear-notch bp-tear-notch-bottom" />
        </div>

        {/* ======================================================== */}
        {/* 3. RIGHT STUB: PASSENGER SECTION (DARK NAVY ~30%)        */}
        {/* ======================================================== */}
        <div className="bp-stub">
          {/* Header */}
          <div className="bp-stub-header">
            <span className="bp-stub-title">PASSENGER SECTION</span>
          </div>

          {/* Candidate Dynamic Details */}
          <div className="bp-stub-passenger">
            <h2 className="bp-stub-candidate-name">{candidateName}</h2>
            <div className="bp-stub-position">{position}</div>
            <div className="bp-stub-company">{company}</div>
          </div>

          {/* Authentic Scannable 2D QR Code linked to https://proxhire.in */}
          <div className="bp-codes-row">
            <a
              href={qrTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-code-card bp-qrcode-card"
              title={`Scan with phone camera or click to visit official website: ${qrTargetUrl}`}
              style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`Official ProXHire Verification QR Code - ${qrTargetUrl}`}
                  className="bp-qrcode-img"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: '4px' }}
                />
              ) : (
                /* Pure SVG fallback encoding https://proxhire.in */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 27 27"
                  className="bp-qrcode-svg"
                  shapeRendering="crispEdges"
                >
                  <path fill="#ffffff" d="M0 0h27v27H0z"/>
                  <path stroke="#09090b" d="M1 1.5h7m2 0h1m3 0h1m2 0h1m1 0h7M1 2.5h1m5 0h1m3 0h1m1 0h1m2 0h1m2 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h2m1 0h2m1 0h1m1 0h1m1 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m1 0h3m1 0h3m3 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m4 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m1 0h1m2 0h1m1 0h4m1 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 8.5h1m6 0h2M1 9.5h1m1 0h5m3 0h1m4 0h1m2 0h5M1 10.5h2m1 0h1m3 0h1m3 0h3m2 0h2m1 0h1m3 0h1M1 11.5h3m3 0h2m1 0h1m2 0h4m2 0h1m2 0h1m1 0h2M3 12.5h2m1 0h1m1 0h3m1 0h1m1 0h1m10 0h1M1 13.5h1m2 0h1m2 0h1m3 0h1m1 0h1m1 0h7m1 0h3M1 14.5h5m2 0h3m6 0h1m2 0h1m1 0h1m1 0h1M1 15.5h1m1 0h6m3 0h2m2 0h3m1 0h3m1 0h2M1 16.5h1m1 0h2m3 0h2m2 0h1m2 0h2m1 0h1m1 0h2m3 0h1M1 17.5h1m1 0h1m1 0h1m1 0h2m3 0h1m4 0h5m1 0h1M9 18.5h2m2 0h5m3 0h2M1 19.5h7m2 0h1m3 0h2m1 0h1m1 0h1m1 0h1m1 0h3M1 20.5h1m5 0h1m1 0h2m2 0h2m2 0h1m3 0h2m1 0h1M1 21.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m1 0h1m1 0h1M1 22.5h1m1 0h3m1 0h1m1 0h2m5 0h1m1 0h2m1 0h5M1 23.5h1m1 0h3m1 0h1m1 0h2m1 0h2m2 0h3m3 0h2m1 0h1M1 24.5h1m5 0h1m2 0h1m1 0h1m2 0h3m2 0h3m2 0h1M1 25.5h7m1 0h1m2 0h1m6 0h7"/>
                </svg>
              )}
            </a>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <a
              href={qrTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '9px',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              SCAN TO VISIT PROXHIRE.IN ↗
            </a>
          </div>

          {/* Electronic Ticket Number */}
          <div className="bp-stub-ticket-no">
            {ticketNumber}
          </div>
        </div>

        {/* Right Side Semi-Circle Edge Notch */}
        <div className="bp-outer-notch bp-outer-notch-right" />
      </div>
    </div>
  )
}

export default BoardingPassTheme
