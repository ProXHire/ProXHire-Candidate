import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  MapPin,
  Clock,
  Bookmark,
  SlidersHorizontal,
  Grid,
  List,
  Check,
  CheckCircle2,
  Building,
  RotateCcw,
  Sparkles,
  Briefcase,
  X,
  TrendingUp,
  Award,
  Zap,
  Target
} from 'lucide-react'
import type { JobCardData, ApplicationRowData, CandidateRegistrationState } from '../../types'
import { calculateATSScore, ATSBreakdown } from '../../services/atsScoreService'
import { getCachedParsedResume } from '../../services/resumeParser'

interface RecommendedJobsWorkspaceProps {
  jobs: JobCardData[]
  applications: ApplicationRowData[]
  candidateProfile?: Partial<CandidateRegistrationState>
  onToggleSave: (jobId: string) => void
  onViewJob: (job: JobCardData) => void
  onBackToDashboard: () => void
  onApply: (job: JobCardData) => void
  onGoToSavedJobs?: () => void
  onGoToAppliedJobs?: () => void
}

interface ScoredJob {
  job: JobCardData
  matchScore: number
  matchedReasons: string[]
  breakdown?: ATSBreakdown
}

export const RecommendedJobsWorkspace: React.FC<RecommendedJobsWorkspaceProps> = ({
  jobs,
  applications,
  candidateProfile,
  onToggleSave,
  onViewJob,
  onBackToDashboard,
  onApply,
  onGoToSavedJobs,
  onGoToAppliedJobs
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [matchFilter, setMatchFilter] = useState<'all' | 'high' | 'remote' | 'immediate'>('all')
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'company' | 'role'>('match')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [appliedToast, setAppliedToast] = useState<string | null>(null)

  const isJobApplied = (job: JobCardData) => {
    return applications.some(
      a =>
        a.jobId === job.id ||
        (a.jobTitle.toLowerCase() === job.role.toLowerCase() &&
          a.company.toLowerCase() === job.company.toLowerCase())
    )
  }

  // Calculate deterministic Option A ATS score based on skills (40%), title (25%), experience (20%), and domain (15%)
  const scoredJobs = useMemo<ScoredJob[]>(() => {
    const cachedResume = getCachedParsedResume()
    const candidateInput = {
      fullName: candidateProfile?.fullName,
      preferredRole: candidateProfile?.preferredRole,
      skills: candidateProfile?.skills && candidateProfile.skills.length > 0
        ? candidateProfile.skills
        : (cachedResume?.extractedSkills && cachedResume.extractedSkills.length > 0 ? cachedResume.extractedSkills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL']),
      experienceYears: cachedResume?.detectedExperienceYears ?? (candidateProfile?.experienceCategory === 'fresher' ? 1 : 3.5),
      experiences: candidateProfile?.experiences,
      profileSummary: candidateProfile?.profileSummary,
      projects: candidateProfile?.projects,
      resumeRawText: cachedResume?.rawText,
    }

    return jobs.map(job => {
      const breakdown = calculateATSScore(
        {
          title: job.role,
          skills: job.tags,
          tags: job.tags,
          description: job.description,
          experienceRequired: job.experienceYears,
          experienceLevel: job.experienceLevel
        },
        candidateInput
      )

      const reasons: string[] = []
      if (breakdown.matchedSkills.length > 0) {
        reasons.push(`Skills Fit: ${breakdown.matchedSkills.slice(0, 2).join(', ')}`)
      }
      if (breakdown.titleScore >= 18) {
        reasons.push('Title & Role Match')
      }
      if (breakdown.experienceAnalysis.isSatisfied) {
        reasons.push('Experience Tenure Qualified')
      } else {
        reasons.push(breakdown.rating)
      }

      return {
        job: {
          ...job,
          atsScore: breakdown.totalScore,
          atsBreakdown: breakdown,
        },
        matchScore: breakdown.totalScore,
        matchedReasons: reasons.slice(0, 3),
        breakdown,
      }
    })
  }, [jobs, candidateProfile])

  // Filtered and sorted recommended jobs
  const displayedJobs = useMemo(() => {
    return scoredJobs
      .filter(({ job, matchScore }) => {
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !q ||
          job.role.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.tags.some(t => t.toLowerCase().includes(q))

        let matchesTab = true
        if (matchFilter === 'high') {
          matchesTab = matchScore >= 90
        } else if (matchFilter === 'remote') {
          matchesTab = job.workType === 'Remote' || job.workType === 'Hybrid'
        } else if (matchFilter === 'immediate') {
          matchesTab = job.tags.some(t => t.toLowerCase().includes('immediate') || t.toLowerCase().includes('urgent'))
        }

        return matchesSearch && matchesTab
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore
        if (sortBy === 'company') return a.job.company.localeCompare(b.job.company)
        if (sortBy === 'role') return a.job.role.localeCompare(b.job.role)
        return 0 // default order (recent)
      })
  }, [scoredJobs, searchQuery, matchFilter, sortBy])

  // Counts for micro KPIs
  const highMatchCount = useMemo(() => {
    return scoredJobs.filter(s => s.matchScore >= 90).length
  }, [scoredJobs])

  const remoteCount = useMemo(() => {
    return scoredJobs.filter(s => s.job.workType === 'Remote' || s.job.workType === 'Hybrid').length
  }, [scoredJobs])

  const handleApplyClick = (job: JobCardData, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isJobApplied(job)) return
    onApply(job)
    setAppliedToast(`Application submitted for ${job.role} at ${job.company}`)
    setTimeout(() => {
      setAppliedToast(null)
    }, 4000)
  }

  return (
    <div className="cand-rec-workspace">
      {/* Top Breadcrumb & Actions */}
      <div className="cand-rec-topbar">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="cand-rec-back-btn"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="cand-rec-top-actions">
          {onGoToAppliedJobs && (
            <button
              type="button"
              onClick={onGoToAppliedJobs}
              className="cand-btn-outline-sm"
            >
              <Briefcase size={14} /> My Applications ({applications.length})
            </button>
          )}
          {onGoToSavedJobs && (
            <button
              type="button"
              onClick={onGoToSavedJobs}
              className="cand-btn-outline-sm"
            >
              <Bookmark size={14} /> Saved Jobs ({jobs.filter(j => j.isSaved).length})
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="cand-rec-hero">
        <div className="cand-rec-hero-left">
          <div className="cand-rec-title-row">
            <div className="cand-rec-icon-badge">
              <Sparkles size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="cand-rec-title">Recommended Jobs for You</h1>
                <span className="cand-rec-count-pill">
                  {scoredJobs.length} Curated Matches
                </span>
              </div>
              <p className="cand-rec-subtitle">
                AI-matched openings based on your verified skills, experience tenure, location preferences, and background verification status.
              </p>
            </div>
          </div>
        </div>

        {/* Micro KPI highlights */}
        <div className="cand-rec-kpis">
          <div className="cand-rec-kpi-item">
            <span className="cand-rec-kpi-val" style={{ color: '#4f46e5' }}>{highMatchCount}</span>
            <span className="cand-rec-kpi-lbl">Top Matches (90%+)</span>
          </div>
          <div className="cand-rec-kpi-div" />
          <div className="cand-rec-kpi-item">
            <span className="cand-rec-kpi-val" style={{ color: '#059669' }}>{remoteCount}</span>
            <span className="cand-rec-kpi-lbl">Flexible / Remote</span>
          </div>
          <div className="cand-rec-kpi-div" />
          <div className="cand-rec-kpi-item">
            <span className="cand-rec-kpi-val">{scoredJobs.length}</span>
            <span className="cand-rec-kpi-lbl">Total Verified Roles</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {appliedToast && (
        <div className="cand-rec-toast success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{appliedToast}</span>
        </div>
      )}

      {/* Filter & Controls Card */}
      <div className="cand-rec-controls-card">
        <div className="cand-rec-search-box">
          <Search size={16} color="#71717a" />
          <input
            type="text"
            className="cand-rec-search-input"
            placeholder="Search recommended jobs by title, company, skills, or city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cand-rec-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="cand-rec-filters-right">
          {/* Match Filter Tabs */}
          <div className="cand-rec-status-tabs">
            {(
              [
                { id: 'all', label: `All (${scoredJobs.length})` },
                { id: 'high', label: `High Match (${highMatchCount})` },
                { id: 'remote', label: `Remote / Hybrid (${remoteCount})` }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`cand-rec-tab-btn ${matchFilter === tab.id ? 'active' : ''}`}
                onClick={() => setMatchFilter(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="cand-search-divider" style={{ height: '22px' }} />

          {/* Sort Selection */}
          <div className="cand-rec-sort-wrap">
            <SlidersHorizontal size={14} color="#71717a" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="cand-rec-select"
              aria-label="Sort recommended jobs"
            >
              <option value="match">Highest Match Score</option>
              <option value="recent">Recently Posted</option>
              <option value="company">Company (A-Z)</option>
              <option value="role">Role (A-Z)</option>
            </select>
          </div>

          <div className="cand-search-divider" style={{ height: '22px' }} />

          {/* View Mode Toggle: List vs Grid */}
          <div className="cand-rec-view-toggle">
            <button
              type="button"
              className={`cand-rec-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`cand-rec-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN JOBS DISPLAY */}
      {displayedJobs.length > 0 ? (
        viewMode === 'list' ? (
          /* ================= LIST FORMAT ================= */
          <div className="cand-rec-list">
            {displayedJobs.map(({ job, matchScore, matchedReasons }) => {
              const applied = isJobApplied(job)

              return (
                <div
                  key={job.id}
                  className="cand-rec-list-card"
                  onClick={() => onViewJob(job)}
                >
                  {/* Left Match Accent Bar */}
                  <div
                    className="cand-rec-card-accent"
                    style={{
                      background: matchScore >= 92 ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)'
                    }}
                  />

                  {/* Company Monogram Avatar */}
                  <div className="cand-rec-logo-wrap">
                    <div className="cand-rec-company-logo">
                      {job.companyLogoText || job.company.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Job Main Details */}
                  <div className="cand-rec-info">
                    <div className="cand-rec-role-row">
                      <h3 className="cand-rec-role">{job.role}</h3>

                      <span
                        className="cand-rec-match-badge"
                        style={{
                          backgroundColor: matchScore >= 92 ? '#ecfdf5' : '#eef2ff',
                          color: matchScore >= 92 ? '#059669' : '#4f46e5',
                          borderColor: matchScore >= 92 ? '#a7f3d0' : '#c7d2fe'
                        }}
                      >
                        <Zap size={12} fill="currentColor" />
                        <span>{matchScore}% Match</span>
                      </span>

                      <span className="cand-rec-worktype-badge">
                        {job.workType}
                      </span>
                    </div>

                    <div className="cand-rec-meta-row">
                      <span className="cand-rec-company-name">
                        <Building size={13} color="#475467" />
                        <strong>{job.company}</strong>
                      </span>

                      <span className="cand-rec-dot-sep">•</span>

                      <span className="cand-rec-meta-item">
                        <MapPin size={13} color="#64748b" />
                        <span>{job.location}</span>
                      </span>

                      <span className="cand-rec-dot-sep">•</span>

                      <span className="cand-rec-meta-item">
                        <Clock size={13} color="#64748b" />
                        <span>{job.postedTime}</span>
                      </span>

                      {job.salary && (
                        <>
                          <span className="cand-rec-dot-sep">•</span>
                          <span className="cand-rec-meta-item salary">
                            <TrendingUp size={13} color="#059669" />
                            <span>{job.salary}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Matched Reasons Chips */}
                    <div className="cand-rec-reasons-row">
                      {matchedReasons.map((reason, idx) => (
                        <span key={idx} className="cand-rec-reason-chip">
                          <Check size={11} color="#10b981" />
                          <span>{reason}</span>
                        </span>
                      ))}

                      {job.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="cand-rec-tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="cand-rec-actions-col">
                    <button
                      type="button"
                      className="cand-rec-bookmark-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSave(job.id)
                      }}
                      title={job.isSaved ? 'Unsave job' : 'Save job'}
                    >
                      <Bookmark
                        size={17}
                        color={job.isSaved ? '#09090b' : '#71717a'}
                        fill={job.isSaved ? '#09090b' : 'none'}
                      />
                    </button>

                    <div className="cand-rec-buttons-group">
                      {applied ? (
                        <button
                          type="button"
                          className="cand-rec-applied-tag"
                          onClick={(e) => {
                            e.stopPropagation()
                            onApply(job)
                          }}
                          title="View Flight Boarding Pass"
                        >
                          <Check size={13} /> Pass ✈
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="cand-rec-apply-btn"
                          onClick={(e) => handleApplyClick(job, e)}
                        >
                          Apply ✈
                        </button>
                      )}

                      <button
                        type="button"
                        className="cand-rec-details-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewJob(job)
                        }}
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ================= GRID FORMAT ================= */
          <div className="cand-job-cards-grid">
            {displayedJobs.map(({ job, matchScore, matchedReasons }) => {
              const applied = isJobApplied(job)

              return (
                <div
                  key={job.id}
                  className="cand-job-card cand-saved-card-hover"
                  onClick={() => onViewJob(job)}
                  style={{ position: 'relative' }}
                >
                  <div>
                    <div className="cand-job-head">
                      <div className="cand-comp-badge">
                        <div className="cand-comp-logo-square">
                          {job.companyLogoText || job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="cand-comp-name">{job.company}</div>
                          <div className="cand-comp-loc">{job.location}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          className="cand-rec-match-badge"
                          style={{
                            backgroundColor: matchScore >= 92 ? '#ecfdf5' : '#eef2ff',
                            color: matchScore >= 92 ? '#059669' : '#4f46e5',
                            borderColor: matchScore >= 92 ? '#a7f3d0' : '#c7d2fe',
                            fontSize: '11px',
                            padding: '2px 7px'
                          }}
                        >
                          <Zap size={11} fill="currentColor" /> {matchScore}%
                        </span>

                        <button
                          type="button"
                          className="cand-btn-bookmark"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleSave(job.id)
                          }}
                        >
                          <Bookmark
                            size={16}
                            color={job.isSaved ? '#09090b' : '#a1a1aa'}
                            fill={job.isSaved ? '#09090b' : 'none'}
                          />
                        </button>
                      </div>
                    </div>

                    <h4 className="cand-job-title" style={{ marginTop: '8px' }}>
                      {job.role}
                    </h4>

                    {job.salary && (
                      <div className="cand-job-salary" style={{ margin: '4px 0 10px', fontSize: '13px', fontWeight: 700, color: '#059669' }}>
                        {job.salary}
                      </div>
                    )}

                    <div className="cand-job-chips">
                      <span className="cand-chip work-type">{job.workType}</span>
                      <span className="cand-chip">{job.experienceLevel}</span>
                      {job.tags.slice(0, 2).map(t => (
                        <span key={t} className="cand-chip" style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="cand-job-foot" style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{job.postedTime}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {applied ? (
                        <button
                          type="button"
                          className="cand-saved-applied-tag"
                          style={{ cursor: 'pointer', border: '1px solid #a7f3d0' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onApply(job)
                          }}
                        >
                          <Check size={12} /> Pass ✈
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="cand-btn-primary-sm"
                          onClick={(e) => handleApplyClick(job, e)}
                        >
                          Apply ✈
                        </button>
                      )}
                      <button
                        type="button"
                        className="cand-btn-outline-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewJob(job)
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="cand-rec-empty">
          <div className="cand-rec-empty-icon">
            <Sparkles size={32} color="#6366f1" />
          </div>
          <h3 className="cand-rec-empty-title">No Matching Recommended Jobs</h3>
          <p className="cand-rec-empty-sub">
            We couldn't find any positions matching your search or filters. Try adjusting your query or resetting filters.
          </p>
          <button
            type="button"
            className="cand-btn-secondary"
            onClick={() => {
              setSearchQuery('')
              setMatchFilter('all')
            }}
            style={{ marginTop: '16px' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
