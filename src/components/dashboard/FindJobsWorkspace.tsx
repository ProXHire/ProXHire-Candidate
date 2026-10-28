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
  X
} from 'lucide-react'
import type { JobCardData, ApplicationRowData } from '../../types'

interface FindJobsWorkspaceProps {
  jobs: JobCardData[]
  applications: ApplicationRowData[]
  onToggleSave: (jobId: string) => void
  onViewJob: (job: JobCardData) => void
  onBackToDashboard: () => void
  onApply: (job: JobCardData) => void
  onGoToSavedJobs?: () => void
}

export const FindJobsWorkspace: React.FC<FindJobsWorkspaceProps> = ({
  jobs,
  applications,
  onToggleSave,
  onViewJob,
  onBackToDashboard,
  onApply,
  onGoToSavedJobs
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all')
  const [selectedExperience, setSelectedExperience] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'role' | 'company'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [appliedToast, setAppliedToast] = useState<string | null>(null)
  const [savedToast, setSavedToast] = useState<string | null>(null)

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const q = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !q ||
          job.role.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.tags.some(t => t.toLowerCase().includes(q))

        const matchesLocation =
          selectedLocation === 'all' ||
          job.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
          (selectedLocation.toLowerCase() === 'bengaluru' && job.location.toLowerCase().includes('bangalore')) ||
          (selectedLocation.toLowerCase() === 'bangalore' && job.location.toLowerCase().includes('bengaluru')) ||
          (selectedLocation.toLowerCase() === 'delhi ncr' &&
            (job.location.toLowerCase().includes('delhi') ||
              job.location.toLowerCase().includes('gurugram') ||
              job.location.toLowerCase().includes('noida')))

        const matchesWorkType =
          selectedWorkType === 'all' ||
          job.workType.toLowerCase() === selectedWorkType.toLowerCase()

        const checkExpMatch = (jobExpYears?: string, jobExpLevel?: string, filterVal: string = 'all') => {
          if (!filterVal || filterVal === 'all') return true
          const filter = filterVal.toLowerCase()
          const expYears = (jobExpYears || '').toLowerCase()
          const expLevel = (jobExpLevel || '').toLowerCase()

          if (expYears.includes(filter) || expLevel.includes(filter)) return true

          const nums = expYears.match(/\d+/g)?.map(Number) || []
          const min = nums.length > 0 ? nums[0] : null
          const max = nums.length > 1 ? nums[1] : (expYears.includes('+') ? 99 : min)

          if (filter === 'fresher') {
            return expLevel.includes('entry') || expYears.includes('0') || (min !== null && min <= 1)
          }

          const targetNum = parseInt(filter, 10)
          if (!isNaN(targetNum)) {
            if (min !== null && max !== null) {
              if (filter.includes('10+') || targetNum >= 10) {
                return max >= 10 || expYears.includes('10+')
              }
              return targetNum >= min && targetNum <= max
            }
          }

          return false
        }

        const matchesExperience = checkExpMatch(job.experienceYears, job.experienceLevel, selectedExperience)

        return matchesSearch && matchesLocation && matchesWorkType && matchesExperience
      })
      .sort((a, b) => {
        if (sortBy === 'role') return a.role.localeCompare(b.role)
        if (sortBy === 'company') return a.company.localeCompare(b.company)
        return 0
      })
  }, [jobs, searchQuery, selectedLocation, selectedWorkType, selectedExperience, sortBy])

  const savedCount = useMemo(() => {
    return jobs.filter(j => j.isSaved).length
  }, [jobs])

  const isJobApplied = (job: JobCardData) => {
    return applications.some(
      a =>
        a.jobTitle.toLowerCase() === job.role.toLowerCase() &&
        a.company.toLowerCase() === job.company.toLowerCase()
    )
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

  const handleToggleSave = (job: JobCardData, e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSave(job.id)
    const nextSaved = !job.isSaved
    setSavedToast(nextSaved ? `Saved "${job.role}" to your Saved Jobs` : `Removed "${job.role}" from Saved Jobs`)
    setTimeout(() => {
      setSavedToast(null)
    }, 3000)
  }

  const activeFilterCount =
    (selectedLocation !== 'all' ? 1 : 0) +
    (selectedWorkType !== 'all' ? 1 : 0) +
    (selectedExperience !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0)

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedLocation('all')
    setSelectedWorkType('all')
    setSelectedExperience('all')
  }

  return (
    <div className="cand-find-workspace">
      {/* Top Breadcrumb & Header Controls */}
      <div className="cand-saved-topbar">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="cand-saved-back-btn"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {onGoToSavedJobs && (
          <button
            type="button"
            onClick={onGoToSavedJobs}
            className="cand-btn-outline-sm"
          >
            <Bookmark size={14} fill="#09090b" /> Saved Jobs ({savedCount})
          </button>
        )}
      </div>

      {/* Hero Banner Header */}
      <div className="cand-saved-hero" style={{ marginBottom: '20px' }}>
        <div className="cand-saved-hero-left">
          <div className="cand-saved-title-row">
            <div className="cand-saved-icon-badge">
              <Search size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="cand-saved-title">Find Jobs</h1>
                <span className="cand-saved-count-pill">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
                </span>
              </div>
              <p className="cand-saved-subtitle">
                Explore curated positions from top verified companies. Filter by role, work mode, and location.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="cand-saved-kpis">
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">{jobs.length}</span>
            <span className="cand-saved-kpi-lbl">Total Openings</span>
          </div>
          <div className="cand-saved-kpi-div" />
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">
              {jobs.filter(j => j.workType === 'Remote' || j.workType === 'Hybrid').length}
            </span>
            <span className="cand-saved-kpi-lbl">Remote / Hybrid</span>
          </div>
          <div className="cand-saved-kpi-div" />
          <div className="cand-saved-kpi-item">
            <span className="cand-saved-kpi-val">
              {new Set(jobs.map(j => j.company)).size}
            </span>
            <span className="cand-saved-kpi-lbl">Companies</span>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {appliedToast && (
        <div className="cand-saved-toast success">
          <CheckCircle2 size={18} color="#059669" />
          <span>{appliedToast}</span>
        </div>
      )}

      {savedToast && (
        <div className="cand-saved-toast neutral">
          <Bookmark size={16} />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="cand-find-filter-card">
        {/* Main Search Bar */}
        <div className="cand-saved-search-box" style={{ maxWidth: '100%', marginBottom: '14px' }}>
          <Search size={16} color="#71717a" />
          <input
            type="text"
            className="cand-saved-search-input"
            placeholder="Search by job title, skill, company name, or technology..."
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

        {/* Secondary Filter Controls Row */}
        <div className="cand-find-filters-row">
          {/* Location Filter */}
          <div className="cand-find-filter-group">
            <span className="cand-find-filter-label">Location:</span>
            <div className="cand-saved-type-tabs">
              {[
                { id: 'all', label: 'All' },
                { id: 'Bengaluru', label: 'Bengaluru' },
                { id: 'Hyderabad', label: 'Hyderabad' },
                { id: 'Pune', label: 'Pune' },
                { id: 'Mumbai', label: 'Mumbai' },
                { id: 'Delhi NCR', label: 'Delhi NCR' }
              ].map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  className={`cand-saved-tab-btn ${selectedLocation.toLowerCase() === loc.id.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(loc.id)}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode Filter */}
          <div className="cand-find-filter-group">
            <span className="cand-find-filter-label">Work Mode:</span>
            <div className="cand-saved-type-tabs">
              {[
                { id: 'all', label: 'All' },
                { id: 'Remote', label: 'Remote' },
                { id: 'Hybrid', label: 'Hybrid' },
                { id: 'On-site', label: 'On-site' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  className={`cand-saved-tab-btn ${selectedWorkType.toLowerCase() === mode.id.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedWorkType(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div className="cand-find-filter-group">
            <span className="cand-find-filter-label">Experience:</span>
            <div className="cand-saved-type-tabs" style={{ flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'Fresher', label: 'Fresher' },
                { id: '1 Year', label: '1 year' },
                { id: '2 Year', label: '2 year' },
                { id: '3 Year', label: '3 Year' },
                { id: '4 Year', label: '4 Year' },
                { id: '5 Year', label: '5 Year' },
                { id: '6 Year', label: '6 Year' },
                { id: '7 Year', label: '7 Year' },
                { id: '8 Year', label: '8 Year' },
                { id: '9 Year', label: '9 Year' },
                { id: '10+ Years', label: '10+ years' }
              ].map(exp => (
                <button
                  key={exp.id}
                  type="button"
                  className={`cand-saved-tab-btn ${selectedExperience.toLowerCase() === exp.id.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setSelectedExperience(exp.id)}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Filter Bar: Sort, View Toggle, and Reset */}
        <div className="cand-find-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="cand-saved-sort-wrap">
              <SlidersHorizontal size={14} color="#71717a" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="cand-saved-select"
                aria-label="Sort jobs"
              >
                <option value="recent">Most Recent</option>
                <option value="role">Role (A-Z)</option>
                <option value="company">Company (A-Z)</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="cand-filter-reset-btn"
                onClick={resetAllFilters}
                style={{ color: '#ef4444', fontWeight: 700 }}
              >
                Clear all filters ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Showing <strong>{filteredJobs.length}</strong> jobs
            </span>
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
      </div>

      {/* Jobs Listing */}
      {filteredJobs.length > 0 ? (
        viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="cand-job-cards-grid" style={{ marginBottom: '40px' }}>
            {filteredJobs.map(job => {
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

                      {/* Bookmark Toggle */}
                      <button
                        type="button"
                        onClick={e => handleToggleSave(job, e)}
                        title={job.isSaved ? 'Remove from saved' : 'Save job'}
                        className="cand-saved-bookmark-btn"
                        style={{ color: job.isSaved ? '#09090b' : '#a1a1aa' }}
                      >
                        <Bookmark
                          size={18}
                          fill={job.isSaved ? '#09090b' : 'none'}
                          color={job.isSaved ? '#09090b' : '#a1a1aa'}
                        />
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
                        <button
                          type="button"
                          className="cand-saved-applied-tag"
                          style={{ cursor: 'pointer', border: '1px solid #a7f3d0' }}
                          onClick={e => {
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
                          className="cand-btn-primary-sm"
                          onClick={e => handleApplyClick(job, e)}
                        >
                          Apply ✈
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
            {filteredJobs.map(job => {
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
                      onClick={e => handleToggleSave(job, e)}
                      title={job.isSaved ? 'Remove from saved' : 'Save job'}
                      className="cand-saved-bookmark-btn"
                    >
                      <Bookmark
                        size={18}
                        fill={job.isSaved ? '#09090b' : 'none'}
                        color={job.isSaved ? '#09090b' : '#a1a1aa'}
                      />
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
                      <button
                        type="button"
                        className="cand-saved-applied-tag"
                        style={{ cursor: 'pointer', border: '1px solid #a7f3d0' }}
                        onClick={e => {
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
                        className="cand-btn-primary-sm"
                        onClick={e => handleApplyClick(job, e)}
                      >
                        Apply ✈
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
            <Search size={30} color="#71717a" />
          </div>
          <h3 className="cand-saved-empty-title">No matching jobs found</h3>
          <p className="cand-saved-empty-desc">
            We couldn't find any positions matching your search or active filter settings. Try
            adjusting your keyword or clearing filters.
          </p>
          <button
            type="button"
            className="cand-btn-primary"
            onClick={resetAllFilters}
            style={{ padding: '10px 24px', fontSize: '13.5px', borderRadius: '10px' }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
