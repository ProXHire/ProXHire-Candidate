import type { CandidateNotificationItem } from '../types/notification'

const STORAGE_KEY = 'proxhire_candidate_notifications_v1'

export const INITIAL_MOCK_NOTIFICATIONS: CandidateNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Technical Round 1 Scheduled',
    message: "Google's engineering team has confirmed your Round 1 Technical Interview for Senior Frontend Engineer.",
    detail: 'Tomorrow, 2:30 PM - 3:30 PM IST • Google Meet • Host: Rajesh K.',
    timeAgo: '12m ago',
    timestamp: Date.now() - 12 * 60 * 1000,
    isRead: false,
    category: 'interview',
    company: 'Google',
    role: 'Senior Frontend Engineer',
    badge: {
      label: 'Interview Scheduled',
      bg: '#f3e8ff',
      text: '#7e22ce'
    },
    actionTarget: {
      nav: 'Applied Jobs',
      label: 'View Schedule'
    }
  },
  {
    id: 'notif-2',
    title: 'Application Shortlisted 🎉',
    message: 'Great news! Swiggy reviewed your profile and shortlisted you for Full Stack Developer (React / Node.js).',
    detail: 'Bengaluru (Hybrid) • ₹24 - ₹30 LPA • Next: Hiring Manager Connect',
    timeAgo: '1h ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    category: 'application',
    company: 'Swiggy',
    role: 'Full Stack Developer',
    badge: {
      label: 'Shortlisted',
      bg: '#dcfce7',
      text: '#15803d'
    },
    actionTarget: {
      nav: 'Applied Jobs',
      label: 'Track Application'
    }
  },
  {
    id: 'notif-3',
    title: 'New High-Match Role (96% Fit)',
    message: 'Flipkart just posted a role matching your primary skills in React, TypeScript and Redux.',
    detail: 'UI/UX Engineer • Bellandur, Bengaluru • ₹22 - ₹32 LPA',
    timeAgo: '3h ago',
    timestamp: Date.now() - 3 * 3600 * 1000,
    isRead: false,
    category: 'job',
    company: 'Flipkart',
    role: 'UI/UX Engineer',
    badge: {
      label: '96% Match',
      bg: '#e0e7ff',
      text: '#4338ca'
    },
    actionTarget: {
      nav: 'Recommended Jobs',
      label: 'Explore Job'
    }
  },
  {
    id: 'notif-4',
    title: 'Recruiter Viewed Your Resume',
    message: 'A Senior Talent Acquisition Partner from Microsoft spent 2.5 minutes reviewing your candidate profile & portfolio.',
    detail: 'Candidate search query: "Senior React Developer Bengaluru"',
    timeAgo: '5h ago',
    timestamp: Date.now() - 5 * 3600 * 1000,
    isRead: false,
    category: 'profile',
    company: 'Microsoft',
    badge: {
      label: 'Profile View',
      bg: '#e0f2fe',
      text: '#0284c7'
    },
    actionTarget: {
      nav: 'Complete Profile',
      tab: 'profile',
      label: 'Polish Profile'
    }
  },
  {
    id: 'notif-5',
    title: 'Coding Assessment Invitation',
    message: 'Amazon invited you to complete a 45-minute Frontend & Problem Solving challenge.',
    detail: 'Expires on Friday 11:59 PM • 2 Coding questions + MCQ',
    timeAgo: '1 day ago',
    timestamp: Date.now() - 26 * 3600 * 1000,
    isRead: true,
    category: 'interview',
    company: 'Amazon',
    role: 'SDE II (Frontend)',
    badge: {
      label: 'Assessment',
      bg: '#fef3c7',
      text: '#b45309'
    },
    actionTarget: {
      nav: 'Applied Jobs',
      label: 'Open Assessment'
    }
  },
  {
    id: 'notif-6',
    title: 'Profile Optimization Tip',
    message: 'Adding expected CTC and preferred work arrangement increases your recruiter inbound interview invites by 3.4x.',
    detail: 'Takes less than 60 seconds to finish.',
    timeAgo: '2 days ago',
    timestamp: Date.now() - 48 * 3600 * 1000,
    isRead: true,
    category: 'profile',
    badge: {
      label: 'Recommendation',
      bg: '#f1f5f9',
      text: '#475569'
    },
    actionTarget: {
      nav: 'Complete Profile',
      tab: 'career',
      label: 'Update Preferences'
    }
  },
  {
    id: 'notif-7',
    title: 'Application Received & In Review',
    message: 'Your job application for Frontend Architect has reached Zomato recruitment team.',
    detail: 'Application ID: #ZM-84920 • Applied via proXhire',
    timeAgo: '3 days ago',
    timestamp: Date.now() - 72 * 3600 * 1000,
    isRead: true,
    category: 'application',
    company: 'Zomato',
    role: 'Frontend Architect',
    badge: {
      label: 'Under Review',
      bg: '#ede9fe',
      text: '#6d28d9'
    },
    actionTarget: {
      nav: 'Applied Jobs',
      label: 'View Boarding Pass'
    }
  }
]

export const loadStoredNotifications = (): CandidateNotificationItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      saveNotifications(INITIAL_MOCK_NOTIFICATIONS)
      return INITIAL_MOCK_NOTIFICATIONS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return INITIAL_MOCK_NOTIFICATIONS
  } catch (e) {
    console.error('Error loading notifications from localStorage', e)
    return INITIAL_MOCK_NOTIFICATIONS
  }
}

export const saveNotifications = (notifications: CandidateNotificationItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  } catch (e) {
    console.error('Error saving notifications to localStorage', e)
  }
}

export const resetStoredNotifications = (): CandidateNotificationItem[] => {
  saveNotifications(INITIAL_MOCK_NOTIFICATIONS)
  return INITIAL_MOCK_NOTIFICATIONS
}
