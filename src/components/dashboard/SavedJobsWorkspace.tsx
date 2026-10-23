import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Bookmark,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Grid,
  List,
  Sparkles,
  RotateCcw,
  Building,
  Check,
  TrendingUp,
  Share2
} from 'lucide-react'
import type { JobCardData, ApplicationRowData } from '../../types'

interface SavedJobsWorkspaceProps {
  jobs: JobCardData[]
  applications: ApplicationRowData[]
  onToggleSave: (jobId: string) => void
  onViewJob: (job: JobCardData) => void
  onBrowseJobs: () => void
  onApply: (job: JobCardData) => void
}

export const SavedJobsWorkspace: React.FC<SavedJobsWorkspaceProps> = ({
  jobs,
  applications,
  onToggleSave,
  onViewJob,
  onBrowseJobs,
  onApply
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [workTypeFilter, setWorkTypeFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'On-site'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'role' | 'company'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [undoToast, setUndoToast] = useState<{ id: string; role: string; company: string } | null>(null)
  const [appliedToast, setAppliedToast] = useState<string | null>(null)

  // Filter only saved jobs
  const savedJobs = useMemo(() => {
    return jobs.filter(job => job.isSaved)
  }, [jobs])

  // Filtered and sorted saved jobs
  const displayedJobs = useMemo(() => {
    return savedJobs
      .filter(job => {
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !q ||
          job.role.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.tags.some(t => t.toLowerCase().includes(q))

        const matchesWorkType =
          workTypeFilter === 'all' || job.workType.toLowerCase() === workTypeFilter.toLowerCase()

        return matchesSearch && matchesWorkType
      })
      .sort((a, b) => {
        if (sortBy === 'role') return a.role.localeCompare(b.role)
        if (sortBy === 'company') return a.company.localeCompare(b.company)
        return 0 // default order
      })
  }, [savedJobs, searchQuery, workTypeFilter, sortBy])

  // Quick stats
  const remoteCount = useMemo(() => {
    return savedJobs.filter(j => j.workType === 'Remote' || j.workType === 'Hybrid').length
  }, [savedJobs])

  const isJobApplied = (job: JobCardData) => {
    return applications.some(
      a =>
        a.jobTitle.toLowerCase() === job.role.toLowerCase() &&
        a.company.toLowerCase() === job.company.toLowerCase()
    )
  }

  const handleUnsave = (job: JobCardData, e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSave(job.id)
    setUndoToast({ id: job.id, role: job.role, company: job.company })
    setTimeout(() => {
      setUndoToast(prev => (prev?.id === job.id ? null : prev))
    }, 5000)
  }

  const handleUndo = () => {
    if (undoToast) {
      onToggleSave(undoToast.id)
      setUndoToast(null)
    }
  }

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
    <div className="cand-saved-workspace">
      {/* Top Breadcrumb & Controls */}
      <div className="cand-saved-topbar">
        <button
          type="button"
          onClick={onBrowseJobs}
          className="cand-saved-back-btn"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="cand-saved-top-actions">
          <button
            type="button"
            onClick={onBrowseJobs}
            className="cand-btn-outline-sm"
          >
            <Search size={14} /> Browse More Jobs
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="cand-saved-hero">
        <div className="cand-saved-hero-left">
          <div className="cand-saved-title-row">
            <div className="cand-saved-icon-badge">
              <Bookmark size={20} fill="#ffffff" color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="cand-saved-title">Saved Jobs</h1>
                <span className="cand-saved-count-pill">
                  {savedJobs.length} {savedJobs.length === 1 ? 'Job' : 'Jobs'} Saved
                </span>
              </div>
              <p className="cand-saved-subtitle">
                Track and manage bookmarked positions. Apply when you're ready or review role requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Micro KPI highlights */}
        <div className="cand-saved-kpis">
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">{savedJobs.length}</span>
            <span className="cand-saved-kpi-lbl">Bookmarked</span>
          </div>
          <div className="cand-saved-kpi-div" />
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">{remoteCount}</span>
            <span className="cand-saved-kpi-lbl">Flexible / Remote</span>
          </div>
          <div className="cand-saved-kpi-div" />
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">
              {savedJobs.filter(j => !isJobApplied(j)).length}
            </span>
            <span className="cand-saved-kpi-lbl">Ready to Apply</span>
          </div>
        </div>
      </div>

      {/* Notification Toasts */}
      {appliedToast && (
        <div className="cand-saved-toast success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{appliedToast}</span>
        </div>
      )}

      {undoToast && (
        <div className="cand-saved-toast neutral">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={16} />
            <span>
              Removed <strong>{undoToast.role}</strong> from saved jobs
            </span>
          </div>
          <button type="button" onClick={handleUndo} className="cand-saved-toast-undo">
            <RotateCcw size={13} /> Undo
          </button>
        </div>
      )}

      {/* Main Filter & Search Control Bar */}
      <div className="cand-saved-controls-card">
        <div className="cand-saved-search-box">
          <Search size={16} color="#71717a" />
          <input
            type="text"
            className="cand-saved-search-input"
            placeholder="Search saved jobs by title, company, skills or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="cand-saved-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="cand-saved-filters-right">
          {/* Work Type Tabs */}
          <div className="cand-saved-type-tabs">
            {(['all', 'Remote', 'Hybrid', 'On-site'] as const).map(type => (
              <button
                key={type}
                type="button"
                className={`cand-saved-tab-btn ${workTypeFilter === type ? 'active' : ''}`}
                onClick={() => setWorkTypeFilter(type)}
              >
                {type === 'all' ? 'All Types' : type}
              </button>
            ))}
          </div>

          <div className="cand-search-divider" style={{ height: '22px' }} />

          {/* Sort Selection */}
          <div className="cand-saved-sort-wrap">
            <SlidersHorizontal size={14} color="#71717a" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="cand-saved-select"
              aria-label="Sort saved jobs"
            >
              <option value="recent">Recently Saved</option>
              <option value="role">Role (A-Z)</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>

          <div className="cand-search-divider" style={{ height: '22px' }} />

          {/* Grid / List View Toggle */}
          <div className="cand-saved-view-toggle">
            <button
              type="button"
              className={`cand-saved-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid view"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              className={`cand-saved-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {displayedJobs.length > 0 ? (
        viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="cand-job-cards-grid" style={{ marginBottom: '40px' }}>
            {displayedJobs.map(job => {
              const applied = isJobApplied(job)
              return (
                <div
                  key={job.id}
                  className="cand-job-card cand-saved-card-hover"
                  onClick={() => onViewJob(job)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    {/* Top Company Row */}
                    <div className="cand-job-head">
                      <div className="cand-comp-badge">
                        <div className="cand-comp-logo-square">
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#09090b', display: 'block' }}>
                            {job.company}
                          </span>
                        </div>
                      </div>

                      {/* Saved Bookmark Action */}
                      <button
                        type="button"
                        onClick={e => handleUnsave(job, e)}
                        title="Remove from saved jobs"
                        className="cand-saved-bookmark-btn active"
                      >
                        <Bookmark size={18} fill="#09090b" color="#09090b" />
                      </button>
                    </div>

                    {/* Role Title */}
                    <h4 className="cand-job-role" style={{ marginTop: '4px' }}>
                      {job.role}
                    </h4>

                    {/* Location & Work Type */}
                    <div className="cand-job-loc-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {job.location}
                      </span>
                      <span>&bull;</span>
                      <span
                        className={`cand-worktype-pill ${
                          job.workType === 'Remote'
                            ? 'remote'
                            : job.workType === 'Hybrid'
                            ? 'hybrid'
                            : 'onsite'
                        }`}
                      >
                        {job.workType}
                      </span>
                    </div>

                    {/* Chips for Job Type & Experience */}
                    <div className="cand-job-chips">
                      <span className="cand-chip">{job.jobType}</span>
                      <span className="cand-chip">{job.experienceLevel}</span>
                      <span className="cand-chip">{job.experienceYears}</span>
                    </div>

                    {/* Skills Tags */}
                    <div className="cand-job-chips" style={{ marginBottom: 0 }}>
                      {job.tags.map(t => (
                        <span
                          key={t}
                          className="cand-chip"
                          style={{ backgroundColor: '#f8fafc', color: '#334155' }}
                        >
                          {t}
                        </span>
                      ))}
                      {job.extraTagsCount > 0 && (
                        <span className="cand-chip" style={{ backgroundColor: '#f8fafc', color: '#64748b' }}>
                          +{job.extraTagsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Quick Actions */}
                  <div className="cand-job-foot" style={{ marginTop: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Clock size={12} /> {job.postedTime}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="cand-btn-outline-sm"
                        onClick={e => {
                          e.stopPropagation()
                          onViewJob(job)
                        }}
                      >
                        Details
                      </button>

                      {applied ? (
                        <span className="cand-saved-applied-tag">
                          <Check size={13} /> Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="cand-btn-primary-sm"
                          onClick={e => handleApplyClick(job, e)}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="cand-saved-list-container">
            {displayedJobs.map(job => {
              const applied = isJobApplied(job)
              return (
                <div
                  key={job.id}
                  className="cand-saved-list-row"
                  onClick={() => onViewJob(job)}
                >
                  <div className="cand-saved-list-company">
                    <div className="cand-comp-logo-square" style={{ width: '38px', height: '38px', fontSize: '13px' }}>
                      {job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="cand-saved-list-role">{job.role}</h4>
                      <div className="cand-saved-list-meta">
                        <span style={{ fontWeight: 600, color: '#09090b' }}>{job.company}</span>
                        <span>&bull;</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {job.location}
                        </span>
                        <span>&bull;</span>
                        <span
                          className={`cand-worktype-pill ${
                            job.workType === 'Remote'
                              ? 'remote'
                              : job.workType === 'Hybrid'
                              ? 'hybrid'
                              : 'onsite'
                          }`}
                        >
                          {job.workType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cand-saved-list-tags">
                    {job.tags.slice(0, 3).map(t => (
                      <span key={t} className="cand-chip" style={{ fontSize: '11px', padding: '3px 8px' }}>
                        {t}
                      </span>
                    ))}
                    <span className="cand-chip" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      {job.experienceYears}
                    </span>
                  </div>

                  <div className="cand-saved-list-actions">
                    <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {job.postedTime}
                    </span>

                    <button
                      type="button"
                      onClick={e => handleUnsave(job, e)}
                      title="Remove from saved jobs"
                      className="cand-saved-bookmark-btn active"
                    >
                      <Bookmark size={18} fill="#09090b" color="#09090b" />
                    </button>

                    <button
                      type="button"
                      className="cand-btn-outline-sm"
                      onClick={e => {
                        e.stopPropagation()
                        onViewJob(job)
                      }}
                    >
                      Details
                    </button>

                    {applied ? (
                      <span className="cand-saved-applied-tag">
                        <Check size={13} /> Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="cand-btn-primary-sm"
                        onClick={e => handleApplyClick(job, e)}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* EMPTY STATE */
        <div className="cand-saved-empty-card">
          <div className="cand-saved-empty-icon">
            <Bookmark size={32} color="#71717a" />
          </div>

          {savedJobs.length === 0 ? (
            <>
              <h3 className="cand-saved-empty-title">No saved jobs yet</h3>
              <p className="cand-saved-empty-desc">
                When you discover jobs you're interested in, click the bookmark icon on any job card
                to save them here. You can review them anytime and apply when ready.
              </p>
              <button
                type="button"
                className="cand-btn-primary"
                onClick={onBrowseJobs}
                style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '10px' }}
              >
                Browse Recommended Jobs <ArrowRight size={15} style={{ marginLeft: '6px' }} />
              </button>
            </>
          ) : (
            <>
              <h3 className="cand-saved-empty-title">No matching saved jobs found</h3>
              <p className="cand-saved-empty-desc">
                None of your saved jobs match your current search or filter criteria. Try clearing
                the filters or searching with different keywords.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="cand-btn-secondary"
                  onClick={() => {
                    setSearchQuery('')
                    setWorkTypeFilter('all')
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
