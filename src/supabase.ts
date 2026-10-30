import { createClient } from '@supabase/supabase-js'
import type { CandidateRegistrationState, JobCardData } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!url && !url.includes('placeholder') && !!key && !key.includes('placeholder')
}

/**
 * Uploads a candidate's resume document directly to Supabase Storage bucket 'resumes'
 * and records it in the 'resumes' database table.
 */
export async function uploadResumeToSupabaseStorage(
  file: File,
  candidateEmail: string,
  candidateName?: string,
  metadata?: {
    parsedResumeJson?: any
    parserMethod?: string
    rawText?: string
  }
): Promise<{
  success: boolean
  url?: string
  storagePath?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  error?: string
}> {
  const cleanEmail = candidateEmail.trim().toLowerCase()
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `candidates/${cleanEmail}/${Date.now()}_${sanitizedFileName}`

  if (!isSupabaseConfigured()) {
    console.info('ℹ️ Supabase not yet configured with live keys. Resume file cached locally.')
    return {
      success: false,
      error: 'Supabase credentials pending in .env',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
    }
  }

  try {
    // 1. Upload binary file to Supabase Storage bucket 'resumes'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/pdf',
      })

    if (uploadError) {
      console.warn('Supabase storage upload notice:', uploadError.message)
      throw uploadError
    }

    // 2. Obtain permanent public download URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(uploadData?.path || storagePath)

    const publicUrl = urlData.publicUrl

    // 3. Record metadata in Supabase 'resumes' table
    try {
      await supabase.from('resumes').insert({
        candidate_email: cleanEmail,
        candidate_name: candidateName || null,
        file_name: file.name,
        file_url: publicUrl,
        storage_path: uploadData?.path || storagePath,
        file_size: file.size,
        mime_type: file.type || 'application/pdf',
        is_active: true,
        ...(metadata?.parsedResumeJson ? { parsed_resume_json: metadata.parsedResumeJson } : {}),
        ...(metadata?.parserMethod ? { parser_method: metadata.parserMethod } : {}),
        ...(metadata?.rawText ? { raw_text: metadata.rawText } : {}),
      })
    } catch (tableErr: any) {
      console.warn('Could not insert into resumes table (storage upload succeeded):', tableErr.message)
    }

    console.log('✅ [Supabase Storage] Resume uploaded successfully to:', publicUrl)
    return {
      success: true,
      url: publicUrl,
      storagePath: uploadData?.path || storagePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
    }
  } catch (err: any) {
    console.error('❌ [Supabase Resume Upload Error]:', err)
    return {
      success: false,
      error: err.message || 'Failed to upload resume to Supabase Storage',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
    }
  }
}

/**
 * Synchronizes complete candidate profile data to Supabase 'candidates' table.
 * Splits full_name into first_name and last_name and populates username.
 */
export async function syncCandidateToSupabase(
  formData: CandidateRegistrationState,
  userId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!formData.email) {
    return { success: false, error: 'Email is required' }
  }

  const cleanEmail = formData.email.trim().toLowerCase()
  const cleanMobile = formData.mobileNumber ? formData.mobileNumber.replace(/[\s\-\+]/g, '') : ''
  const last10 = cleanMobile.slice(-10)

  // Parse first and last names
  const nameParts = (formData.fullName || '').trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  const username = cleanEmail.split('@')[0] || `cand_${Date.now()}`

  const candidateRow = {
    user_id: userId || null,
    username,
    first_name: firstName,
    last_name: lastName,
    full_name: (formData.fullName || '').trim(),
    email: cleanEmail,
    country_code: formData.countryCode || '+91',
    mobile_number: (formData.mobileNumber || '').trim(),
    normalized_mobile: last10,
    pan_number: formData.panNumber ? formData.panNumber.trim().toUpperCase() : null,
    pan_masked: formData.panNumber ? `XXXXXX${formData.panNumber.trim().toUpperCase().slice(-4)}` : null,
    experience_category: formData.experienceCategory || 'fresher',
    work_experience: formData.experiences && formData.experiences[0]?.jobTitle
      ? `${formData.experiences[0].jobTitle} (${formData.experiences[0].company || ''})`
      : formData.experienceCategory === 'fresher' ? 'Fresher (0 Years)' : '1 - 3 Years',
    highest_education: formData.educations && formData.educations[0]?.degree ? formData.educations[0].degree : 'Graduate',
    preferred_role: formData.preferredRole || formData.department || 'Software Engineer',
    industry: formData.industry || 'Information Technology',
    department: formData.department || 'Engineering',
    employment_type: formData.employmentType || 'Full Time',
    work_type: formData.workType || 'Hybrid',
    preferred_shifts: formData.preferredShifts || 'Day',
    expected_ctc: formData.expectedCtc || '',
    city: formData.city || 'Bengaluru',
    state: formData.state || 'Karnataka',
    pin_code: formData.pinCode || '',
    address_line1: formData.addressLine1 || '',
    address_line2: formData.addressLine2 || '',
    date_of_birth: formData.dateOfBirth || '',
    gender: formData.gender || '',
    nationality: formData.nationality || 'Indian',
    marital_status: formData.maritalStatus || '',
    work_permit: formData.workPermit || 'Yes',
    has_disability: formData.hasDisability || 'No',
    has_career_gap: formData.hasCareerGap || 'No',
    govt_experience: formData.govtExperience || 'No',
    open_to_relocate: formData.openToRelocate || 'Yes',
    linkedin_url: formData.linkedInUrl || '',
    github_url: formData.gitHubUrl || '',
    portfolio_url: formData.portfolioUrl || '',
    profile_summary: formData.profileSummary || '',
    skills: formData.skills || [],
    educations: formData.educations || [],
    experiences: formData.experiences || [],
    projects: formData.projects || [],
    achievements: formData.achievements || [],
    has_resume: Boolean(formData.resumeFileName || formData.resumeUrl),
    resume_file_name: formData.resumeFileName || null,
    resume_file_type: formData.resumeFileType || 'application/pdf',
    resume_file_size: formData.resumeFileSize || 0,
    resume_url: formData.resumeUrl || null,
    resume_data_url: formData.resumeDataUrl && formData.resumeDataUrl.length < 500000 ? formData.resumeDataUrl : null,
    parsed_resume_json: formData.parsedResumeJson || null,
    parser_method: formData.parserMethod || 'pdf-stream-extractor',
    raw_text: formData.rawResumeText || null,
    status: 'new',
    bgv_status: 'BASIC_VERIFIED',
    viewed: false,
    updated_at: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) {
    console.info('ℹ️ Supabase not yet connected in .env. Candidate stored in local cache.')
    return { success: true, data: candidateRow }
  }

  try {
    const { data, error } = await supabase
      .from('candidates')
      .upsert(candidateRow, { onConflict: 'email' })
      .select()

    if (error) {
      console.warn('Supabase candidate upsert error:', error.message)
      throw error
    }

    console.log(`✅ [Supabase Candidate Sync] Successfully synced candidate ${cleanEmail} to Supabase database!`)
    return { success: true, data }
  } catch (err: any) {
    console.error('❌ [Supabase Candidate Sync Exception]:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Candidate Login lookup against Supabase database
 */
export async function loginCandidateWithSupabase(
  identifier: string,
  _pass: string
): Promise<{ success: boolean; candidate?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' }
  }

  const cleanInput = identifier.trim()
  const isEmail = cleanInput.includes('@')
  const cleanMobile = cleanInput.replace(/[\s\-\+]/g, '').slice(-10)

  try {
    let query = supabase.from('candidates').select('*')
    if (isEmail) {
      query = query.eq('email', cleanInput.toLowerCase())
    } else {
      query = query.or(`normalized_mobile.eq.${cleanMobile},mobile_number.ilike.%${cleanMobile}%`)
    }

    const { data, error } = await query.limit(1).maybeSingle()
    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'No candidate record found in Supabase' }
    }

    return { success: true, candidate: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Submit candidate job application to Supabase 'applications' table
 */
export async function submitApplicationToSupabase(
  appData: {
    jobId: string
    jobTitle: string
    candidateId?: string
    candidateName: string
    candidateEmail: string
    candidateMobile?: string
    candidateLocation?: string
    candidateExperience?: string
    companyName: string
    resumeUrl?: string
    resumeFileName?: string
    flightNumber?: string
    ticketNumber?: string
    atsScore?: number
    atsBreakdown?: any
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }

  try {
    const row = {
      job_id: appData.jobId,
      job_title: appData.jobTitle,
      candidate_id: appData.candidateId || null,
      candidate_name: appData.candidateName,
      candidate_email: appData.candidateEmail.trim().toLowerCase(),
      candidate_mobile: appData.candidateMobile || null,
      candidate_location: appData.candidateLocation || 'Bengaluru',
      candidate_experience: appData.candidateExperience || 'Fresher',
      company_name: appData.companyName,
      resume_url: appData.resumeUrl || null,
      resume_file_name: appData.resumeFileName || null,
      flight_number: appData.flightNumber || null,
      ticket_number: appData.ticketNumber || null,
      ats_score: typeof appData.atsScore === 'number' ? appData.atsScore : 0,
      ats_breakdown: appData.atsBreakdown || null,
      status: 'Submitted',
      applied_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from('applications').insert(row).select()
    if (error) throw error
    return { success: true, data }
  } catch (err: any) {
    console.warn('Supabase application submit note:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Fetch published jobs from Supabase 'jobs' table
 */
export async function fetchPublishedJobsFromSupabase(): Promise<JobCardData[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .or('status.eq.PUBLISHED,status.eq.published')
      .order('posted_at', { ascending: false })

    if (error || !data) return []

    return data.map((d: any) => {
      const companyName = d.company_name || 'Verified Employer'
      const logoText = d.company_logo_text || companyName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PROX'
      return {
        id: d.id,
        company: companyName,
        companyLogoText: logoText,
        role: d.title || 'Software Engineer',
        location: d.location || 'Bengaluru, Karnataka',
        workType: (d.work_mode || 'Hybrid') as any,
        jobType: d.job_type || 'Full Time',
        experienceLevel: (d.experience && d.experience.includes('Senior') ? 'Senior Level' : 'Mid Level') as any,
        experienceYears: d.experience || '2-5 Yrs',
        tags: Array.isArray(d.required_skills) && d.required_skills.length > 0 ? d.required_skills : (Array.isArray(d.tags) ? d.tags : ['Engineering']),
        extraTagsCount: 0,
        postedTime: d.posted_time || 'Recent',
        isSaved: false,
        salary: d.salary || '₹12 - ₹18 LPA',
        description: d.description || undefined,
      }
    })
  } catch {
    return []
  }
}

/**
 * Supabase Password Reset Function
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Password reset links are sent via email. Please enter a valid email address (e.g. name@domain.com).')
  }

  if (isSupabaseConfigured()) {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    })

    if (error) {
      console.warn('Supabase resetPasswordForEmail notice:', error.message)
      if (error.message.toLowerCase().includes('rate limit')) {
        throw new Error('Too many reset requests. Please wait a few moments before trying again.')
      }
    }

    return {
      success: true,
      message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
    }
  }

  return {
    success: true,
    message: `If an account exists for ${cleanEmail}, instructions have been sent.`,
  }
}
