import React, { useState, useEffect } from 'react'
import {
  Bell,
  Search,
  FileText,
  Send,
  Bookmark,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import type { JobCardData, ApplicationRowData } from '../../types'

export const CandidateDashboard: React.FC = () => {
  const { formData, setViewMode, setStep, isVerified, isCompleted, logout } = useCandidate()
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<JobCardData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Guard dashboard: unverified candidates must complete verification
  useEffect(() => {
    if (!isVerified || !isCompleted) {
      setViewMode('registration')
    }
  }, [isVerified, isCompleted, setViewMode])

  const candidateInitials = formData.fullName
    ? formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  const [jobs, setJobs] = useState<JobCardData[]>([
    {
      id: '1',
      company: 'Infosys',
      companyLogoText: 'infosys',
      role: 'Software Development Engineer',
      location: 'Bangalore, Karnataka',
      workType: 'On-site',
      jobType: 'Full Time',
      experienceLevel: 'Mid Level',
      experienceYears: '3-6 Yrs',
      tags: ['Java', 'Spring Boot', 'Microservices'],
      extraTagsCount: 3,
      postedTime: 'Posted 2 days ago',
      isSaved: false
    },
    {
      id: '2',
      company: 'TCS',
      companyLogoText: 'TATA',
      role: 'Backend Developer',
      location: 'Hyderabad, Telangana',
      workType: 'Hybrid',
      jobType: 'Full Time',
      experienceLevel: 'Mid Level',
      experienceYears: '2-5 Yrs',
      tags: ['Node.js', 'Express.js', 'MongoDB'],
      extraTagsCount: 2,
      postedTime: 'Posted 1 day ago',
      isSaved: true
    },
    {
      id: '3',
      company: 'Accenture',
      companyLogoText: '>',
      role: 'Full Stack Developer',
      location: 'Pune, Maharashtra',
      workType: 'Hybrid',
      jobType: 'Full Time',
      experienceLevel: 'Mid Level',
      experienceYears: '3-7 Yrs',
      tags: ['React', 'Node.js', 'AWS'],
      extraTagsCount: 3,
      postedTime: 'Posted 3 days ago',
      isSaved: false
    }
  ])

  const applications: ApplicationRowData[] = [
    {
      id: '1',
      jobTitle: 'Software Engineer',
      company: 'Infosys',
      appliedOn: '12 Oct 2026',
      status: 'Under Review'
    },
    {
      id: '2',
      jobTitle: 'Backend Developer',
      company: 'TCS',
      appliedOn: '10 Oct 2026',
      status: 'Shortlisted'
    },
    {
      id: '3',
      jobTitle: 'Full Stack Developer',
      company: 'Accenture',
      appliedOn: '05 Oct 2026',
      status: 'Applied'
    }
  ]

  const toggleSaveJob = (id: string) => {
    setJobs(prev =>
      prev.map(j => (j.id === id ? { ...j, isSaved: !j.isSaved } : j))
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafb', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="cand-dash-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div className="cand-brand-row">
            <img
              src="/logo.png"
              alt="ProXHire"
              className="cand-dash-logo"
              style={{
                height: '46px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="cand-dash-nav">
            {['Dashboard', 'Find Jobs', 'Applications', 'Saved Jobs', 'Messages', 'Career Resources'].map(nav => (
              <span
                key={nav}
                className={`cand-dash-link ${activeNav === nav ? 'active' : ''}`}
                onClick={() => setActiveNav(nav)}
              >
                {nav} {nav === 'Career Resources' && <ChevronDown size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />}
              </span>
            ))}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="cand-dash-right-actions">
          <button
            type="button"
            className="cand-dash-icon-btn"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="cand-unread-badge" />
          </button>

          {/* Profile pill */}
          <div
            className="cand-dash-profile-pill"
            onClick={() => {
              setStep(6)
              setViewMode('registration')
            }}
          >
            <div className="cand-dash-avatar">
              {candidateInitials}
            </div>
            <span className="cand-dash-profile-name">
              {formData.fullName || 'Candidate'}
            </span>
            <ChevronDown size={14} color="#71717a" className="cand-dash-chevron" />
          </div>

          <button
            type="button"
            className="cand-dash-icon-btn"
            title="Sign Out"
            onClick={logout}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={17} />
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            className="cand-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Tabs Bar (Visible on mobile/tablet) */}
      <div className="cand-mobile-tabs-container">
        <nav className="cand-mobile-tabs-scroll">
          {['Dashboard', 'Find Jobs', 'Applications', 'Saved Jobs', 'Messages', 'Career Resources'].map(nav => (
            <button
              key={nav}
              type="button"
              className={`cand-mobile-tab-btn ${activeNav === nav ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(nav)
                setIsMobileMenuOpen(false)
              }}
            >
              {nav}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="cand-mobile-drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="cand-mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="cand-drawer-user-card">
              <div className="cand-dash-avatar" style={{ width: '40px', height: '40px', fontSize: '15px' }}>
                {candidateInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.fullName || 'Candidate'}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.email || 'candidate@gmail.com'}
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '9999px' }}>
                75%
              </span>
            </div>

            <div className="cand-drawer-nav-list">
              {[
                { name: 'Dashboard', icon: TrendingUp },
                { name: 'Find Jobs', icon: Search },
                { name: 'Applications', icon: Send },
                { name: 'Saved Jobs', icon: Bookmark },
                { name: 'Career Resources', icon: FileText }
              ].map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`cand-drawer-link ${activeNav === item.name ? 'active' : ''}`}
                    onClick={() => {
                      setActiveNav(item.name)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="cand-drawer-footer">
              <button
                type="button"
                className="cand-btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: '42px', fontSize: '13px' }}
                onClick={() => {
                  setStep(6)
                  setViewMode('registration')
                  setIsMobileMenuOpen(false)
                }}
              >
                Edit Profile Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="cand-dash-main">
        {/* Banner with dark modern architectural background */}
        <div className="cand-banner-hero">
          <div className="cand-banner-left">
            <span className="kicker">WELCOME BACK,</span>
            <h1>{formData.fullName || 'Candidate'}</h1>
            <p>Discover opportunities. Build your future.</p>

            <div className="cand-search-bar">
              <Search size={18} color="#71717a" style={{ flexShrink: 0 }} />
              <input
                type="text"
                className="cand-search-input"
                placeholder="Search jobs by role, skills, company or location"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="cand-search-btn"
                onClick={() => alert(`Searching opportunities for: "${searchQuery || 'Software Engineer'}"`)}
              >
                Search Jobs <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="cand-banner-right">
            <div>
              <div className="explore-label">EXPLORE</div>
              <div className="explore-stat">10,000+</div>
            </div>
            <div className="explore-sub">Job Opportunities Across India</div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="cand-dash-grid">
          {/* Left Column */}
          <div>
            {/* 4 Metric Cards */}
            <div className="cand-stats-grid">
              <div className="cand-stat-card">
                <div className="cand-stat-icon-wrap">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">24</div>
                  <div className="cand-stat-title">Matching Jobs</div>
                  <span className="cand-stat-link">View Jobs →</span>
                </div>
              </div>

              <div className="cand-stat-card">
                <div className="cand-stat-icon-wrap">
                  <Send size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">8</div>
                  <div className="cand-stat-title">Applications</div>
                  <span className="cand-stat-link">Track Status →</span>
                </div>
              </div>

              <div className="cand-stat-card">
                <div className="cand-stat-icon-wrap">
                  <Bookmark size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">12</div>
                  <div className="cand-stat-title">Saved Jobs</div>
                  <span className="cand-stat-link">View Saved →</span>
                </div>
              </div>

              <div className="cand-stat-card">
                <div className="cand-stat-icon-wrap">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">3</div>
                  <div className="cand-stat-title">Interviews</div>
                  <span className="cand-stat-link">View Schedule →</span>
                </div>
              </div>
            </div>

            {/* Recommended Jobs */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Recommended Jobs for You
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                    Based on your profile, skills and preferences
                  </p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}>
                  View All →
                </span>
              </div>

              <div className="cand-job-cards-grid">
                {jobs.map(job => (
                  <div key={job.id} className="cand-job-card">
                    <div>
                      <div className="cand-job-head">
                        <div className="cand-comp-badge">
                          <div className="cand-comp-logo-square">
                            {job.company.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#09090b' }}>
                            {job.company}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSaveJob(job.id)}
                          style={{ color: job.isSaved ? '#000000' : '#a1a1aa' }}
                        >
                          <Bookmark size={18} fill={job.isSaved ? '#000000' : 'none'} />
                        </button>
                      </div>

                      <h4 className="cand-job-role">{job.role}</h4>
                      <div className="cand-job-loc-row">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} /> {job.location}
                        </span>
                        <span>&bull;</span>
                        <span>{job.workType}</span>
                      </div>

                      <div className="cand-job-chips">
                        <span className="cand-chip">{job.jobType}</span>
                        <span className="cand-chip">{job.experienceLevel}</span>
                        <span className="cand-chip">{job.experienceYears}</span>
                      </div>

                      <div className="cand-job-chips" style={{ marginBottom: 0 }}>
                        {job.tags.map(t => (
                          <span key={t} className="cand-chip" style={{ backgroundColor: '#f8fafc', color: '#334155' }}>
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

                    <div className="cand-job-foot">
                      <span>{job.postedTime}</span>
                      <button
                        type="button"
                        className="cand-btn-view-job"
                        onClick={() => setSelectedJob(job)}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications Table */}
            <div className="cand-verify-card cand-apps-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Recent Applications
                  </h3>
                  <span className="cand-table-scroll-hint">
                    Swipe horizontally to view full details
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}>
                  View All →
                </span>
              </div>

              <div className="cand-table-wrap">
                <table className="cand-apps-table" style={{ width: '100%', minWidth: '520px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f3', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>
                    <th style={{ padding: '8px 12px' }}>Job Title</th>
                    <th style={{ padding: '8px 12px' }}>Company</th>
                    <th style={{ padding: '8px 12px' }}>Applied On</th>
                    <th style={{ padding: '8px 12px' }}>Status</th>
                    <th style={{ padding: '8px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f8fafc', fontSize: '13.5px' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: '#09090b' }}>{app.jobTitle}</td>
                      <td style={{ padding: '14px 12px', color: '#475467' }}>{app.company}</td>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>{app.appliedOn}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor:
                              app.status === 'Shortlisted'
                                ? '#ecfdf5'
                                : app.status === 'Applied'
                                ? '#eff6ff'
                                : '#f4f4f5',
                            color:
                              app.status === 'Shortlisted'
                                ? '#059669'
                                : app.status === 'Applied'
                                ? '#2563eb'
                                : '#475467'
                          }}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}>
                          View →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Ring, Quick Actions, Career Resources */}
          <div>
            {/* Complete Your Profile Card */}
            <div className="cand-complete-profile-card">
              <div className="cand-profile-ring-head">
                <div className="cand-progress-ring">
                  75%
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Complete Your Profile
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                    A complete profile gets 3x more views from recruiters.
                  </p>
                </div>
              </div>

              <div className="cand-checklist">
                {[
                  { name: 'Basic Information', done: true },
                  { name: 'Resume', done: true },
                  { name: 'Education Details', done: true },
                  { name: 'Work Experience', done: false },
                  { name: 'Skills', done: true },
                  { name: 'Career Preferences', done: false }
                ].map(item => (
                  <div key={item.name} className="cand-check-item">
                    <div className={`cand-check-dot ${item.done ? 'done' : 'pending'}`}>
                      {item.done && '✓'}
                    </div>
                    <span style={{ color: item.done ? '#09090b' : '#64748b' }}>{item.name}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cand-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setStep(3)
                  setViewMode('registration')
                }}
              >
                Complete Profile →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="cand-complete-profile-card" style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', marginBottom: '16px' }}>
                Quick Actions
              </h4>
              <div className="cand-quick-grid">
                <div
                  className="cand-quick-box"
                  onClick={() => alert('Search top verified job opportunities')}
                >
                  <Search size={20} color="#000000" />
                  <div>
                    <h5>Find Jobs</h5>
                    <p>Explore latest job opportunities →</p>
                  </div>
                </div>

                <div
                  className="cand-quick-box"
                  onClick={() => {
                    setStep(3)
                    setViewMode('registration')
                  }}
                >
                  <FileText size={20} color="#000000" />
                  <div>
                    <h5>Update Resume</h5>
                    <p>Upload or edit your resume →</p>
                  </div>
                </div>

                <div
                  className="cand-quick-box"
                  onClick={() => alert('Viewing your 12 saved positions')}
                >
                  <Bookmark size={20} color="#000000" />
                  <div>
                    <h5>Saved Jobs</h5>
                    <p>View your saved positions →</p>
                  </div>
                </div>

                <div
                  className="cand-quick-box"
                  onClick={() => alert('Viewing 8 submitted applications')}
                >
                  <Send size={20} color="#000000" />
                  <div>
                    <h5>Applications</h5>
                    <p>Track your application status →</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Resources */}
            <div className="cand-complete-profile-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  Career Resources
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}>
                  View All →
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Resume Tips', sub: 'Create a powerful resume', icon: FileText },
                  { title: 'Interview Prep', sub: 'Practice and get prepared', icon: TrendingUp },
                  { title: 'Career Guidance', sub: 'Explore career resources', icon: CheckCircle2 }
                ].map(res => {
                  const Icon = res.icon
                  return (
                    <div
                      key={res.title}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e4e4e7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`Opening resource: ${res.title}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={16} color="#09090b" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>{res.title}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{res.sub}</div>
                        </div>
                      </div>
                      <span style={{ color: '#09090b', fontWeight: 700 }}>→</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* View Job Details Modal */}
      {selectedJob && (
        <div
          className="cand-modal-backdrop"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="cand-modal-dialog"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {selectedJob.company}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', margin: '4px 0' }}>
                  {selectedJob.role}
                </h3>
                <div style={{ fontSize: '13px', color: '#475467' }}>
                  {selectedJob.location} &bull; {selectedJob.workType} &bull; {selectedJob.jobType}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e4e4e7',
                  backgroundColor: '#f4f4f5',
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#475467', lineHeight: 1.5, marginBottom: '20px' }}>
              We are looking for a talented engineer to join our high-impact team. As part of this role, you will design scalable web applications, collaborate directly with product and design leads, and write reliable, clean code.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {selectedJob.tags.map(t => (
                <span key={t} className="cand-chip" style={{ backgroundColor: '#f1f5f9' }}>{t}</span>
              ))}
            </div>

            <div className="cand-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setSelectedJob(null)}>Close</button>
              <button
                type="button"
                className="cand-btn-primary"
                onClick={() => {
                  alert('Application submitted with your pre-verified ProXHire profile!')
                  setSelectedJob(null)
                }}
              >
                1-Click Apply with ProXHire →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
