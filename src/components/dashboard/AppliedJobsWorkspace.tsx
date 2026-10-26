import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Briefcase,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Plane,
  SlidersHorizontal,
  Building,
  RotateCcw,
  Trash2,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import type { JobCardData, ApplicationRowData, ApplicationStatusType } from '../../types'

interface AppliedJobsWorkspaceProps {
  applications: ApplicationRowData[]
  jobs: JobCardData[]
  onViewBoardingPass: (application: ApplicationRowData) => void
  onViewJob: (job: JobCardData) => void
  onBrowseJobs: () => void
  onBackToDashboard: () => void
  onWithdrawApplication?: (applicationId: string) => void
  onUpdateStatus?: (applicationId: string, newStatus: ApplicationStatusType) => void
}

export const AppliedJobsWorkspace: React.FC<AppliedJobsWorkspaceProps> = ({
  applications,
  jobs,
  onViewBoardingPass,
  onViewJob,
  onBrowseJobs,
  onBackToDashboard,
  onWithdrawApplication,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatusType>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'company' | 'role' | 'status'>('recent')
  const [withdrawToast, setWithdrawToast] = useState<ApplicationRowData | null>(null)
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null)

  // Status Color & Meta Resolver
  const getStatusMeta = (status: ApplicationStatusType) => {
    switch (status) {
      case 'Shortlisted':
        return {
          bg: '#ecfdf5',
          color: '#059669',
          border: '#a7f3d0',
          dot: '#10b981',
          label: 'Shortlisted',
          stageText: 'Your profile is shortlisted for next technical evaluation'
        }
      case 'Interview':
        return {
          bg: '#eef2ff',
          color: '#4f46e5',
          border: '#c7d2fe',
          dot: '#6366f1',
          label: 'Interview Scheduled',
          stageText: 'Employer has initiated interview scheduling'
        }
      case 'Under Review':
        return {
          bg: '#fffbeb',
          color: '#d97706',
          border: '#fde68a',
          dot: '#f59e0b',
          label: 'Under Review',
          stageText: 'Recruiter is currently reviewing your resume & verified credentials'
        }
      case 'Selected':
      case 'Hired':
        return {
          bg: '#f0fdf4',
          color: '#16a34a',
          border: '#bbf7d0',
          dot: '#22c55e',
          label: 'Offer / Selected',
          stageText: 'Congratulations! Official offer stage initiated'
        }
      case 'Rejected':
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          border: '#fecaca',
          dot: '#ef4444',
          label: 'Not Selected',
          stageText: 'Application closed by hiring team'
        }
      case 'Submitted':
      case 'Applied':
      default:
        return {
          bg: '#eff6ff',
          color: '#2563eb',
          border: '#bfdbfe',
          dot: '#3b82f6',
          label: 'Submitted',
          stageText: 'Application successfully received with Tier-1 Verification'
        }
    }
  }

  // Filter and sort applications
  const displayedApplications = useMemo(() => {
    return applications
      .filter(app => {
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !q ||
          app.jobTitle.toLowerCase().includes(q) ||
          app.company.toLowerCase().includes(q) ||
          (app.location && app.location.toLowerCase().includes(q)) ||
          (app.flightNumber && app.flightNumber.toLowerCase().includes(q)) ||
          (app.ticketNumber && app.ticketNumber.toLowerCase().includes(q))

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'Submitted' && (app.status === 'Submitted' || app.status === 'Applied')) ||
          app.status === statusFilter

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'company') return a.company.localeCompare(b.company)
        if (sortBy === 'role') return a.jobTitle.localeCompare(b.jobTitle)
        if (sortBy === 'status') return a.status.localeCompare(b.status)
        return 0 // default order (recent first)
      })
  }, [applications, searchQuery, statusFilter, sortBy])

  // KPI Calculations
  const underReviewCount = useMemo(() => {
    return applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted' || a.status === 'Applied').length
  }, [applications])

  const shortlistedCount = useMemo(() => {
    return applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length
  }, [applications])

  const selectedCount = useMemo(() => {
    return applications.filter(a => a.status === 'Selected' || a.status === 'Hired').length
  }, [applications])

  // Helper to locate or synthesize JobCardData
  const getJobForApplication = (app: ApplicationRowData): JobCardData => {
    const existing = jobs.find(
      j =>
        (app.jobId && j.id === app.jobId) ||
        (j.role.toLowerCase() === app.jobTitle.toLowerCase() &&
          j.company.toLowerCase() === app.company.toLowerCase())
    )
    if (existing) return existing

    return {
      id: app.jobId || app.id,
      company: app.company,
      companyLogoText: app.companyLogoText || app.company.slice(0, 2).toUpperCase(),
      role: app.jobTitle,
      location: app.location || 'Bengaluru, Karnataka',
      workType: 'Hybrid',
      jobType: 'Full Time',
      experienceLevel: 'Mid-Senior Level',
      experienceYears: '2-5 yrs',
      tags: ['Verified Opening', 'Direct Apply'],
      extraTagsCount: 0,
      postedTime: app.appliedOn || 'Recently',
      isSaved: false,
      salary: app.salary || 'Competitive CTC',
      description: `Application for ${app.jobTitle} position at ${app.company}. ProXHire Boarding Pass ${app.flightNumber || 'PX-402'}. Current status: ${app.status}.`
    }
  }

  const handleCopyTicket = (ticket: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      navigator.clipboard.writeText(ticket)
      setCopiedTicketId(ticket)
      setTimeout(() => setCopiedTicketId(null), 2500)
    } catch {
      // Ignore
    }
  }

  const handleWithdrawClick = (app: ApplicationRowData, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onWithdrawApplication) {
      onWithdrawApplication(app.id)
      setWithdrawToast(app)
      setTimeout(() => {
        setWithdrawToast(prev => (prev?.id === app.id ? null : prev))
      }, 5000)
    }
  }

  return (
    <div className="cand-applied-workspace">
      {/* Top Breadcrumb & Actions */}
      <div className="cand-applied-topbar">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="cand-applied-back-btn"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="cand-applied-top-actions">
          <button
            type="button"
            onClick={onBrowseJobs}
            className="cand-btn-outline-sm"
          >
            <Search size={14} /> Browse More Openings
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="cand-applied-hero">
        <div className="cand-applied-hero-left">
          <div className="cand-applied-title-row">
            <div className="cand-applied-icon-badge">
              <Plane size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="cand-applied-title">Applied Jobs</h1>
                <span className="cand-applied-count-pill">
                  {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                </span>
              </div>
              <p className="cand-applied-subtitle">
                Track your active job applications, real-time recruiter review stages, and flight boarding passes.
              </p>
            </div>
          </div>
        </div>

        {/* Micro KPI highlights */}
        <div className="cand-applied-kpis">
          <div className="cand-applied-kpi-item">
            <span className="cand-applied-kpi-val">{applications.length}</span>
            <span className="cand-applied-kpi-lbl">Total Applied</span>
          </div>
          <div className="cand-applied-kpi-div" />
          <div className="cand-applied-kpi-item">
            <span className="cand-applied-kpi-val" style={{ color: '#d97706' }}>{underReviewCount}</span>
            <span className="cand-applied-kpi-lbl">Under Review</span>
          </div>
          <div className="cand-applied-kpi-div" />
          <div className="cand-applied-kpi-item">
            <span className="cand-applied-kpi-val" style={{ color: '#4f46e5' }}>{shortlistedCount}</span>
            <span className="cand-applied-kpi-lbl">Interview / Shortlist</span>
          </div>
          <div className="cand-applied-kpi-div" />
          <div className="cand-applied-kpi-item">
            <span className="cand-applied-kpi-val" style={{ color: '#059669' }}>{selectedCount}</span>
            <span className="cand-applied-kpi-lbl">Selected / Offers</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {withdrawToast && (
        <div className="cand-applied-toast">
          <AlertCircle size={18} color="#ef4444" />
          <span>
            Application for <strong>{withdrawToast.jobTitle}</strong> at <strong>{withdrawToast.company}</strong> has been withdrawn.
          </span>
        </div>
      )}

      {/* Filter & Search Controls Bar */}
      <div className="cand-applied-controls-card">
        <div className="cand-applied-search-box">
          <Search size={16} color="#71717a" />
          <input
            type="text"
            className="cand-applied-search-input"
            placeholder="Search by job title, company, location, flight or ticket number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cand-applied-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="cand-applied-filters-right">
          {/* Status Tabs */}
          <div className="cand-applied-status-tabs">
            {(
              [
                { id: 'all', label: `All (${applications.length})` },
                { id: 'Under Review', label: 'Under Review' },
                { id: 'Shortlisted', label: 'Shortlisted' },
                { id: 'Interview', label: 'Interview' },
                { id: 'Submitted', label: 'Submitted' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`cand-applied-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cand-search-divider" style={{ height: '22px' }} />

          {/* Sort Selection */}
          <div className="cand-applied-sort-wrap">
            <SlidersHorizontal size={14} color="#71717a" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="cand-applied-select"
              aria-label="Sort applied jobs"
            >
              <option value="recent">Recently Applied</option>
              <option value="company">Company (A-Z)</option>
              <option value="role">Role (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* APPLIED JOBS LIST FORMAT */}
      <div className="cand-applied-list-wrapper">
        {displayedApplications.length > 0 ? (
          <div className="cand-applied-list">
            {displayedApplications.map(app => {
              const statusMeta = getStatusMeta(app.status)
              const matchingJob = getJobForApplication(app)

              return (
                <div
                  key={app.id}
                  className="cand-applied-card"
                  onClick={() => onViewBoardingPass(app)}
                >
                  {/* Left status color bar indicator */}
                  <div
                    className="cand-applied-card-accent"
                    style={{ backgroundColor: statusMeta.dot }}
                  />

                  {/* Company Logo Monogram */}
                  <div className="cand-applied-logo-wrap">
                    <div className="cand-applied-company-logo">
                      {app.companyLogoText || app.company.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Main Job Information Column */}
                  <div className="cand-applied-info">
                    <div className="cand-applied-role-row">
                      <h3 className="cand-applied-role">{app.jobTitle}</h3>

                      <span className="cand-applied-flight-pill" title="Flight Boarding Pass ID">
                        <Plane size={12} />
                        <span>{app.flightNumber || 'PX-402'}</span>
                        {app.seat && <span className="cand-applied-seat-badge">Seat {app.seat}</span>}
                      </span>
                    </div>

                    <div className="cand-applied-meta-row">
                      <span className="cand-applied-company-name">
                        <Building size={13} color="#475467" />
                        <strong>{app.company}</strong>
                      </span>

                      <span className="cand-applied-dot-sep">•</span>

                      <span className="cand-applied-meta-item">
                        <MapPin size={13} color="#64748b" />
                        <span>{app.location || 'Bengaluru, Karnataka'}</span>
                      </span>

                      <span className="cand-applied-dot-sep">•</span>

                      <span className="cand-applied-meta-item">
                        <Clock size={13} color="#64748b" />
                        <span>Applied {app.appliedOn || 'Recently'}</span>
                      </span>

                      {app.salary && (
                        <>
                          <span className="cand-applied-dot-sep">•</span>
                          <span className="cand-applied-meta-item salary">
                            <TrendingUp size={13} color="#059669" />
                            <span>{app.salary}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Ticket number & Review Stage note */}
                    <div className="cand-applied-ticket-row">
                      {app.ticketNumber && (
                        <div
                          className="cand-applied-ticket-code"
                          onClick={(e) => handleCopyTicket(app.ticketNumber!, e)}
                          title="Click to copy e-ticket number"
                        >
                          <span>Ticket: {app.ticketNumber}</span>
                          {copiedTicketId === app.ticketNumber ? (
                            <Check size={12} color="#059669" />
                          ) : (
                            <Copy size={12} color="#71717a" />
                          )}
                        </div>
                      )}

                      <span className="cand-applied-stage-text">
                        {statusMeta.stageText}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Actions Column */}
                  <div className="cand-applied-actions-col">
                    <div
                      className="cand-applied-status-badge"
                      style={{
                        backgroundColor: statusMeta.bg,
                        color: statusMeta.color,
                        borderColor: statusMeta.border
                      }}
                    >
                      <span
                        className="cand-applied-status-dot"
                        style={{ backgroundColor: statusMeta.dot }}
                      />
                      <span>{statusMeta.label}</span>
                    </div>

                    <div className="cand-applied-buttons-group">
                      <button
                        type="button"
                        className="cand-applied-pass-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewBoardingPass(app)
                        }}
                        title="Open interactive Flight Boarding Pass"
                      >
                        <Plane size={13} /> Pass ✈
                      </button>

                      <button
                        type="button"
                        className="cand-applied-details-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewJob(matchingJob)
                        }}
                        title="View complete job requirements"
                      >
                        Details →
                      </button>

                      {onWithdrawApplication && (
                        <button
                          type="button"
                          className="cand-applied-withdraw-btn"
                          onClick={(e) => handleWithdrawClick(app, e)}
                          title="Withdraw Application"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : applications.length === 0 ? (
          /* Empty State: 0 Applications */
          <div className="cand-applied-empty">
            <div className="cand-applied-empty-icon">
              <Plane size={36} color="#4f46e5" />
            </div>
            <h3 className="cand-applied-empty-title">No Job Applications Yet</h3>
            <p className="cand-applied-empty-sub">
              You haven't submitted any job applications yet. Discover verified, pre-screened job openings across top tech employers in Bengaluru.
            </p>
            <button
              type="button"
              className="cand-btn-primary"
              onClick={onBrowseJobs}
              style={{ marginTop: '16px' }}
            >
              Browse & Apply to Jobs →
            </button>
          </div>
        ) : (
          /* Empty State: Search filter yielded 0 results */
          <div className="cand-applied-empty">
            <div className="cand-applied-empty-icon">
              <Search size={32} color="#64748b" />
            </div>
            <h3 className="cand-applied-empty-title">No Matching Applications Found</h3>
            <p className="cand-applied-empty-sub">
              We couldn't find any applied jobs matching "<strong>{searchQuery}</strong>"
              {statusFilter !== 'all' ? ` in status "${statusFilter}"` : ''}.
            </p>
            <button
              type="button"
              className="cand-btn-secondary"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              style={{ marginTop: '16px' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
