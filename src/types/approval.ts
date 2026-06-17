export interface ApprovalRecord {
  id: string
  bookingId: string
  bookingTitle: string
  applicantName: string
  applicantDepartment: string
  date: string
  startTime: string
  endTime: string
  attendeeCount: number
  role: 'department_head' | 'admin' | 'it'
  roleName: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  comment?: string
  createdAt: string
  approvedAt?: string
}

export type ApprovalType = 'pending' | 'approved' | 'rejected' | 'cancelled'
