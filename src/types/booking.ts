import { BookingStatus } from './room'

export interface Booking {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  attendeeCount: number
  roomId?: string
  roomName?: string
  applicantId: string
  applicantName: string
  applicantDepartment: string
  status: BookingStatus
  approvalFlow: ApprovalStep[]
  currentStep: number
  createdAt: string
  updatedAt: string
  facilities?: string[]
  needProjector?: boolean
  needWhiteboard?: boolean
  needVideoConference?: boolean
}

export interface ApprovalStep {
  id: string
  role: 'department_head' | 'admin' | 'it'
  roleName: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  approvedAt?: string
  order: number
}

export interface CreateBookingRequest {
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  attendeeCount: number
  facilities?: string[]
  needProjector?: boolean
  needWhiteboard?: boolean
  needVideoConference?: boolean
}
