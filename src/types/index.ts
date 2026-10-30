export type CandidateStep = 1 | 2 | 3 | 4 | 5 | 6

export type ExperienceCategory = 'fresher' | 'experienced'

export interface EducationItem {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: string
  endYear: string
  gradeOrCgpa: string
}

export interface ExperienceItem {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

export interface ProjectItem {
  id: string
  title: string
  role: string
  techStack: string
  description: string
  link?: string
}

export interface CandidateRegistrationState {
  // Step 1: Experience Category
  experienceCategory: ExperienceCategory

  // Step 2: Basic Account Details
  fullName: string
  email: string
  countryCode: string
  mobileNumber: string
  panNumber?: string
  password: string
  confirmPassword: string
  preBgvConsent: boolean
  agreeTerms: boolean

  // Step 3: Resume, Education & Skills
  resumeFileName?: string
  resumeDataUrl?: string
  resumeUrl?: string
  resumeFileType?: string
  resumeFileSize?: number
  parsedResumeJson?: any
  parserMethod?: string
  rawResumeText?: string
  profileSummary: string
  educations: EducationItem[]
  skills: string[]

  // Step 4: Employment, Projects & Career Profile
  experiences: ExperienceItem[]
  projects: ProjectItem[]
  preferredRole: string
  industry: string
  department: string
  employmentType: string
  preferredLocations: string[]
  workType: string
  preferredShifts: string
  expectedCtc: string

  // Step 5: Personal Details & Additional Info
  dateOfBirth: string
  nationality: string
  gender: string
  category: string
  maritalStatus: string
  workPermit: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pinCode: string
  hasDisability: string
  hasCareerGap: string
  govtExperience: string
  openToRelocate: string
  linkedInUrl: string
  gitHubUrl: string
  portfolioUrl: string
  achievements: string[]

  // Step 6: Confirmation
  finalConfirmed: boolean
}

export interface JobCardData {
  id: string
  company: string
  companyLogoText: string
  role: string
  location: string
  workType: 'On-site' | 'Hybrid' | 'Remote'
  jobType: string
  experienceLevel: string
  experienceYears: string
  tags: string[]
  extraTagsCount: number
  postedTime: string
  isSaved?: boolean
  salary?: string
  description?: string
  atsScore?: number
  atsBreakdown?: any
}

export type ApplicationStatusType =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Hired'
  | 'Rejected'
  | 'Applied'

export interface ApplicationRowData {
  id: string
  jobId?: string
  jobTitle: string
  company: string
  companyLogoText?: string
  location?: string
  appliedOn: string
  appliedAt?: string
  status: ApplicationStatusType
  flightNumber?: string
  seat?: string
  gate?: string
  ticketNumber?: string
  salary?: string
  candidateName?: string
  candidateCity?: string
  reviewNotes?: string
  atsScore?: number
  atsBreakdown?: any
}

export * from './notification'
