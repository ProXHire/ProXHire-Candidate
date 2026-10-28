export type NotificationCategory = 'all' | 'unread' | 'interview' | 'application' | 'job' | 'profile'

export type NotificationBadgeType = 'interview' | 'shortlisted' | 'match' | 'profile' | 'assessment' | 'info'

export interface CandidateNotificationItem {
  id: string
  title: string
  message: string
  detail?: string
  timeAgo: string
  timestamp: number
  isRead: boolean
  category: 'interview' | 'application' | 'job' | 'profile'
  company?: string
  role?: string
  badge?: {
    label: string
    bg: string
    text: string
  }
  actionTarget?: {
    nav: 'Dashboard' | 'Find Jobs' | 'Recommended Jobs' | 'Saved Jobs' | 'Applied Jobs' | 'Complete Profile'
    tab?: 'profile' | 'career' | 'personal' | 'review'
    jobId?: string
    label: string
  }
}
