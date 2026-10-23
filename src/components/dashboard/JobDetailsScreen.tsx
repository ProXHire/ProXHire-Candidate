import React, { useState } from 'react'
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Briefcase,
  Award,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Bookmark,
  Sparkles,
  Calendar,
  Users,
  Globe,
  FileText,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import type { JobCardData } from '../../types'

interface JobDetailsScreenProps {
  job: JobCardData
  onBack: () => void
  onApply?: (job: JobCardData) => void
  onToggleSave?: (jobId: string) => void
  candidateName?: string
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({
  job,
  onBack,
  onApply,
  onToggleSave,
  candidateName = 'Candidate'
}) => {
  const [isSaved, setIsSaved] = useState(Boolean(job.isSaved))
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplySuccess, setShowApplySuccess] = useState(false)
  const [copyNotice, setCopyNotice] = useState(false)

  // Dynamic salary computation if not directly present
  const salaryRange =
    job.experienceLevel === 'Senior Level'
      ? '₹24 - ₹32 LPA'
      : job.experienceLevel === 'Mid Level'
      ? '₹16 - ₹24 LPA'
      : '₹8 - ₹14 LPA'

  // Dynamic company description & data
  const getCompanyDetails = (company: string) => {
    const compLower = company.toLowerCase()
    if (compLower.includes('infosys')) {
      return {
        about: 'Infosys is a global leader in next-generation digital services and consulting. With over 300,000+ employees worldwide, Infosys empowers clients in more than 56 countries to navigate their enterprise digital transformation.',
        size: '100,000+ employees',
        industry: 'Information Technology & Cloud Services',
        founded: '1981',
        headquarters: 'Bengaluru, Karnataka, India',
        website: 'https://www.infosys.com'
      }
    }
    if (compLower.includes('tcs') || compLower.includes('tata')) {
      return {
        about: 'Tata Consultancy Services is an IT services, consulting and business solutions organization that has partnered with many of the world’s largest businesses for more than 50 years, pioneering technology-led business transformations.',
        size: '100,000+ employees',
        industry: 'IT Services & Software Consulting',
        founded: '1968',
        headquarters: 'Mumbai, Maharashtra, India',
        website: 'https://www.tcs.com'
      }
    }
    if (compLower.includes('accenture')) {
      return {
        about: 'Accenture is a leading global professional services company, providing a broad range of services in strategy and consulting, interactive, technology and operations, with digital capabilities across all industries.',
        size: '100,000+ employees',
        industry: 'Management Consulting & Technology',
        founded: '1989',
        headquarters: 'Dublin, Ireland / Global Hubs',
        website: 'https://www.accenture.com'
      }
    }
    if (compLower.includes('razorpay')) {
      return {
        about: 'Razorpay is India’s first full-stack financial solutions company, empowering millions of businesses with payments gateway, automated payroll, corporate banking, and neo-banking credit solutions.',
        size: '1,000 - 5,000 employees',
        industry: 'Fintech & Digital Banking',
        founded: '2014',
        headquarters: 'Bengaluru, Karnataka, India',
        website: 'https://razorpay.com'
      }
    }
    if (compLower.includes('swiggy')) {
      return {
        about: 'Swiggy is India’s leading on-demand convenience platform, dedicated to elevating quality of life for urban consumers with unmatched tech-enabled food and quick-commerce delivery services.',
        size: '5,000 - 10,000 employees',
        industry: 'Consumer Internet & Logistics Tech',
        founded: '2014',
        headquarters: 'Bengaluru, Karnataka, India',
        website: 'https://www.swiggy.com'
      }
    }
    return {
      about: `${company} is a forward-thinking technology company committed to driving industry innovation and building modern, reliable software solutions for global customers.`,
      size: '500 - 5,000 employees',
      industry: 'Enterprise Software & Technology',
      founded: '2016',
      headquarters: job.location,
      website: `https://www.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    }
  }

  const companyInfo = getCompanyDetails(job.company)

  // Key responsibilities specific to role
  const responsibilities = [
    `Lead the architecture, development, and deployment of scalable ${job.role} capabilities.`,
    'Collaborate closely with product management, UX design, and QA engineers to define requirements and sprint deliverables.',
    `Write resilient, clean, and maintainable code adhering to industry best practices in ${job.tags.slice(0, 2).join(' & ')}.`,
    'Identify system bottlenecks, profile latency, and optimize end-to-end database query performance and API response times.',
    'Participate actively in architectural reviews, automated test suite expansions, and continuous deployment workflows.',
    'Mentor junior developers and participate in code reviews to elevate team-wide engineering craftsmanship.'
  ]

  // Key eligibility requirements
  const requirements = [
    `Bachelor’s or Master’s degree in Computer Science, Software Engineering, or equivalent practical experience.`,
    `${job.experienceYears} of proven hands-on software development experience with modern engineering standards.`,
    `Strong proficiency in ${job.tags.join(', ')} and modern application architecture patterns.`,
    'Solid understanding of RESTful API design, relational/NoSQL datastores, and cloud deployment environments.',
    'Experience working with containerized services (Docker/Kubernetes) and automated CI/CD deployment pipelines.',
    'Excellent analytical, communication, and collaborative problem-solving capabilities.'
  ]

  // Hiring rounds timeline
  const hiringRounds = [
    {
      step: 1,
      title: 'Verified Profile Screening',
      duration: 'Within 24 Hours',
      desc: 'ProXHire automatically verifies your credentials and fast-tracks your profile directly to the hiring manager.'
    },
    {
      step: 2,
      title: 'Technical & Coding Assessment',
      duration: '60 Minutes',
      desc: 'Hands-on problem solving and algorithmic reasoning challenge centered on real-world engineering tasks.'
    },
    {
      step: 3,
      title: 'System Design & Architecture',
      duration: '45 Minutes',
      desc: 'Deep-dive conversation with an Engineering Lead on scalability, microservices, and database modeling.'
    },
    {
      step: 4,
      title: 'Techno-Managerial & Team Fit',
      duration: '30 Minutes',
      desc: 'Discussion on team culture, engineering values, mentorship, and ownership of deliverables.'
    },
    {
      step: 5,
      title: 'Offer Letter & Onboarding',
      duration: 'Within 48 Hours',
      desc: 'Formal offer rollout, compensation finalization, and background verification signoff.'
    }
  ]

  // Employee perks & benefits
  const perks = [
    { title: 'Competitive CTC + Bonus', desc: 'Market-leading base compensation with annual performance bonus' },
    { title: 'Health & Term Insurance', desc: 'Comprehensive medical coverage for you and your dependents' },
    { title: 'Flexible Work Culture', desc: `${job.workType} flexibility with ergonomic home-office stipend` },
    { title: 'Learning Allowance', desc: '₹50,000 annual budget for technical certifications and conferences' },
    { title: 'Wellness & Time Off', desc: '24 annual paid leaves, wellness days, and parental benefits' },
    { title: 'Career Acceleration', desc: 'Structured internal promotions and fast-track leadership tracks' }
  ]

  const handleApplyClick = () => {
    setHasApplied(true)
    setShowApplySuccess(true)
    if (onApply) onApply(job)
  }

  const handleToggleSave = () => {
    setIsSaved(!isSaved)
    if (onToggleSave) onToggleSave(job.id)
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopyNotice(true)
      setTimeout(() => setCopyNotice(false), 3000)
    } else {
      alert(`Job link for ${job.role} at ${job.company} copied to clipboard!`)
    }
  }

  return (
    <div className="cand-job-screen">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="cand-job-screen-nav">
        <button
          type="button"
          className="cand-job-back-btn"
          onClick={onBack}
          aria-label="Back to jobs dashboard"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="cand-job-screen-breadcrumbs">
          <span onClick={onBack} style={{ cursor: 'pointer' }}>Dashboard</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span onClick={onBack} style={{ cursor: 'pointer' }}>Jobs</span>
          <ChevronRight size={14} color="#94a3b8" />
          <span className="current">{job.role}</span>
        </div>

        <div className="cand-job-nav-actions">
          <button
            type="button"
            className="cand-job-action-icon-btn"
            onClick={handleShare}
            title="Share Opportunity"
          >
            <Share2 size={16} />
            <span className="cand-job-action-label">{copyNotice ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            className={`cand-job-action-icon-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleToggleSave}
            title={isSaved ? 'Saved to Bookmarks' : 'Save Job'}
          >
            <Bookmark size={16} fill={isSaved ? '#09090b' : 'none'} />
            <span className="cand-job-action-label">{isSaved ? 'Saved' : 'Save Job'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Company & Role Overview */}
      <div className="cand-job-hero-card">
        <div className="cand-job-hero-left">
          <div className="cand-job-company-logo">
            {job.companyLogoText || job.company.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="cand-job-employer-badge">
              <span className="cand-job-company-name">{job.company}</span>
              <span className="cand-job-verified-pill">
                <ShieldCheck size={13} /> ProXHire Verified Employer
              </span>
            </div>
            <h1 className="cand-job-hero-title">{job.role}</h1>

            <div className="cand-job-meta-row">
              <span className="cand-job-meta-item">
                <MapPin size={14} /> {job.location}
              </span>
              <span className="cand-job-meta-dot">&bull;</span>
              <span className="cand-job-meta-item">
                <Building size={14} /> {job.workType}
              </span>
              <span className="cand-job-meta-dot">&bull;</span>
              <span className="cand-job-meta-item">
                <Briefcase size={14} /> {job.jobType}
              </span>
              <span className="cand-job-meta-dot">&bull;</span>
              <span className="cand-job-meta-item">
                <Award size={14} /> {job.experienceYears} ({job.experienceLevel})
              </span>
              <span className="cand-job-meta-dot">&bull;</span>
              <span className="cand-job-meta-item">
                <Clock size={14} /> {job.postedTime}
              </span>
            </div>
          </div>
        </div>

        <div className="cand-job-hero-right">
          <div className="cand-job-salary-box">
            <span className="cand-job-salary-label">OFFERED COMPENSATION</span>
            <span className="cand-job-salary-value">{salaryRange}</span>
            <span className="cand-job-salary-sub">Fixed + Annual Performance Bonus</span>
          </div>

          <div className="cand-job-hero-cta">
            {hasApplied ? (
              <button type="button" className="cand-job-btn-applied" disabled>
                <CheckCircle2 size={16} /> Applied with ProXHire
              </button>
            ) : (
              <button
                type="button"
                className="cand-btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', width: '100%', justifyContent: 'center' }}
                onClick={handleApplyClick}
              >
                1-Click Apply with ProXHire →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Application Success Banner if just applied */}
      {showApplySuccess && (
        <div className="cand-job-applied-banner">
          <div className="cand-job-applied-banner-left">
            <CheckCircle2 size={24} color="#059669" />
            <div>
              <strong>Application Submitted Successfully!</strong>
              <p>Your verified ProXHire candidate profile has been delivered directly to {job.company}'s hiring team with priority screening.</p>
            </div>
          </div>
          <button
            type="button"
            className="cand-job-banner-dismiss"
            onClick={() => setShowApplySuccess(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column Content Layout */}
      <div className="cand-job-content-grid">
        {/* Left Column: Comprehensive Job Details */}
        <div className="cand-job-main-col">
          {/* Candidate Fit & Match Card */}
          <div className="cand-job-section-card cand-job-match-card">
            <div className="cand-job-match-head">
              <div className="cand-job-match-badge">
                <Sparkles size={16} color="#4338ca" />
                <span>94% Profile Match</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Based on your registration data & skill proficiencies
              </span>
            </div>
            <p className="cand-job-match-desc">
              Great news, <strong>{candidateName}</strong>! Your experience level ({job.experienceLevel}) and skills closely match what {job.company} is seeking for this position. Because you have verified background credentials, your profile will skip initial recruiter triage.
            </p>
            <div className="cand-job-matching-skills-row">
              <span className="cand-job-skills-label">Matching Skills:</span>
              {job.tags.map(skill => (
                <span key={skill} className="cand-job-match-tag">
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* About the Role */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">About the Role</h3>
            <p className="cand-job-text">
              We are seeking a talented and high-ownership <strong>{job.role}</strong> to join our product and engineering team at <strong>{job.company}</strong> in <strong>{job.location}</strong>. In this role, you will design scalable web applications, collaborate directly with product and design leads, and write reliable, clean code that powers critical systems.
            </p>
            <p className="cand-job-text">
              You will work closely with a world-class team of engineers, designers, and product managers to solve challenging software problems and deliver frictionless digital experiences.
            </p>
          </div>

          {/* Key Responsibilities */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">Key Responsibilities</h3>
            <ul className="cand-job-list">
              {responsibilities.map((resp, idx) => (
                <li key={idx} className="cand-job-list-item">
                  <div className="cand-job-list-check">
                    <Check size={13} />
                  </div>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills & Technologies */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">Required Skills & Technologies</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Candidates with strong practical experience in the following technologies are encouraged to apply:
            </p>
            <div className="cand-job-chips-wrap">
              {job.tags.map(tag => (
                <span key={tag} className="cand-job-tech-chip">
                  {tag}
                </span>
              ))}
              <span className="cand-job-tech-chip">REST APIs</span>
              <span className="cand-job-tech-chip">Git & Version Control</span>
              <span className="cand-job-tech-chip">Unit Testing</span>
              <span className="cand-job-tech-chip">Agile / Scrum</span>
            </div>
          </div>

          {/* Requirements & Qualifications */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">Qualifications & Experience</h3>
            <ul className="cand-job-list">
              {requirements.map((req, idx) => (
                <li key={idx} className="cand-job-list-item">
                  <div className="cand-job-list-check">
                    <Check size={13} />
                  </div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Perks & Benefits */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">Perks & Benefits</h3>
            <div className="cand-job-perks-grid">
              {perks.map((perk, idx) => (
                <div key={idx} className="cand-job-perk-box">
                  <div className="cand-job-perk-icon">
                    <CheckCircle2 size={16} color="#059669" />
                  </div>
                  <div>
                    <h5 className="cand-job-perk-title">{perk.title}</h5>
                    <p className="cand-job-perk-desc">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Workflow / Timeline */}
          <div className="cand-job-section-card">
            <h3 className="cand-job-section-title">Hiring Process & Timeline</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              ProXHire partners adhere to a structured, transparent hiring process with zero ghosting:
            </p>
            <div className="cand-job-timeline">
              {hiringRounds.map(round => (
                <div key={round.step} className="cand-job-timeline-item">
                  <div className="cand-job-timeline-num">{round.step}</div>
                  <div className="cand-job-timeline-body">
                    <div className="cand-job-timeline-head">
                      <span className="cand-job-timeline-title">{round.title}</span>
                      <span className="cand-job-timeline-dur">{round.duration}</span>
                    </div>
                    <p className="cand-job-timeline-desc">{round.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar with Job Snapshot & Company Info */}
        <div className="cand-job-sidebar-col">
          {/* Quick Apply Summary Card */}
          <div className="cand-job-sidebar-card">
            <h4 className="cand-job-sidebar-title">Job Overview</h4>

            <div className="cand-job-snapshot-list">
              <div className="cand-job-snapshot-row">
                <span className="label"><Building size={14} /> Company</span>
                <span className="val">{job.company}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><MapPin size={14} /> Location</span>
                <span className="val">{job.location}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><Briefcase size={14} /> Work Mode</span>
                <span className="val">{job.workType}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><Award size={14} /> Experience</span>
                <span className="val">{job.experienceYears}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><Clock size={14} /> Employment Type</span>
                <span className="val">{job.jobType}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><Briefcase size={14} /> Expected CTC</span>
                <span className="val" style={{ color: '#059669', fontWeight: 700 }}>{salaryRange}</span>
              </div>
              <div className="cand-job-snapshot-row">
                <span className="label"><Calendar size={14} /> Date Posted</span>
                <span className="val">{job.postedTime}</span>
              </div>
            </div>

            <div className="cand-job-sidebar-actions">
              {hasApplied ? (
                <div className="cand-job-applied-badge">
                  <CheckCircle2 size={16} /> Application Sent & Under Review
                </div>
              ) : (
                <button
                  type="button"
                  className="cand-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '14px' }}
                  onClick={handleApplyClick}
                >
                  1-Click Apply with ProXHire →
                </button>
              )}

              <button
                type="button"
                className={`cand-btn-secondary ${isSaved ? 'cand-btn-saved' : ''}`}
                style={{ width: '100%', justifyContent: 'center', height: '42px', marginTop: '10px' }}
                onClick={handleToggleSave}
              >
                <Bookmark size={15} fill={isSaved ? '#09090b' : 'none'} />
                {isSaved ? 'Job Saved' : 'Save this Opportunity'}
              </button>
            </div>
          </div>

          {/* About Company Card */}
          <div className="cand-job-sidebar-card">
            <h4 className="cand-job-sidebar-title">About {job.company}</h4>
            <p className="cand-job-company-desc">{companyInfo.about}</p>

            <div className="cand-job-company-meta-list">
              <div className="cand-job-company-meta-row">
                <span className="label"><Users size={14} /> Size</span>
                <span className="val">{companyInfo.size}</span>
              </div>
              <div className="cand-job-company-meta-row">
                <span className="label"><Globe size={14} /> Industry</span>
                <span className="val">{companyInfo.industry}</span>
              </div>
              <div className="cand-job-company-meta-row">
                <span className="label"><Calendar size={14} /> Founded</span>
                <span className="val">{companyInfo.founded}</span>
              </div>
              <div className="cand-job-company-meta-row">
                <span className="label"><MapPin size={14} /> HQ</span>
                <span className="val">{companyInfo.headquarters}</span>
              </div>
            </div>

            <a
              href={companyInfo.website}
              target="_blank"
              rel="noreferrer"
              className="cand-job-company-link"
            >
              <span>Visit Company Website</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* ProXHire Trust Card */}
          <div className="cand-job-sidebar-card cand-job-trust-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={20} color="#059669" />
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                ProXHire Verified Listing
              </h5>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
              This opening is actively managed by verified recruiter partners. Ghost listings and spam are strictly prohibited on the ProXHire platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
