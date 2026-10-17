import React, { useState } from 'react'
import {
  FileText,
  Upload,
  Plus,
  GraduationCap,
  Star,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step3ResumeSkills: React.FC = () => {
  const { formData, updateField, nextStep, prevStep } = useCandidate()
  const [showEduModal, setShowEduModal] = useState(false)
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  // Education form state
  const [inst, setInst] = useState('')
  const [deg, setDeg] = useState('')
  const [field, setField] = useState('')
  const [endYr, setEndYr] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      updateField('resumeFileName', e.target.files[0].name)
    }
  }

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault()
    if (inst && deg) {
      updateField('educations', [
        ...formData.educations,
        {
          id: Date.now().toString(),
          institution: inst,
          degree: deg,
          fieldOfStudy: field || 'Computer Science',
          startYear: '2022',
          endYear: endYr || '2026',
          gradeOrCgpa: '8.5 CGPA'
        }
      ])
      setShowEduModal(false)
      setInst('')
      setDeg('')
    }
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      updateField('skills', [...formData.skills, newSkill.trim()])
      setNewSkill('')
      setShowSkillModal(false)
    }
  }

  const removeSkill = (skill: string) => {
    updateField('skills', formData.skills.filter(s => s !== skill))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 3 OF 6</div>
      <h2 className="cand-step-title">Resume, Education & Skills</h2>
      <p className="cand-step-subtitle">
        Add your resume, educational details and key skills to showcase your strengths.
      </p>

      {/* Resume Card */}
      <div className="cand-verify-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#09090b'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Resume
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Upload your latest resume or create one.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="cand-btn-back"
            style={{ height: '38px', fontSize: '12.5px', padding: '0 14px' }}
            onClick={() => alert('Opening ProXHire AI Resume Builder...')}
          >
            <FileText size={14} /> Create Resume
          </button>
        </div>

        <label className="cand-dropzone">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.rtf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <div className="cand-dropzone-icon">
            <Upload size={22} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', margin: 0 }}>
            {formData.resumeFileName ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <CheckCircle2 size={16} /> {formData.resumeFileName} (Uploaded)
              </span>
            ) : (
              'Drag & drop your resume here or browse files'
            )}
          </p>
          <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Supported formats: PDF, DOC, DOCX, RTF (Max 2 MB)
          </span>
        </label>
      </div>

      {/* Profile Introduction */}
      <div className="cand-verify-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#09090b'
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Profile Introduction
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Add a short professional summary to highlight your profile.
            </p>
          </div>
        </div>

        <div className="cand-field-group">
          <label className="cand-field-label">
            Profile Tagline / Professional Summary <span className="req">*</span>
          </label>
          <textarea
            className="cand-input"
            style={{ height: 'auto', minHeight: '84px', padding: '12px 14px' }}
            maxLength={300}
            placeholder="Write a brief summary about yourself, your skills and career goals..."
            value={formData.profileSummary}
            onChange={e => updateField('profileSummary', e.target.value)}
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
            {formData.profileSummary.length} / 300
          </div>
        </div>
      </div>

      {/* 2 Side-by-side Cards: Education Details & Key Skills */}
      <div className="cand-review-grid" style={{ margin: '0 0 28px' }}>
        {/* Education Details */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
              <GraduationCap size={18} /> Education Details
            </div>
            <button
              type="button"
              className="cand-btn-back"
              style={{ height: '34px', fontSize: '12px', padding: '0 12px' }}
              onClick={() => setShowEduModal(true)}
            >
              <Plus size={13} /> Add Education
            </button>
          </div>

          {formData.educations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.educations.map(edu => (
                <div key={edu.id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#09090b' }}>{edu.degree} in {edu.fieldOfStudy}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.institution} &bull; Class of {edu.endYear}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
              <GraduationCap size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#09090b', margin: 0 }}>
                No education details added yet.
              </h5>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                Click 'Add Education' to add your qualifications.
              </p>
            </div>
          )}
        </div>

        {/* Key Skills */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
              <Star size={18} /> Key Skills
            </div>
            <button
              type="button"
              className="cand-btn-back"
              style={{ height: '34px', fontSize: '12px', padding: '0 12px' }}
              onClick={() => setShowSkillModal(true)}
            >
              <Plus size={13} /> Add Skill
            </button>
          </div>

          {formData.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    backgroundColor: '#f1f5f9',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{ color: '#94a3b8', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
              <Star size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#09090b', margin: 0 }}>
                No skills added yet.
              </h5>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                Click 'Add Skill' to add your key skills.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="cand-action-footer">
        <button type="button" className="cand-btn-back" onClick={prevStep}>
          <ArrowLeft size={16} /> Back
        </button>

        <button type="button" className="cand-btn-primary" onClick={nextStep}>
          Continue <ArrowRight size={16} />
        </button>
      </div>

      {/* Add Education Modal */}
      {showEduModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowEduModal(false)}
        >
          <form
            onSubmit={handleAddEducation}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '28px',
              maxWidth: '460px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>Add Education</h4>
            <input
              type="text"
              className="cand-input"
              placeholder="College / University Name"
              value={inst}
              onChange={e => setInst(e.target.value)}
              required
            />
            <input
              type="text"
              className="cand-input"
              placeholder="Degree (e.g. B.Tech, BCA, B.Sc)"
              value={deg}
              onChange={e => setDeg(e.target.value)}
              required
            />
            <input
              type="text"
              className="cand-input"
              placeholder="Graduation Year (e.g. 2026)"
              value={endYr}
              onChange={e => setEndYr(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowEduModal(false)}>Cancel</button>
              <button type="submit" className="cand-btn-primary">Save Education</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowSkillModal(false)}
        >
          <form
            onSubmit={handleAddSkill}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>Add Key Skill</h4>
            <input
              type="text"
              className="cand-input"
              placeholder="e.g. React, Python, Figma, Java"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              autoFocus
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowSkillModal(false)}>Cancel</button>
              <button type="submit" className="cand-btn-primary">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
