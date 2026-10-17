import React, { useState } from 'react'
import {
  Briefcase,
  Code2,
  User,
  MapPin,
  Plus,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { useCandidate } from '../../context/CandidateContext'

export const Step4EmploymentCareer: React.FC = () => {
  const { formData, updateField, nextStep, prevStep } = useCandidate()
  const [showExpModal, setShowExpModal] = useState(false)
  const [showProjModal, setShowProjModal] = useState(false)

  // Experience form
  const [expTitle, setExpTitle] = useState('')
  const [expComp, setExpComp] = useState('')

  // Project form
  const [projTitle, setProjTitle] = useState('')
  const [projTech, setProjTech] = useState('')

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault()
    if (expTitle && expComp) {
      updateField('experiences', [
        ...formData.experiences,
        {
          id: Date.now().toString(),
          jobTitle: expTitle,
          company: expComp,
          location: 'Bengaluru',
          startDate: '2023',
          endDate: 'Present',
          isCurrent: true,
          description: 'Working on full stack products.'
        }
      ])
      setShowExpModal(false)
      setExpTitle('')
      setExpComp('')
    }
  }

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (projTitle) {
      updateField('projects', [
        ...formData.projects,
        {
          id: Date.now().toString(),
          title: projTitle,
          role: 'Full Stack Developer',
          techStack: projTech || 'React, Node.js',
          description: 'Key academic and portfolio application.'
        }
      ])
      setShowProjModal(false)
      setProjTitle('')
      setProjTech('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="cand-step-indicator">STEP 4 OF 6</div>
      <h2 className="cand-step-title">Employment, Projects & Career Profile</h2>
      <p className="cand-step-subtitle">
        Add your work experience (or academic projects), and share your career preferences.
      </p>

      {/* Employment Details Card */}
      <div className="cand-verify-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#09090b'
              }}
            >
              <Briefcase size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Employment Details
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Add your past and current work experience.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="cand-btn-back"
            style={{ height: '36px', fontSize: '12.5px', padding: '0 14px' }}
            onClick={() => setShowExpModal(true)}
          >
            <Plus size={13} /> Add Experience
          </button>
        </div>

        {formData.experiences.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.experiences.map(exp => (
              <div key={exp.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#09090b' }}>{exp.jobTitle} &bull; {exp.company}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{exp.startDate} - {exp.endDate} ({exp.location})</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            <Briefcase size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#09090b', margin: 0 }}>
              No work experience added yet.
            </h5>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
              Click 'Add Experience' to add your employment history.
            </p>
          </div>
        )}
      </div>

      {/* Projects Card */}
      <div className="cand-verify-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#09090b'
              }}
            >
              <Code2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Projects
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Add your key projects, internships or academic projects.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="cand-btn-back"
            style={{ height: '36px', fontSize: '12.5px', padding: '0 14px' }}
            onClick={() => setShowProjModal(true)}
          >
            <Plus size={13} /> Add Project
          </button>
        </div>

        {formData.projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.projects.map(p => (
              <div key={p.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#09090b' }}>{p.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Tech Stack: {p.techStack}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            <Code2 size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h5 style={{ fontSize: '13.5px', fontWeight: 600, color: '#09090b', margin: 0 }}>
              No projects added yet.
            </h5>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
              Click 'Add Project' to showcase your work.
            </p>
          </div>
        )}
      </div>

      {/* 2 Side-by-side Cards: Career Profile & Job Preferences */}
      <div className="cand-review-grid" style={{ margin: '0 0 28px' }}>
        {/* Career Profile */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
            <User size={16} /> Career Profile
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
            Tell us about your career interests.
          </p>

          <div className="cand-form-grid single-col" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">Preferred Role <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.preferredRole}
                onChange={e => updateField('preferredRole', e.target.value)}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Product Designer">Product Designer</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Industry <span className="req">*</span></label>
              <select
                className="cand-input"
                value={formData.industry}
                onChange={e => updateField('industry', e.target.value)}
              >
                <option value="Information Technology">Information Technology</option>
                <option value="FinTech">FinTech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-Commerce">E-Commerce</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Department</label>
              <select
                className="cand-input"
                value={formData.department}
                onChange={e => updateField('department', e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Analytics">Analytics</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Employment Type</label>
              <select
                className="cand-input"
                value={formData.employmentType}
                onChange={e => updateField('employmentType', e.target.value)}
              >
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Preferences */}
        <div className="cand-review-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 700, color: '#09090b', marginBottom: '4px' }}>
            <MapPin size={16} /> Job Preferences
          </div>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
            Help us find the right opportunities for you.
          </p>

          <div className="cand-form-grid single-col" style={{ gap: '12px', marginBottom: 0 }}>
            <div className="cand-field-group">
              <label className="cand-field-label">Preferred Locations</label>
              <select
                className="cand-input"
                defaultValue="Bangalore, Hyderabad, Remote"
              >
                <option value="Bangalore, Hyderabad, Remote">Bangalore, Hyderabad, Remote</option>
                <option value="Pune, Mumbai">Pune, Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="All India Remote">All India (Remote)</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Work Type</label>
              <select
                className="cand-input"
                value={formData.workType}
                onChange={e => updateField('workType', e.target.value)}
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Preferred Shifts</label>
              <select
                className="cand-input"
                value={formData.preferredShifts}
                onChange={e => updateField('preferredShifts', e.target.value)}
              >
                <option value="Day">Day</option>
                <option value="Flexible">Flexible</option>
                <option value="Night">Night</option>
                <option value="Any">Any</option>
              </select>
            </div>

            <div className="cand-field-group">
              <label className="cand-field-label">Expected CTC (Annual)</label>
              <select
                className="cand-input"
                value={formData.expectedCtc}
                onChange={e => updateField('expectedCtc', e.target.value)}
              >
                <option value="₹3 - ₹6 LPA">₹3 - ₹6 LPA</option>
                <option value="₹6 - ₹10 LPA">₹6 - ₹10 LPA</option>
                <option value="₹10 - ₹15 LPA">₹10 - ₹15 LPA</option>
                <option value="₹15+ LPA">₹15+ LPA</option>
              </select>
            </div>
          </div>
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

      {/* Add Experience Modal */}
      {showExpModal && (
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
          onClick={() => setShowExpModal(false)}
        >
          <form
            onSubmit={handleAddExperience}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>Add Experience</h4>
            <input
              type="text"
              className="cand-input"
              placeholder="Job Title / Role"
              value={expTitle}
              onChange={e => setExpTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className="cand-input"
              placeholder="Company Name"
              value={expComp}
              onChange={e => setExpComp(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowExpModal(false)}>Cancel</button>
              <button type="submit" className="cand-btn-primary">Save Experience</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjModal && (
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
          onClick={() => setShowProjModal(false)}
        >
          <form
            onSubmit={handleAddProject}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>Add Project</h4>
            <input
              type="text"
              className="cand-input"
              placeholder="Project Title"
              value={projTitle}
              onChange={e => setProjTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className="cand-input"
              placeholder="Tech Stack (e.g. React, TypeScript, Python)"
              value={projTech}
              onChange={e => setProjTech(e.target.value)}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="cand-btn-back" onClick={() => setShowProjModal(false)}>Cancel</button>
              <button type="submit" className="cand-btn-primary">Save Project</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
