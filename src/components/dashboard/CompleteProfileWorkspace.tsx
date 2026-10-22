import React, { useState } from 'react'
import {
  FileText,
  Upload,
  Plus,
  GraduationCap,
  Briefcase,
  Star,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  MapPin,
  Building,
  User,
  Globe,
  ArrowLeft,
  Save,
  Check,
  ShieldCheck,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'
import { authService } from '../../services/authService'
import { syncCandidateToFirebase, uploadResumeToFirebaseStorage } from '../../services/firebaseCandidateSync'
import type { EducationItem, ExperienceItem, ProjectItem } from '../../types'

interface CompleteProfileWorkspaceProps {
  onBack: () => void
  initialTab?: 'profile' | 'career' | 'personal' | 'review'
}

export const CompleteProfileWorkspace: React.FC<CompleteProfileWorkspaceProps> = ({
  onBack,
  initialTab = 'profile'
}) => {
  const { formData, updateField, authToken, userId } = useCandidate()
  const [activeTab, setActiveTab] = useState<'profile' | 'career' | 'personal' | 'review'>(initialTab)

  // Modals state
  const [showEduModal, setShowEduModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)
  const [showProjModal, setShowProjModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [newSkillInput, setNewSkillInput] = useState('')
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showResumePreview, setShowResumePreview] = useState(false)

  // Education Form State
  const [eduDegree, setEduDegree] = useState('')
  const [eduInst, setEduInst] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduEndYear, setEduEndYear] = useState('')
  const [eduGrade, setEduGrade] = useState('')

  // Experience Form State
  const [expTitle, setExpTitle] = useState('')
  const [expCompany, setExpCompany] = useState('')
  const [expLocation, setExpLocation] = useState('')
  const [expStartDate, setExpStartDate] = useState('')
  const [expEndDate, setExpEndDate] = useState('')
  const [expIsCurrent, setExpIsCurrent] = useState(false)
  const [expDescription, setExpDescription] = useState('')

  // Project Form State
  const [projTitle, setProjTitle] = useState('')
  const [projRole, setProjRole] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projTech, setProjTech] = useState('')
  const [projUrl, setProjUrl] = useState('')

  // Popular skills quick-add list
  const popularSkills = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'SQL',
    'AWS', 'Docker', 'Git', 'Next.js', 'MongoDB', 'Tailwind CSS', 'GraphQL', 'Express'
  ]

  // Indian metro locations
  const availableLocations = [
    'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai', 'Kolkata', 'Remote India'
  ]

  // Calculate dynamic completion score
  const calculateCompletion = () => {
    let score = 20 // Basic details verified
    if (formData.resumeFileName) score += 15
    if (formData.profileSummary && formData.profileSummary.trim().length > 20) score += 10
    if (formData.educations && formData.educations.length > 0) score += 15
    if (formData.skills && formData.skills.length >= 3) score += 10
    if ((formData.experiences && formData.experiences.length > 0) || (formData.projects && formData.projects.length > 0)) score += 15
    if (formData.preferredRole && formData.expectedCtc) score += 10
    if (formData.city && formData.dateOfBirth) score += 5
    return Math.min(score, 100)
  }

  const completionPercent = calculateCompletion()

  // Save handler: updates context, localStorage, backend API and Firebase
  const handleSaveAll = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      // 1. Sync to Firebase Firestore
      await syncCandidateToFirebase(formData, userId || undefined)

      // 2. Sync to Backend PostgreSQL if token is present
      if (authToken) {
        await authService.updateProfile(authToken, {
          fullName: formData.fullName,
          city: formData.city || 'Bengaluru',
          preferredLocations: formData.preferredLocations,
          currentJobTitle: formData.preferredRole || 'Candidate',
          totalExperienceMonths: formData.experienceCategory === 'experienced' ? 24 : 0,
          expectedSalary: formData.expectedCtc ? parseInt(formData.expectedCtc.replace(/\D/g, '')) || null : null,
          preferredIndustry: formData.industry,
          preferredJobType: formData.employmentType === 'Full Time' ? 'FULL_TIME' : 'PART_TIME'
        }).catch((err) => {
          console.warn('Backend profile update note:', err.message)
        })
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4500)
    } catch (err: any) {
      console.error('Save error:', err)
      alert(err.message || 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Resume File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const allowedExts = ['.pdf', '.doc', '.docx', '.rtf']
      const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase()

      if (!allowedExts.includes(fileExt)) {
        alert('Invalid file format. Please upload a PDF, DOC, DOCX, or RTF document.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller resume file.')
        return
      }

      updateField('resumeFileName', file.name)
      updateField('resumeFileSize', file.size)
      updateField('resumeFileType', file.type || 'application/pdf')

      setIsUploadingResume(true)
      const reader = new FileReader()
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string
        if (dataUrl) {
          updateField('resumeDataUrl', dataUrl)
          if (formData.email) {
            try {
              localStorage.setItem('resume_' + formData.email.toLowerCase().trim(), dataUrl)
            } catch (err) {
              console.warn('LocalStorage limit for resume:', err)
            }
          }
          if (userId) {
            try {
              const downloadUrl = await uploadResumeToFirebaseStorage(file, userId)
              if (downloadUrl) {
                updateField('resumeUrl', downloadUrl)
              }
            } catch (storageErr) {
              console.warn('Firebase Storage notice:', storageErr)
            }
          }
        }
        setIsUploadingResume(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Education Handlers
  const handleAddEducation = () => {
    if (!eduDegree.trim() || !eduInst.trim()) {
      alert('Please fill in Degree and Institution name.')
      return
    }
    const item: EducationItem = {
      id: Date.now().toString(),
      institution: eduInst.trim(),
      degree: eduDegree.trim(),
      fieldOfStudy: eduField.trim() || 'General',
      startYear: '',
      endYear: eduEndYear.trim() || new Date().getFullYear().toString(),
      gradeOrCgpa: eduGrade.trim()
    }
    updateField('educations', [...formData.educations, item])
    setEduDegree('')
    setEduInst('')
    setEduField('')
    setEduEndYear('')
    setEduGrade('')
    setShowEduModal(false)
  }

  const handleDeleteEducation = (id: string) => {
    updateField('educations', formData.educations.filter(e => e.id !== id))
  }

  // Experience Handlers
  const handleAddExperience = () => {
    if (!expTitle.trim() || !expCompany.trim()) {
      alert('Please fill in Job Title and Company name.')
      return
    }
    const item: ExperienceItem = {
      id: Date.now().toString(),
      jobTitle: expTitle.trim(),
      company: expCompany.trim(),
      location: expLocation.trim() || 'India',
      startDate: expStartDate.trim(),
      endDate: expIsCurrent ? 'Present' : expEndDate.trim(),
      isCurrent: expIsCurrent,
      description: expDescription.trim()
    }
    updateField('experiences', [...formData.experiences, item])
    setExpTitle('')
    setExpCompany('')
    setExpLocation('')
    setExpStartDate('')
    setExpEndDate('')
    setExpIsCurrent(false)
    setExpDescription('')
    setShowExpModal(false)
  }

  const handleDeleteExperience = (id: string) => {
    updateField('experiences', formData.experiences.filter(e => e.id !== id))
  }

  // Project Handlers
  const handleAddProject = () => {
    if (!projTitle.trim()) {
      alert('Please enter a Project Title.')
      return
    }

    const item: ProjectItem = {
      id: Date.now().toString(),
      title: projTitle.trim(),
      role: projRole.trim(),
      description: projDesc.trim(),
      techStack: projTech.trim(),
      link: projUrl.trim()
    }
    updateField('projects', [...formData.projects, item])
    setProjTitle('')
    setProjRole('')
    setProjDesc('')
    setProjTech('')
    setProjUrl('')
    setShowProjModal(false)
  }

  const handleDeleteProject = (id: string) => {
    updateField('projects', formData.projects.filter(p => p.id !== id))
  }

  // Skills Handlers
  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim()
    if (!trimmed) return
    if (!formData.skills.includes(trimmed)) {
      updateField('skills', [...formData.skills, trimmed])
    }
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skill: string) => {
    updateField('skills', formData.skills.filter(s => s !== skill))
  }

  // Locations Toggle
  const toggleLocation = (loc: string) => {
    const current = formData.preferredLocations || []
    if (current.includes(loc)) {
      updateField('preferredLocations', current.filter(l => l !== loc))
    } else {
      updateField('preferredLocations', [...current, loc])
    }
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '24px 20px 80px', width: '100%' }}>
      {/* Top Banner & Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#475467',
              fontSize: '13.5px',
              fontWeight: 600,
              padding: '4px 0',
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Complete Your Profile
            <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
              <ShieldCheck size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} /> Verified Account
            </span>
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0' }}>
            Add your resume, education, work experience and career preferences to boost recruiter visibility by 3x.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#09090b',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSaving ? 'Saving Changes...' : (
              <>
                <Save size={16} /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>Profile changes saved successfully! Your candidate profile is updated and synced in real-time.</span>
        </div>
      )}

      {/* Profile Strength & Metric Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #e4e4e7',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '3.5px solid #09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#09090b'
            }}
          >
            {completionPercent}%
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#09090b' }}>
              Profile Strength: {completionPercent >= 80 ? 'Strong' : completionPercent >= 50 ? 'Intermediate' : 'Getting Started'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
              {formData.fullName} &bull; {formData.email} &bull; +91 {formData.mobileNumber}
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div style={{ flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475467', marginBottom: '6px' }}>
            <span>Completion Progress</span>
            <span>{completionPercent}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${completionPercent}%`,
                backgroundColor: completionPercent >= 80 ? '#10b981' : '#2563eb',
                borderRadius: '9999px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div
        className="cand-tabs-bar"
        style={{
          display: 'flex',
          borderBottom: '2px solid #e4e4e7',
          marginBottom: '28px',
          gap: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {[
          { key: 'profile', label: '1. Profile Details & Skills', icon: GraduationCap },
          { key: 'career', label: '2. Career & Professional Profile', icon: Briefcase },
          { key: 'personal', label: '3. Personal & Contact Details', icon: User },
          { key: 'review', label: '4. Profile Review', icon: CheckCircle2 }
        ].map(t => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #09090b' : '3px solid transparent',
                marginBottom: '-2px',
                color: isActive ? '#09090b' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#09090b' : '#94a3b8'} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* TAB 1: PROFILE DETAILS, RESUME & SKILLS */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Card: Resume Upload */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> Upload Resume / CV
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Supported formats: PDF, DOC, DOCX, RTF (Max size: 5MB).
            </p>

            {formData.resumeFileName ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                      {formData.resumeFileName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {formData.resumeFileSize ? `${(formData.resumeFileSize / (1024 * 1024)).toFixed(2)} MB` : 'Uploaded Document'} &bull; Ready for recruiters
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {formData.resumeDataUrl && (
                    <button
                      type="button"
                      onClick={() => setShowResumePreview(true)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} /> Preview
                    </button>
                  )}
                  <label
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#2563eb',
                      cursor: 'pointer'
                    }}
                  >
                    Replace
                    <input type="file" accept=".pdf,.doc,.docx,.rtf" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('resumeFileName', undefined)
                      updateField('resumeDataUrl', undefined)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      padding: '6px',
                      cursor: 'pointer'
                    }}
                    title="Remove Resume"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 20px',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '14px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Upload size={20} color="#2563eb" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
                  {isUploadingResume ? 'Processing Resume...' : 'Click to upload your Resume / CV'}
                </span>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  PDF, DOC, DOCX up to 5MB
                </span>
                <input type="file" accept=".pdf,.doc,.docx,.rtf" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
            )}
          </div>

          {/* Card: Profile Summary */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Profile Summary & Headline
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Briefly describe your professional background, core technical strengths and career aspirations.
            </p>
            <textarea
              rows={4}
              value={formData.profileSummary}
              onChange={e => updateField('profileSummary', e.target.value)}
              placeholder="e.g. Experienced Full-Stack Software Engineer with 4+ years specializing in TypeScript, React, and scalable backend microservices. Proven track record of delivering high-impact fintech applications..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                fontSize: '13.5px',
                color: '#09090b',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Card: Education Qualifications */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  Education Details
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Add your academic background, degree, college and passing years.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEduModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#09090b',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Education
              </button>
            </div>

            {formData.educations && formData.educations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.educations.map(edu => (
                  <div
                    key={edu.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <GraduationCap size={20} color="#2563eb" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                          {edu.degree} &bull; {edu.fieldOfStudy}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                          {edu.institution} {edu.endYear ? `(Graduated ${edu.endYear})` : ''} {edu.gradeOrCgpa ? `&bull; ${edu.gradeOrCgpa}` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <GraduationCap size={28} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#475467' }}>No education details added yet</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Click "Add Education" to list your degree and institution.</div>
              </div>
            )}
          </div>

          {/* Card: Skills & Expertise */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Skills & Expertise
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
              Add skills that best represent your technical strengths and tools you work with.
            </p>

            {/* Current Skills Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {formData.skills && formData.skills.map(s => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#09090b',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Custom Skill input */}
            <div style={{ display: 'flex', gap: '10px', maxWidth: '440px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter skill name (e.g. Docker, Redux)"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(newSkillInput)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#09090b',
                  cursor: 'pointer'
                }}
              >
                Add Skill
              </button>
            </div>

            {/* Popular Suggested Skills */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Suggested Popular Skills:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {popularSkills.filter(s => !formData.skills.includes(s)).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9999px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAREER & PROFESSIONAL PROFILE */}
      {activeTab === 'career' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Work Experience */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  Work Experience
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  List your past and current employment history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExpModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#09090b',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Experience
              </button>
            </div>

            {formData.experiences && formData.experiences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {formData.experiences.map(exp => (
                  <div
                    key={exp.id}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
                          {exp.jobTitle}
                        </span>
                        {exp.isCurrent && (
                          <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '9999px' }}>
                            Current Role
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#475467', marginTop: '2px' }}>
                        {exp.company} &bull; {exp.location}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {exp.startDate} - {exp.endDate}
                      </div>
                      {exp.description && (
                        <p style={{ fontSize: '13px', color: '#334155', marginTop: '8px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <Briefcase size={28} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#475467' }}>No work experience added yet</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Click "Add Experience" to list your past or current companies.</div>
              </div>
            )}
          </div>

          {/* Key Projects */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  Projects & Case Studies
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                  Showcase your independent apps, academic capstone projects or open-source repositories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#09090b',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Project
              </button>
            </div>

            {formData.projects && formData.projects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                {formData.projects.map(proj => (
                  <div
                    key={proj.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                          {proj.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {proj.role && (
                        <div style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                          Role: {proj.role}
                        </div>
                      )}
                      <p style={{ fontSize: '13px', color: '#475467', marginTop: '6px', lineHeight: 1.4 }}>
                        {proj.description}
                      </p>
                      {proj.techStack && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                          {proj.techStack.split(',').map((t, idx) => (
                            <span key={idx} style={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2563eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={12} /> View Project Demo
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '13px', color: '#64748b' }}>No projects added yet. Click "Add Project" to showcase your work.</div>
              </div>
            )}
          </div>

          {/* Career Preferences */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Job Preferences & Compensation
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Define the roles, work arrangements and salary expectations you are targeting.
            </p>

            <div className="cand-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              {/* Target Job Role */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Job Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.preferredRole}
                  onChange={e => updateField('preferredRole', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Target Industry */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Target Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={e => updateField('industry', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Banking & Financial Services">Banking & Financial Services</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              {/* Work Mode */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Work Arrangement
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['On-site', 'Hybrid', 'Remote'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateField('workType', mode)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        backgroundColor: formData.workType === mode ? '#09090b' : '#f8fafc',
                        color: formData.workType === mode ? '#ffffff' : '#334155',
                        border: '1.5px solid',
                        borderColor: formData.workType === mode ? '#09090b' : '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expected CTC */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Expected CTC (₹ LPA)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12,00,000 / 12 LPA"
                  value={formData.expectedCtc}
                  onChange={e => updateField('expectedCtc', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
            </div>

            {/* Preferred Locations */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Preferred Work Locations (Select all that apply)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {availableLocations.map(loc => {
                  const isSelected = (formData.preferredLocations || []).includes(loc)
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        backgroundColor: isSelected ? '#09090b' : '#f8fafc',
                        color: isSelected ? '#ffffff' : '#475467',
                        border: '1px solid',
                        borderColor: isSelected ? '#09090b' : '#cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '} {loc}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONAL & CONTACT DETAILS */}
      {activeTab === 'personal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Identity & Personal Info */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Personal Details
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Information required for pre-BGV compliance and verified employer background checks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px 20px' }}>
              {/* Date of Birth */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => updateField('dateOfBirth', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => updateField('gender', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Nationality */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={e => updateField('nationality', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              {/* Social Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Social Category
                </label>
                <select
                  value={formData.category}
                  onChange={e => updateField('category', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>
          </div>

          {/* Full Residential Address */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Residential Address
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Used for location matching and verified candidate credential verification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="House / Flat No., Street, Building"
                  value={formData.addressLine1}
                  onChange={e => updateField('addressLine1', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    City / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={e => updateField('city', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={e => updateField('state', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={e => updateField('pinCode', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Online Profiles & Social Links */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#09090b', marginBottom: '4px' }}>
              Online Profiles & Portfolios
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Link your developer profiles to showcase real projects and code contributions.
            </p>

            <div className="cand-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedInUrl}
                  onChange={e => updateField('linkedInUrl', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={formData.gitHubUrl}
                  onChange={e => updateField('gitHubUrl', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Portfolio / Personal Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.dev"
                  value={formData.portfolioUrl}
                  onChange={e => updateField('portfolioUrl', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW & COMPLETE SUMMARY */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              padding: '20px 24px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ShieldCheck size={28} color="#16a34a" />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#166534' }}>
                  Pre-BGV Verification Ready
                </div>
                <div style={{ fontSize: '13px', color: '#15803d' }}>
                  Your basic credentials (Mobile & Email) are verified. Complete profile parameters boost your interview call rate by 3x.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : 'Confirm & Save All'}
            </button>
          </div>

          {/* Full review card */}
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e4e4e7', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '16px' }}>
              Profile Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>FULL NAME</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>{formData.fullName}</div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>EMAIL ADDRESS</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>{formData.email} ✓</div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>MOBILE NUMBER</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>+91 {formData.mobileNumber} ✓</div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>RESUME STATUS</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                  {formData.resumeFileName ? `✓ ${formData.resumeFileName}` : 'Not uploaded yet'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TARGET ROLE</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                  {formData.preferredRole || 'Software Engineer'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>EXPECTED COMPENSATION</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                  {formData.expectedCtc || 'Negotiable'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EDUCATION */}
      {showEduModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowEduModal(false)}
        >
          <div
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '16px' }}>Add Education</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Degree (e.g. B.Tech Computer Science)"
                value={eduDegree}
                onChange={e => setEduDegree(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="College / Institution Name"
                value={eduInst}
                onChange={e => setEduInst(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="Field of Study / Major"
                value={eduField}
                onChange={e => setEduField(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Passing Year (e.g. 2024)"
                  value={eduEndYear}
                  onChange={e => setEduEndYear(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
                <input
                  type="text"
                  placeholder="Grade / CGPA (e.g. 8.5/10)"
                  value={eduGrade}
                  onChange={e => setEduGrade(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddEducation}
                style={{ backgroundColor: '#09090b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPERIENCE */}
      {showExpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowExpModal(false)}
        >
          <div
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '16px' }}>Add Work Experience</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Job Title (e.g. Frontend Engineer)"
                value={expTitle}
                onChange={e => setExpTitle(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="Company Name"
                value={expCompany}
                onChange={e => setExpCompany(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="Location (e.g. Bangalore, India)"
                value={expLocation}
                onChange={e => setExpLocation(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Start Date (e.g. Jan 2022)"
                  value={expStartDate}
                  onChange={e => setExpStartDate(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
                <input
                  type="text"
                  placeholder="End Date (e.g. Present)"
                  disabled={expIsCurrent}
                  value={expIsCurrent ? 'Present' : expEndDate}
                  onChange={e => setExpEndDate(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={expIsCurrent}
                  onChange={e => setExpIsCurrent(e.target.checked)}
                />
                I currently work here
              </label>
              <textarea
                rows={3}
                placeholder="Key responsibilities and achievements..."
                value={expDescription}
                onChange={e => setExpDescription(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddExperience}
                style={{ backgroundColor: '#09090b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROJECT */}
      {showProjModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowProjModal(false)}
        >
          <div
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '16px' }}>Add Project</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Project Title"
                value={projTitle}
                onChange={e => setProjTitle(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="Your Role (e.g. Lead Frontend Developer)"
                value={projRole}
                onChange={e => setProjRole(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated, e.g. React, Node, AWS)"
                value={projTech}
                onChange={e => setProjTech(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <input
                type="url"
                placeholder="Project Link / GitHub URL (optional)"
                value={projUrl}
                onChange={e => setProjUrl(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <textarea
                rows={3}
                placeholder="Brief project description..."
                value={projDesc}
                onChange={e => setProjDesc(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setShowProjModal(false)}
                style={{ background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddProject}
                style={{ backgroundColor: '#09090b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESUME PREVIEW */}
      {showResumePreview && formData.resumeDataUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px'
          }}
          onClick={() => setShowResumePreview(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
                Resume Preview: {formData.resumeFileName}
              </span>
              <button
                type="button"
                onClick={() => setShowResumePreview(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
              <iframe
                src={formData.resumeDataUrl}
                title="Resume Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
