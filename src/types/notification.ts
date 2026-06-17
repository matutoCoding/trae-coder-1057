export type NotificationType = 'booking_submitted' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'step_approved' | 'step_rejected'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  bookingId: string
  bookingTitle: string
  handlerName?: string
  result?: 'approved' | 'rejected' | 'pending' | 'cancelled'
  read: boolean
  createdAt: string
}
