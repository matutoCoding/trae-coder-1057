export type NotificationType =
  | 'booking_submitted'
  | 'booking_approved'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'step_approved'
  | 'step_rejected'

export type NotificationResult = 'submitted' | 'approved' | 'rejected' | 'cancelled'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  bookingId: string
  bookingTitle: string
  handlerName: string
  result: NotificationResult
  read: boolean
  createdAt: string
}
