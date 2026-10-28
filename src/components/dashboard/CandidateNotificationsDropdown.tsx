import React, { useState, useMemo } from 'react'
import {
  Bell,
  CheckCheck,
  X,
  Calendar,
  CheckCircle2,
  Sparkles,
  Eye,
  Briefcase,
  ArrowRight,
  Trash2,
  RotateCcw,
  Clock,
  Layers,
  Inbox
} from 'lucide-react'
import type { CandidateNotificationItem, NotificationCategory } from '../../types/notification'

interface CandidateNotificationsDropdownProps {
  notifications: CandidateNotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDismiss: (id: string) => void
  onClearAll: () => void
  onResetDemo: () => void
  onActionClick: (target: NonNullable<CandidateNotificationItem['actionTarget']>) => void
  onClose: () => void
}

export const CandidateNotificationsDropdown: React.FC<CandidateNotificationsDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  onResetDemo,
  onActionClick,
  onClose
}) => {
  const [selectedFilter, setSelectedFilter] = useState<NotificationCategory>('all')

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  )

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: unreadCount,
      interview: notifications.filter(n => n.category === 'interview').length,
      application: notifications.filter(n => n.category === 'application').length,
      job: notifications.filter(n => n.category === 'job').length,
      profile: notifications.filter(n => n.category === 'profile').length
    }
  }, [notifications, unreadCount])

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications
    if (selectedFilter === 'unread') return notifications.filter(n => !n.isRead)
    return notifications.filter(n => n.category === selectedFilter)
  }, [notifications, selectedFilter])

  const getCategoryIcon = (category: CandidateNotificationItem['category'], isRead: boolean) => {
    switch (category) {
      case 'interview':
        return (
          <div className="cand-notif-icon-circle interview">
            <Calendar size={16} />
          </div>
        )
      case 'application':
        return (
          <div className="cand-notif-icon-circle application">
            <CheckCircle2 size={16} />
          </div>
        )
      case 'job':
        return (
          <div className="cand-notif-icon-circle job">
            <Sparkles size={16} />
          </div>
        )
      case 'profile':
        return (
          <div className="cand-notif-icon-circle profile">
            <Eye size={16} />
          </div>
        )
      default:
        return (
          <div className="cand-notif-icon-circle default">
            <Bell size={16} />
          </div>
        )
    }
  }

  return (
    <div
      className="cand-notification-dropdown"
      role="region"
      aria-label="Candidate Notifications Panel"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="cand-notif-header">
        <div className="cand-notif-header-title">
          <div className="cand-notif-header-bell-wrap">
            <Bell size={18} />
            {unreadCount > 0 && <span className="cand-notif-header-ping" />}
          </div>
          <span className="cand-notif-title-text">Notifications</span>
          {unreadCount > 0 ? (
            <span className="cand-notif-unread-pill">
              {unreadCount} new
            </span>
          ) : (
            <span className="cand-notif-all-read-pill">
              All caught up
            </span>
          )}
        </div>

        <div className="cand-notif-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="cand-notif-mark-all-btn"
              onClick={onMarkAllAsRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
          <button
            type="button"
            className="cand-notif-close-btn"
            onClick={onClose}
            aria-label="Close notifications panel"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="cand-notif-tabs-bar">
        {(
          [
            { id: 'all', label: 'All', count: counts.all },
            { id: 'unread', label: 'Unread', count: counts.unread },
            { id: 'interview', label: 'Interviews', count: counts.interview },
            { id: 'application', label: 'Applications', count: counts.application },
            { id: 'job', label: 'Job Alerts', count: counts.job },
            { id: 'profile', label: 'Profile', count: counts.profile }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`cand-notif-tab ${selectedFilter === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedFilter(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`cand-notif-tab-badge ${selectedFilter === tab.id ? 'active' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="cand-notif-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="cand-notif-empty-state">
            <div className="cand-notif-empty-icon-wrap">
              <Inbox size={32} />
            </div>
            <h4 className="cand-notif-empty-title">
              {selectedFilter === 'unread'
                ? "No unread notifications"
                : selectedFilter === 'all'
                ? "You're completely caught up!"
                : `No ${selectedFilter} notifications`}
            </h4>
            <p className="cand-notif-empty-desc">
              {selectedFilter === 'unread'
                ? "You have reviewed all your latest job alerts, interviews, and updates."
                : "Important updates regarding your applications, interview invites, and job matches will appear here."}
            </p>
            {notifications.length === 0 && (
              <button
                type="button"
                className="cand-notif-restore-demo-btn"
                onClick={onResetDemo}
              >
                <RotateCcw size={14} />
                <span>Restore Demo Notifications</span>
              </button>
            )}
          </div>
        ) : (
          <div className="cand-notif-list">
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                className={`cand-notif-item ${notif.isRead ? 'read' : 'unread'}`}
                onClick={() => {
                  if (!notif.isRead) {
                    onMarkAsRead(notif.id)
                  }
                }}
              >
                {/* Category Icon */}
                <div className="cand-notif-item-left">
                  {getCategoryIcon(notif.category, notif.isRead)}
                </div>

                {/* Content */}
                <div className="cand-notif-item-main">
                  <div className="cand-notif-item-header">
                    <div className="cand-notif-badges-row">
                      {notif.badge && (
                        <span
                          className="cand-notif-category-chip"
                          style={{
                            backgroundColor: notif.badge.bg,
                            color: notif.badge.text
                          }}
                        >
                          {notif.badge.label}
                        </span>
                      )}
                      {notif.company && (
                        <span className="cand-notif-company-chip">
                          <Briefcase size={11} style={{ marginRight: '3px' }} />
                          {notif.company}
                        </span>
                      )}
                    </div>

                    <div className="cand-notif-time-wrap">
                      <Clock size={11} />
                      <span>{notif.timeAgo}</span>
                    </div>
                  </div>

                  <div className="cand-notif-item-title-row">
                    <h5 className="cand-notif-item-title">
                      {notif.title}
                    </h5>
                    {!notif.isRead && (
                      <span className="cand-notif-unread-dot" title="Unread" />
                    )}
                  </div>

                  <p className="cand-notif-item-message">
                    {notif.message}
                  </p>

                  {notif.detail && (
                    <div className="cand-notif-item-detail-box">
                      <span>{notif.detail}</span>
                    </div>
                  )}

                  {/* Quick Action Button & Dismiss */}
                  <div className="cand-notif-item-footer">
                    {notif.actionTarget ? (
                      <button
                        type="button"
                        className="cand-notif-action-btn"
                        onClick={e => {
                          e.stopPropagation()
                          if (!notif.isRead) onMarkAsRead(notif.id)
                          if (notif.actionTarget) onActionClick(notif.actionTarget)
                        }}
                      >
                        <span>{notif.actionTarget.label}</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : <div />}

                    <div className="cand-notif-item-actions">
                      <button
                        type="button"
                        className="cand-notif-dismiss-btn"
                        onClick={e => {
                          e.stopPropagation()
                          onDismiss(notif.id)
                        }}
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="cand-notif-footer">
        <div className="cand-notif-footer-summary">
          <span>{notifications.length} notification{notifications.length === 1 ? '' : 's'}</span>
          {unreadCount > 0 && <span> • {unreadCount} unread</span>}
        </div>

        <div className="cand-notif-footer-actions">
          {notifications.length > 0 && (
            <button
              type="button"
              className="cand-notif-footer-link"
              onClick={onClearAll}
              title="Clear all notifications"
            >
              Clear all
            </button>
          )}

          <button
            type="button"
            className="cand-notif-footer-link demo"
            onClick={onResetDemo}
            title="Reset to default mock notifications"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  )
}
