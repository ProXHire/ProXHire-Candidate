import React, { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Search,
  FileText,
  Send,
  Bookmark,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  LogOut,
  SlidersHorizontal,
  User,
  Briefcase,
  ChevronRight,
  Check,
  Sparkles,
  Plane
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import type { JobCardData, ApplicationRowData, ApplicationStatusType } from '../../types'
import { CompleteProfileWorkspace } from './CompleteProfileWorkspace'
import { JobDetailsScreen } from './JobDetailsScreen'
import { SavedJobsWorkspace } from './SavedJobsWorkspace'
import { FindJobsWorkspace } from './FindJobsWorkspace'
import { AppliedJobsWorkspace } from './AppliedJobsWorkspace'
import { RecommendedJobsWorkspace } from './RecommendedJobsWorkspace'
import { subscribeToCandidateJobs, DEFAULT_MOCK_JOBS } from '../../services/candidateJobService'
import { FlightBoardingPassModal } from './FlightBoardingPassModal'
import { CandidateNotificationsDropdown } from './CandidateNotificationsDropdown'
import {
  loadStoredNotifications,
  saveNotifications,
  resetStoredNotifications
} from '../../services/candidateNotificationService'
import type { CandidateNotificationItem } from '../../types'

export const CandidateDashboard: React.FC = () => {
  const { formData, setViewMode, setStep, isVerified, isCompleted, logout } = useCandidate()
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterWorkType, setFilterWorkType] = useState<string>('all')
  const [filterExperience, setFilterExperience] = useState<string>('all')
  const [filterLocation, setFilterLocation] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const [selectedJob, setSelectedJob] = useState<JobCardData | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'career' | 'personal' | 'review'>('profile')

  // Notification state & refs
  const [notifications, setNotifications] = useState<CandidateNotificationItem[]>(loadStoredNotifications)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationDropdownRef = useRef<HTMLDivElement>(null)
  const unreadNotifCount = notifications.filter(n => !n.isRead).length

  // Safety guard: Candidates with uncompleted profile must create their profile first
  useEffect(() => {
    if (!isCompleted) {
      setViewMode('registration')
      setStep(3)
    }
  }, [isCompleted, setViewMode, setStep])

  // Close notifications dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen])

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      saveNotifications(updated)
      return updated
    })
  }

  const handleMarkAllNotifsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }))
      saveNotifications(updated)
      return updated
    })
  }

  const handleDismissNotif = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      saveNotifications(updated)
      return updated
    })
  }

  const handleClearAllNotifs = () => {
    setNotifications([])
    saveNotifications([])
  }

  const handleResetDemoNotifs = () => {
    const reset = resetStoredNotifications()
    setNotifications(reset)
  }

  const handleNotifActionClick = (target: NonNullable<CandidateNotificationItem['actionTarget']>) => {
    setIsNotificationsOpen(false)
    setSelectedJob(null)
    if (target.nav) {
      setActiveNav(target.nav)
    }
    if (target.nav === 'Complete Profile' && target.tab) {
      setProfileInitialTab(target.tab)
    }
  }

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isProfileDropdownOpen])

  const activeFilterCount =
    (filterWorkType !== 'all' ? 1 : 0) +
    (filterExperience !== 'all' ? 1 : 0) +
    (filterLocation !== 'all' ? 1 : 0)

  const resetFilters = () => {
    setFilterWorkType('all')
    setFilterExperience('all')
    setFilterLocation('all')
    setSearchQuery('')
  }

  // Support deep-linking to Complete Profile, Saved Jobs, Applied Jobs, Recommended Jobs, or Find Jobs via URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nav = params.get('nav')
    if (nav === 'profile' || nav === 'Complete Profile') {
      setActiveNav('Complete Profile')
      const tab = params.get('tab') as any
      if (tab) setProfileInitialTab(tab)
    } else if (nav === 'saved' || nav === 'saved-jobs' || nav === 'Saved Jobs') {
      setActiveNav('Saved Jobs')
    } else if (nav === 'applied' || nav === 'applied-jobs' || nav === 'Applied Jobs' || nav === 'applications') {
      setActiveNav('Applied Jobs')
    } else if (nav === 'recommended' || nav === 'recommended-jobs' || nav === 'Recommended Jobs') {
      setActiveNav('Recommended Jobs')
    } else if (nav === 'find' || nav === 'find-jobs' || nav === 'jobs' || nav === 'Find Jobs') {
      setActiveNav('Find Jobs')
    }
  }, [])

  // Dynamic profile completion checklist based on candidate registration & profile data
  const profileChecklist = [
    {
      name: 'Basic Information',
      done: Boolean(formData.fullName && (formData.email || formData.mobileNumber)),
      tab: 'personal' as const
    },
    {
      name: 'Resume & Summary',
      done: Boolean(formData.resumeFileName || formData.resumeUrl || (formData.profileSummary && formData.profileSummary.trim().length > 10)),
      tab: 'profile' as const
    },
    {
      name: 'Education Details',
      done: Boolean(formData.educations && formData.educations.length > 0),
      tab: 'profile' as const
    },
    {
      name: 'Work Experience',
      done: formData.experienceCategory === 'fresher'
        ? Boolean((formData.experiences && formData.experiences.length > 0) || (formData.projects && formData.projects.length > 0))
        : Boolean(formData.experiences && formData.experiences.length > 0),
      tab: 'career' as const
    },
    {
      name: 'Skills & Proficiencies',
      done: Boolean(formData.skills && formData.skills.length > 0),
      tab: 'profile' as const
    },
    {
      name: 'Career Preferences',
      done: Boolean(
        formData.preferredRole ||
        (formData.preferredLocations && formData.preferredLocations.length > 0) ||
        formData.expectedCtc
      ),
      tab: 'career' as const
    }
  ]
  const completedCount = profileChecklist.filter(item => item.done).length
  const profileCompletionPct = Math.round((completedCount / profileChecklist.length) * 100)
  const ringRadius = 27
  const ringStroke = 5
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (profileCompletionPct / 100) * ringCircumference
  const firstPendingItem = profileChecklist.find(item => !item.done)

  // Guard dashboard: unverified candidates must complete verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'dashboard' || params.get('preview') === 'true') return
    if (!isVerified || !isCompleted) {
      setViewMode('registration')
    }
  }, [isVerified, isCompleted, setViewMode])

  const candidateInitials = formData.fullName
    ? formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'C'

  const [jobs, setJobs] = useState<JobCardData[]>(DEFAULT_MOCK_JOBS)

  // Real-time synchronization of Firebase posted jobs
  useEffect(() => {
    const unsubscribe = subscribeToCandidateJobs((liveJobs) => {
      setJobs(liveJobs)
    })
    return () => unsubscribe()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      job.role.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.tags.some(t => t.toLowerCase().includes(q))

    const matchesWorkType =
      filterWorkType === 'all' ||
      job.workType.toLowerCase() === filterWorkType.toLowerCase()

    const checkExperienceMatch = (jobExpYears?: string, jobExpLevel?: string, selectedFilter: string = 'all') => {
      if (!selectedFilter || selectedFilter === 'all') return true
      const filter = selectedFilter.toLowerCase()
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

    const matchesExperience = checkExperienceMatch(job.experienceYears, job.experienceLevel, filterExperience)

    const matchesLocation =
      filterLocation === 'all' ||
      job.location.toLowerCase().includes(filterLocation.toLowerCase()) ||
      (filterLocation.toLowerCase() === 'bengaluru' && job.location.toLowerCase().includes('bangalore')) ||
      (filterLocation.toLowerCase() === 'bangalore' && job.location.toLowerCase().includes('bengaluru')) ||
      (filterLocation.toLowerCase() === 'delhi ncr' && (job.location.toLowerCase().includes('delhi') || job.location.toLowerCase().includes('gurugram') || job.location.toLowerCase().includes('noida')))

    return matchesSearch && matchesWorkType && matchesExperience && matchesLocation
  })

  const INITIAL_APPLICATIONS: ApplicationRowData[] = [
    {
      id: 'app_1',
      jobTitle: 'Software Development Engineer',
      company: 'Infosys',
      location: 'Bangalore, Karnataka',
      appliedOn: '12 Oct 2026',
      status: 'Under Review',
      flightNumber: 'PX-402',
      gate: 'G-01',
      seat: '01A',
      ticketNumber: 'ETKT-9182390123',
      candidateName: formData.fullName || 'Candidate',
      candidateCity: formData.city || 'Bengaluru',
    },
    {
      id: 'app_2',
      jobTitle: 'Backend Developer',
      company: 'TCS',
      location: 'Hyderabad, Telangana',
      appliedOn: '10 Oct 2026',
      status: 'Shortlisted',
      flightNumber: 'PX-714',
      gate: 'G-04',
      seat: '02B',
      ticketNumber: 'ETKT-8849201948',
      candidateName: formData.fullName || 'Candidate',
      candidateCity: formData.city || 'Bengaluru',
    },
    {
      id: 'app_3',
      jobTitle: 'Full Stack Developer',
      company: 'Accenture',
      location: 'Pune, Maharashtra',
      appliedOn: '05 Oct 2026',
      status: 'Submitted',
      flightNumber: 'PX-209',
      gate: 'G-02',
      seat: '03A',
      ticketNumber: 'ETKT-7482910394',
      candidateName: formData.fullName || 'Candidate',
      candidateCity: formData.city || 'Bengaluru',
    }
  ]

  const [applications, setApplications] = useState<ApplicationRowData[]>(() => {
    try {
      const saved = localStorage.getItem('proxhire_candidate_applications')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Ignore
    }
    return INITIAL_APPLICATIONS
  })

  // State to control the Flight Boarding Pass Alert Modal
  const [activeBoardingPass, setActiveBoardingPass] = useState<ApplicationRowData | null>(null)

  const handleApplyToJob = (appliedJob: JobCardData) => {
    const flightNum = `PX-${Math.floor(100 + Math.random() * 899)}`
    const ticketId = `ETKT-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    const d = new Date()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const todayStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    const newApp: ApplicationRowData = {
      id: `app_${Date.now()}`,
      jobId: appliedJob.id,
      jobTitle: appliedJob.role,
      company: appliedJob.company,
      companyLogoText: appliedJob.companyLogoText,
      location: appliedJob.location,
      appliedOn: todayStr,
      appliedAt: new Date().toISOString(),
      status: 'Submitted',
      flightNumber: flightNum,
      seat: '01A',
      gate: `G-0${Math.floor(1 + Math.random() * 8)}`,
      ticketNumber: ticketId,
      salary: appliedJob.salary,
      candidateName: formData.fullName || 'Candidate',
      candidateCity: formData.city || 'Bengaluru',
    }

    setApplications(prev => {
      const updated = [newApp, ...prev.filter(a => !(a.jobTitle === appliedJob.role && a.company === appliedJob.company))]
      try {
        localStorage.setItem('proxhire_candidate_applications', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })

    // Display the Flight Boarding Pass alert modal immediately!
    setActiveBoardingPass(newApp)
  }

  const handleWithdrawApplication = (appId: string) => {
    setApplications(prev => {
      const updated = prev.filter(a => a.id !== appId)
      try {
        localStorage.setItem('proxhire_candidate_applications', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }

  const handleUpdateApplicationStatus = (appId: string, newStatus: ApplicationStatusType) => {
    setApplications(prev => {
      const updated = prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
      try {
        localStorage.setItem('proxhire_candidate_applications', JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }

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
            {['Dashboard', 'Find Jobs', 'Recommended Jobs', 'Saved Jobs', 'Applied Jobs'].map(nav => (
              <span
                key={nav}
                className={`cand-dash-link ${activeNav === nav ? 'active' : ''}`}
                onClick={() => {
                  setSelectedJob(null)
                  setActiveNav(nav)
                }}
              >
                {nav}
              </span>
            ))}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="cand-dash-right-actions">
          {/* Notifications Trigger & Dropdown */}
          <div className="cand-notification-dropdown-wrapper" ref={notificationDropdownRef}>
            <button
              type="button"
              className={`cand-dash-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              title={unreadNotifCount > 0 ? `${unreadNotifCount} unread notifications` : 'Notifications'}
              onClick={() => {
                setIsNotificationsOpen(prev => !prev)
                setIsProfileDropdownOpen(false)
              }}
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && <span className="cand-unread-badge" />}
            </button>

            {isNotificationsOpen && (
              <CandidateNotificationsDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkNotifAsRead}
                onMarkAllAsRead={handleMarkAllNotifsAsRead}
                onDismiss={handleDismissNotif}
                onClearAll={handleClearAllNotifs}
                onResetDemo={handleResetDemoNotifs}
                onActionClick={handleNotifActionClick}
                onClose={() => setIsNotificationsOpen(false)}
              />
            )}
          </div>

          {/* Candidate Profile Pill & Dropdown Menu */}
          <div className="cand-profile-dropdown-wrapper" ref={profileDropdownRef}>
            <div
              className={`cand-dash-profile-pill ${isProfileDropdownOpen ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              title="Candidate Profile Menu"
              onClick={() => {
                setIsProfileDropdownOpen(prev => !prev)
                setIsNotificationsOpen(false)
              }}
              role="button"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
            >
              <div className="cand-dash-avatar">
                {candidateInitials}
              </div>
              <span className="cand-dash-profile-name">
                {formData.fullName || 'Candidate'}
              </span>
              <ChevronDown
                size={14}
                color="#71717a"
                className={`cand-dash-chevron ${isProfileDropdownOpen ? 'rotate' : ''}`}
              />
            </div>

            {/* Candidate Profile Dropdown List */}
            {isProfileDropdownOpen && (
              <div className="cand-profile-menu-dropdown">
                {/* Profile Header & Completion Bar */}
                <div className="cand-profile-menu-header">
                  <div className="cand-profile-menu-user">
                    <div className="cand-dash-avatar" style={{ width: '40px', height: '40px', fontSize: '15px' }}>
                      {candidateInitials}
                    </div>
                    <div className="cand-profile-menu-user-info">
                      <div className="cand-profile-menu-name">
                        {formData.fullName || 'Candidate'}
                      </div>
                      <div className="cand-profile-menu-email">
                        {formData.email || 'candidate@gmail.com'}
                      </div>
                    </div>
                  </div>

                  <div className="cand-profile-menu-completion">
                    <div className="cand-profile-menu-completion-head">
                      <span className="cand-profile-menu-completion-label">Profile Strength</span>
                      <span className="cand-profile-menu-completion-pct">{profileCompletionPct}%</span>
                    </div>
                    <div className="cand-profile-menu-progress-track">
                      <div
                        className="cand-profile-menu-progress-bar"
                        style={{ width: `${profileCompletionPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="cand-profile-menu-divider" />

                {/* Dropdown Options List: My Profile, Saved Jobs, Applied Jobs, Find Jobs */}
                <div className="cand-profile-menu-items">
                  <button
                    type="button"
                    className={`cand-profile-menu-item ${activeNav === 'Complete Profile' ? 'active' : ''}`}
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      setSelectedJob(null)
                      setProfileInitialTab('profile')
                      setActiveNav('Complete Profile')
                    }}
                  >
                    <div className="cand-profile-menu-item-icon">
                      <User size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">My Profile</span>
                      <span className="cand-profile-menu-item-sub">View & complete details</span>
                    </div>
                    <ChevronRight size={14} className="cand-profile-menu-item-arrow" />
                  </button>

                  <button
                    type="button"
                    className={`cand-profile-menu-item ${activeNav === 'Recommended Jobs' ? 'active' : ''}`}
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      setSelectedJob(null)
                      setActiveNav('Recommended Jobs')
                    }}
                  >
                    <div className="cand-profile-menu-item-icon" style={{ color: '#4f46e5', backgroundColor: '#eef2ff' }}>
                      <Sparkles size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">Recommended Jobs</span>
                      <span className="cand-profile-menu-item-sub">Matched to your verified profile</span>
                    </div>
                    <span className="cand-profile-menu-badge highlight" style={{ backgroundColor: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}>
                      Match
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`cand-profile-menu-item ${activeNav === 'Saved Jobs' ? 'active' : ''}`}
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      setSelectedJob(null)
                      setActiveNav('Saved Jobs')
                    }}
                  >
                    <div className="cand-profile-menu-item-icon">
                      <Bookmark size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">Saved Jobs</span>
                      <span className="cand-profile-menu-item-sub">Bookmarked vacancies</span>
                    </div>
                    <span className="cand-profile-menu-badge">
                      {jobs.filter(j => j.isSaved).length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`cand-profile-menu-item ${activeNav === 'Applied Jobs' ? 'active' : ''}`}
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      setSelectedJob(null)
                      setActiveNav('Applied Jobs')
                    }}
                  >
                    <div className="cand-profile-menu-item-icon">
                      <Briefcase size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">Applied Jobs</span>
                      <span className="cand-profile-menu-item-sub">Status & boarding passes</span>
                    </div>
                    <span className="cand-profile-menu-badge highlight">
                      {applications.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`cand-profile-menu-item ${activeNav === 'Find Jobs' ? 'active' : ''}`}
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      setSelectedJob(null)
                      setActiveNav('Find Jobs')
                    }}
                  >
                    <div className="cand-profile-menu-item-icon">
                      <Search size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">Find Jobs</span>
                      <span className="cand-profile-menu-item-sub">Explore verified openings</span>
                    </div>
                  </button>
                </div>

                <div className="cand-profile-menu-divider" />

                {/* Sign Out Action */}
                <div className="cand-profile-menu-footer">
                  <button
                    type="button"
                    className="cand-profile-menu-item cand-profile-menu-logout"
                    onClick={() => {
                      setIsProfileDropdownOpen(false)
                      logout()
                    }}
                  >
                    <div className="cand-profile-menu-item-icon logout">
                      <LogOut size={16} />
                    </div>
                    <div className="cand-profile-menu-item-content">
                      <span className="cand-profile-menu-item-title">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
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
          {['Dashboard', 'Find Jobs', 'Recommended Jobs', 'Saved Jobs', 'Applied Jobs'].map(nav => (
            <button
              key={nav}
              type="button"
              className={`cand-mobile-tab-btn ${activeNav === nav ? 'active' : ''}`}
              onClick={() => {
                setSelectedJob(null)
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
                {profileCompletionPct}%
              </span>
            </div>

            <div className="cand-drawer-nav-list">
              {[
                { name: 'Dashboard', icon: TrendingUp },
                { name: 'Find Jobs', icon: Search },
                { name: 'Recommended Jobs', icon: Sparkles, badge: 'Match' },
                { name: 'Saved Jobs', icon: Bookmark, badge: jobs.filter(j => j.isSaved).length },
                { name: 'Applied Jobs', icon: Briefcase, badge: applications.length },
                {
                  name: 'Notifications',
                  icon: Bell,
                  badge: unreadNotifCount > 0 ? `${unreadNotifCount} new` : undefined,
                  isNotification: true
                }
              ].map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`cand-drawer-link ${activeNav === item.name ? 'active' : ''}`}
                    onClick={() => {
                      if (item.isNotification) {
                        setIsMobileMenuOpen(false)
                        setIsNotificationsOpen(true)
                      } else {
                        setSelectedJob(null)
                        setActiveNav(item.name)
                        setIsMobileMenuOpen(false)
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{item.name}</span>
                    {item.badge && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: item.isNotification ? '#ecfdf5' : item.name === 'Applied Jobs' ? '#ecfdf5' : '#f4f4f5',
                        color: item.isNotification ? '#059669' : item.name === 'Applied Jobs' ? '#059669' : '#52525b',
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}>
                        {item.badge}
                      </span>
                    )}
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
                  setProfileInitialTab('profile')
                  setActiveNav('Complete Profile')
                  setIsMobileMenuOpen(false)
                }}
              >
                Complete Your Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="cand-dash-main">
        {selectedJob ? (
          <JobDetailsScreen
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
            onApply={handleApplyToJob}
            onToggleSave={(jobId) => toggleSaveJob(jobId)}
            candidateName={formData.fullName || 'Candidate'}
            isAlreadyApplied={applications.some(a => a.jobId === selectedJob.id || (a.jobTitle === selectedJob.role && a.company === selectedJob.company))}
            onViewBoardingPass={() => {
              const existing = applications.find(a => a.jobId === selectedJob.id || (a.jobTitle === selectedJob.role && a.company === selectedJob.company))
              if (existing) {
                setActiveBoardingPass(existing)
              } else {
                handleApplyToJob(selectedJob)
              }
            }}
          />
        ) : activeNav === 'Complete Profile' ? (
          <CompleteProfileWorkspace
            onBack={() => setActiveNav('Dashboard')}
            initialTab={profileInitialTab}
          />
        ) : activeNav === 'Recommended Jobs' ? (
          <RecommendedJobsWorkspace
            jobs={jobs}
            applications={applications}
            candidateProfile={formData}
            onToggleSave={(jobId) => toggleSaveJob(jobId)}
            onViewJob={(job) => setSelectedJob(job)}
            onBackToDashboard={() => {
              setSelectedJob(null)
              setActiveNav('Dashboard')
            }}
            onApply={handleApplyToJob}
            onGoToSavedJobs={() => {
              setSelectedJob(null)
              setActiveNav('Saved Jobs')
            }}
            onGoToAppliedJobs={() => {
              setSelectedJob(null)
              setActiveNav('Applied Jobs')
            }}
          />
        ) : activeNav === 'Applied Jobs' ? (
          <AppliedJobsWorkspace
            applications={applications}
            jobs={jobs}
            onViewBoardingPass={(app) => setActiveBoardingPass(app)}
            onViewJob={(job) => setSelectedJob(job)}
            onBrowseJobs={() => {
              setSelectedJob(null)
              setActiveNav('Find Jobs')
            }}
            onBackToDashboard={() => {
              setSelectedJob(null)
              setActiveNav('Dashboard')
            }}
            onWithdrawApplication={handleWithdrawApplication}
            onUpdateStatus={handleUpdateApplicationStatus}
          />
        ) : activeNav === 'Saved Jobs' ? (
          <SavedJobsWorkspace
            jobs={jobs}
            applications={applications}
            onToggleSave={(jobId) => toggleSaveJob(jobId)}
            onViewJob={(job) => setSelectedJob(job)}
            onBrowseJobs={() => {
              setSelectedJob(null)
              setActiveNav('Find Jobs')
            }}
            onApply={handleApplyToJob}
          />
        ) : activeNav === 'Find Jobs' ? (
          <FindJobsWorkspace
            jobs={jobs}
            applications={applications}
            onToggleSave={(jobId) => toggleSaveJob(jobId)}
            onViewJob={(job) => setSelectedJob(job)}
            onBackToDashboard={() => {
              setSelectedJob(null)
              setActiveNav('Dashboard')
            }}
            onGoToSavedJobs={() => {
              setSelectedJob(null)
              setActiveNav('Saved Jobs')
            }}
            onApply={handleApplyToJob}
          />
        ) : (
          <>
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

              <div className="cand-search-divider" />

              {/* Filter Dropdown Popover */}
              <div className="cand-search-filter-wrapper" ref={filterRef}>
                <button
                  type="button"
                  className={`cand-search-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  aria-expanded={isFilterOpen}
                  aria-label="Filter jobs"
                >
                  <SlidersHorizontal size={14} />
                  <span>
                    {filterLocation !== 'all'
                      ? filterLocation
                      : filterWorkType !== 'all'
                      ? filterWorkType
                      : filterExperience !== 'all'
                      ? filterExperience
                      : 'Filter'}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="cand-search-filter-badge">{activeFilterCount}</span>
                  )}
                  <ChevronDown
                    size={13}
                    style={{
                      transform: isFilterOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </button>

                {isFilterOpen && (
                  <div className="cand-search-filter-popover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#09090b' }}>
                        Filter Jobs
                      </div>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          className="cand-filter-reset-btn"
                          onClick={() => {
                            setFilterWorkType('all')
                            setFilterExperience('all')
                            setFilterLocation('all')
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="cand-filter-section-title">Work Mode</div>
                    <div className="cand-filter-pills-row">
                      {[
                        { id: 'all', label: 'All Modes' },
                        { id: 'Remote', label: 'Remote' },
                        { id: 'Hybrid', label: 'Hybrid' },
                        { id: 'On-site', label: 'On-site' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          className={`cand-filter-pill-opt ${filterWorkType.toLowerCase() === mode.id.toLowerCase() ? 'selected' : ''}`}
                          onClick={() => setFilterWorkType(mode.id)}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    <div className="cand-filter-section-title">Experience Level</div>
                    <div className="cand-filter-pills-row">
                      {[
                        { id: 'all', label: 'All Levels' },
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
                          className={`cand-filter-pill-opt ${filterExperience.toLowerCase() === exp.id.toLowerCase() ? 'selected' : ''}`}
                          onClick={() => setFilterExperience(exp.id)}
                        >
                          {exp.label}
                        </button>
                      ))}
                    </div>

                    <div className="cand-filter-section-title">Location</div>
                    <div className="cand-filter-pills-row">
                      {[
                        { id: 'all', label: 'All Locations' },
                        { id: 'Bengaluru', label: 'Bengaluru' },
                        { id: 'Hyderabad', label: 'Hyderabad' },
                        { id: 'Pune', label: 'Pune' },
                        { id: 'Mumbai', label: 'Mumbai' },
                        { id: 'Delhi NCR', label: 'Delhi NCR' }
                      ].map(loc => (
                        <button
                          key={loc.id}
                          type="button"
                          className={`cand-filter-pill-opt ${filterLocation.toLowerCase() === loc.id.toLowerCase() ? 'selected' : ''}`}
                          onClick={() => setFilterLocation(loc.id)}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>

                    <div className="cand-filter-popover-footer">
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {filteredJobs.length} {filteredJobs.length === 1 ? 'job found' : 'jobs found'}
                      </span>
                      <button
                        type="button"
                        className="cand-filter-apply-btn"
                        onClick={() => setIsFilterOpen(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="cand-search-btn"
                onClick={() => {
                  const elem = document.getElementById('recommended-jobs-section')
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Search Jobs <ArrowRight size={14} />
              </button>
            </div>

            {/* Quick Filter Tag Pills below the expanded search bar */}
            <div className="cand-quick-filters-row">
              <span className="cand-quick-filter-label">Quick filter:</span>
              {[
                { label: 'Bengaluru', type: 'loc', value: 'Bengaluru' },
                { label: 'Hyderabad', type: 'loc', value: 'Hyderabad' },
                { label: 'Remote', type: 'work', value: 'Remote' },
                { label: 'Hybrid', type: 'work', value: 'Hybrid' },
                { label: 'On-site', type: 'work', value: 'On-site' },
                { label: 'Senior', type: 'exp', value: 'Senior Level' },
                { label: 'Mid Level', type: 'exp', value: 'Mid Level' },
                { label: 'React', type: 'query', value: 'React' },
                { label: 'Node.js', type: 'query', value: 'Node.js' }
              ].map(item => {
                const isActive =
                  (item.type === 'loc' && filterLocation.toLowerCase() === item.value.toLowerCase()) ||
                  (item.type === 'work' && filterWorkType.toLowerCase() === item.value.toLowerCase()) ||
                  (item.type === 'exp' && filterExperience.toLowerCase() === item.value.toLowerCase()) ||
                  (item.type === 'query' && searchQuery.toLowerCase().includes(item.value.toLowerCase()))

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`cand-quick-filter-tag ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (item.type === 'loc') {
                        setFilterLocation(isActive ? 'all' : item.value)
                      } else if (item.type === 'work') {
                        setFilterWorkType(isActive ? 'all' : item.value)
                      } else if (item.type === 'exp') {
                        setFilterExperience(isActive ? 'all' : item.value)
                      } else if (item.type === 'query') {
                        setSearchQuery(isActive ? '' : item.value)
                      }
                    }}
                  >
                    {item.label}
                  </button>
                )
              })}
              {(searchQuery || filterWorkType !== 'all' || filterExperience !== 'all' || filterLocation !== 'all') && (
                <button
                  type="button"
                  className="cand-quick-filter-tag"
                  style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}
                  onClick={resetFilters}
                >
                  ✕ Clear
                </button>
              )}
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
            {/* 3 Metric Cards */}
            <div className="cand-stats-grid">
              <div
                className="cand-stat-card"
                onClick={() => {
                  setSelectedJob(null)
                  setActiveNav('Recommended Jobs')
                }}
                style={{ cursor: 'pointer' }}
                title="Browse recommended jobs matched to your profile"
              >
                <div className="cand-stat-icon-wrap" style={{ color: '#4f46e5', backgroundColor: '#eef2ff' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">{jobs.length}</div>
                  <div className="cand-stat-title">Recommended Jobs</div>
                  <span className="cand-stat-link">View Matches →</span>
                </div>
              </div>

              <div
                className="cand-stat-card"
                onClick={() => {
                  setSelectedJob(null)
                  setActiveNav('Applied Jobs')
                }}
                style={{ cursor: 'pointer' }}
                title="View your applied jobs"
              >
                <div className="cand-stat-icon-wrap">
                  <Send size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">{applications.length}</div>
                  <div className="cand-stat-title">Applications</div>
                  <span className="cand-stat-link">Track Status →</span>
                </div>
              </div>

              <div
                className="cand-stat-card"
                onClick={() => {
                  setSelectedJob(null)
                  setActiveNav('Saved Jobs')
                }}
                style={{ cursor: 'pointer' }}
                title="View your saved jobs"
              >
                <div className="cand-stat-icon-wrap">
                  <Bookmark size={20} />
                </div>
                <div>
                  <div className="cand-stat-number">{jobs.filter(j => j.isSaved).length}</div>
                  <div className="cand-stat-title">Saved Jobs</div>
                  <span className="cand-stat-link">View Saved →</span>
                </div>
              </div>

              <div
                className="cand-stat-card"
                onClick={() => {
                  if (applications.length > 0) {
                    setActiveBoardingPass(applications[0])
                  } else {
                    setActiveBoardingPass({
                      id: 'bp-preview',
                      jobTitle: formData.preferredRole || 'Senior Full Stack Engineer',
                      company: 'Infosys Technologies',
                      candidateName: formData.fullName || 'Sree Nandini',
                      candidateCity: formData.city || 'Bengaluru',
                      location: (formData.preferredLocations && formData.preferredLocations[0]) || 'Hyderabad',
                      appliedOn: '26 OCT 2026',
                      status: 'Shortlisted',
                      ticketNumber: 'ETKT-9182390123'
                    })
                  }
                }}
                style={{ cursor: 'pointer', border: '1px solid #10b981', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}
                title="View your official ProXHire flight boarding pass"
              >
                <div className="cand-stat-icon-wrap" style={{ color: '#10b981', backgroundColor: '#ecfdf5' }}>
                  <Plane size={20} />
                </div>
                <div>
                  <div className="cand-stat-number" style={{ color: '#047857' }}>Active</div>
                  <div className="cand-stat-title">Boarding Pass</div>
                  <span className="cand-stat-link" style={{ color: '#059669' }}>View Pass ✈</span>
                </div>
              </div>
            </div>

            {/* Recommended Jobs */}
            <div style={{ marginBottom: '28px' }} id="recommended-jobs-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Recommended Jobs for You {filteredJobs.length !== jobs.length && `(${filteredJobs.length})`}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                    Based on your profile, skills and preferences
                  </p>
                </div>
                {(searchQuery || filterWorkType !== 'all' || filterExperience !== 'all' || filterLocation !== 'all') ? (
                  <span
                    style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}
                    onClick={resetFilters}
                  >
                    Clear Filters ✕
                  </span>
                ) : (
                  <span
                    style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedJob(null)
                      setActiveNav('Recommended Jobs')
                    }}
                    title="View all recommended jobs"
                  >
                    View All →
                  </span>
                )}
              </div>

              <div className="cand-job-cards-grid">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {applications.some(a => a.jobId === job.id || (a.jobTitle === job.role && a.company === job.company)) ? (
                            <button
                              type="button"
                              onClick={() => {
                                const found = applications.find(a => a.jobId === job.id || (a.jobTitle === job.role && a.company === job.company))
                                if (found) setActiveBoardingPass(found)
                              }}
                              style={{
                                padding: '5px 11px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Pass ✈
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleApplyToJob(job)
                              }}
                              style={{
                                padding: '5px 11px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                background: '#09090b',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Apply ✈
                            </button>
                          )}
                          <button
                            type="button"
                            className="cand-btn-view-job"
                            onClick={() => setSelectedJob(job)}
                          >
                            Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed #cbd5e1',
                    gridColumn: '1 / -1'
                  }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: '0 0 6px' }}>
                      No matching jobs found
                    </p>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                      Try adjusting your keywords or clearing the active filters
                    </p>
                    <button
                      type="button"
                      className="cand-btn-secondary"
                      onClick={resetFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
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
                <span
                  style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedJob(null)
                    setActiveNav('Applied Jobs')
                  }}
                  title="View all applied jobs"
                >
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
                    <tr
                      key={app.id}
                      style={{ borderBottom: '1px solid #f8fafc', fontSize: '13.5px', cursor: 'pointer' }}
                      onClick={() => setActiveBoardingPass(app)}
                      title="Click to inspect Flight Boarding Pass"
                    >
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: '#09090b' }}>
                        <span>{app.jobTitle}</span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475467' }}>{app.company}</td>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>{app.appliedOn}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor:
                              app.status === 'Shortlisted' || app.status === 'Interview'
                                ? '#ecfdf5'
                                : app.status === 'Under Review'
                                ? '#fef3c7'
                                : app.status === 'Rejected'
                                ? '#fee2e2'
                                : '#eff6ff',
                            color:
                              app.status === 'Shortlisted' || app.status === 'Interview'
                                ? '#059669'
                                : app.status === 'Under Review'
                                ? '#d97706'
                                : app.status === 'Rejected'
                                ? '#dc2626'
                                : '#2563eb'
                          }}
                        >
                          ● {app.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveBoardingPass(app)
                          }}
                          style={{
                            border: '1px solid #e4e4e7',
                            backgroundColor: '#ffffff',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#09090b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Pass ✈
                        </button>
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
                  <svg width="68" height="68" viewBox="0 0 68 68">
                    {/* Background Track Circle */}
                    <circle
                      cx="34"
                      cy="34"
                      r={ringRadius}
                      fill="none"
                      stroke="#e4e4e7"
                      strokeWidth={ringStroke}
                    />
                    {/* Active Progress Circle */}
                    <circle
                      cx="34"
                      cy="34"
                      r={ringRadius}
                      fill="none"
                      stroke="#09090b"
                      strokeWidth={ringStroke}
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                      strokeLinecap="round"
                      style={{
                        transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </svg>
                  <div className="cand-progress-ring-text">
                    {profileCompletionPct}%
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Complete Your Profile
                  </h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                    {profileCompletionPct === 100
                      ? 'Your profile is 100% complete! Recruiter visibility maximized.'
                      : `A complete profile gets 3x more views from recruiters.`}
                  </p>
                </div>
              </div>

              <div className="cand-checklist">
                {profileChecklist.map(item => (
                  <div
                    key={item.name}
                    className="cand-check-item"
                    style={{
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      margin: '0 -6px',
                      transition: 'background-color 0.15s ease'
                    }}
                    onClick={() => {
                      setProfileInitialTab(item.tab)
                      setActiveNav('Complete Profile')
                    }}
                    title={item.done ? `${item.name} completed (click to view)` : `Click to complete ${item.name}`}
                  >
                    <div className={`cand-check-dot ${item.done ? 'done' : 'pending'}`}>
                      {item.done && '✓'}
                    </div>
                    <span
                      style={{
                        color: item.done ? '#09090b' : '#64748b',
                        textDecoration: item.done ? 'none' : 'underline',
                        textUnderlineOffset: '3px',
                        fontWeight: item.done ? 600 : 500
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cand-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setProfileInitialTab(firstPendingItem ? firstPendingItem.tab : 'profile')
                  setActiveNav('Complete Profile')
                }}
              >
                {profileCompletionPct === 100 ? 'View Full Profile →' : 'Complete Profile →'}
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
                    setProfileInitialTab('profile')
                    setActiveNav('Complete Profile')
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
                  onClick={() => {
                    setSelectedJob(null)
                    setActiveNav('Saved Jobs')
                  }}
                  style={{ cursor: 'pointer' }}
                  title="View your saved jobs"
                >
                  <Bookmark size={20} color="#000000" />
                  <div>
                    <h5>Saved Jobs</h5>
                    <p>View your {jobs.filter(j => j.isSaved).length} saved positions →</p>
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
          </>
        )}
      </main>

      {/* Flight Boarding Pass Modal Alert */}
      {activeBoardingPass && (
        <FlightBoardingPassModal
          application={activeBoardingPass}
          onClose={() => setActiveBoardingPass(null)}
          onStatusChange={(newStatus) => {
            setApplications(prev => {
              const updated = prev.map(a => (a.id === activeBoardingPass.id ? { ...a, status: newStatus } : a))
              try {
                localStorage.setItem('proxhire_candidate_applications', JSON.stringify(updated))
              } catch {
                // Ignore
              }
              return updated
            })
            setActiveBoardingPass(prev => (prev ? { ...prev, status: newStatus } : null))
          }}
        />
      )}

    </div>
  )
}
