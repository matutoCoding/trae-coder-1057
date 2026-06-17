import { Booking, ApprovalStep } from '@/types/booking'
import { BookingStatus } from '@/types/room'
import { getToday } from '@/utils/date'

const today = getToday()

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    title: '产品部周会',
    description: '讨论本周产品迭代计划',
    date: today,
    startTime: '09:00',
    endTime: '10:00',
    attendeeCount: 6,
    roomId: 'room-001',
    roomName: '创新会议室',
    applicantId: 'user-001',
    applicantName: '张明',
    applicantDepartment: '产品部',
    status: 'approved',
    currentStep: 3,
    approvalFlow: [
      {
        id: 'step-001',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-002',
        approverName: '李总',
        status: 'approved',
        comment: '同意',
        approvedAt: '2024-01-15 16:30',
        order: 1
      },
      {
        id: 'step-002',
        role: 'admin',
        roleName: '行政',
        approverId: 'user-003',
        approverName: '王姐',
        status: 'approved',
        comment: '已确认会议室安排',
        approvedAt: '2024-01-15 17:00',
        order: 2
      },
      {
        id: 'step-003',
        role: 'it',
        roleName: 'IT支持',
        approverId: 'user-004',
        approverName: '陈工',
        status: 'approved',
        comment: '设备已就绪',
        approvedAt: '2024-01-15 17:30',
        order: 3
      }
    ],
    createdAt: '2024-01-15 14:00',
    updatedAt: '2024-01-15 17:30',
    needProjector: true,
    needWhiteboard: true
  },
  {
    id: 'booking-002',
    title: '技术架构评审',
    description: '新系统技术方案评审会议',
    date: today,
    startTime: '14:00',
    endTime: '16:00',
    attendeeCount: 10,
    roomId: 'room-005',
    roomName: '协作会议室',
    applicantId: 'user-005',
    applicantName: '刘工',
    applicantDepartment: '技术部',
    status: 'pending',
    currentStep: 1,
    approvalFlow: [
      {
        id: 'step-004',
        role: 'department_head',
        roleName: '部门负责人',
        status: 'pending',
        order: 1
      },
      {
        id: 'step-005',
        role: 'admin',
        roleName: '行政',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-006',
        role: 'it',
        roleName: 'IT支持',
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-16 09:00',
    updatedAt: '2024-01-16 09:00',
    needProjector: true,
    needVideoConference: true
  },
  {
    id: 'booking-003',
    title: '新员工入职培训',
    description: '1月新员工入职培训',
    date: today,
    startTime: '10:00',
    endTime: '12:00',
    attendeeCount: 15,
    roomId: 'room-007',
    roomName: '智慧会议室',
    applicantId: 'user-006',
    applicantName: '赵经理',
    applicantDepartment: '人力资源部',
    status: 'pending',
    currentStep: 2,
    approvalFlow: [
      {
        id: 'step-007',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-007',
        approverName: '孙总',
        status: 'approved',
        comment: '同意',
        approvedAt: '2024-01-15 10:00',
        order: 1
      },
      {
        id: 'step-008',
        role: 'admin',
        roleName: '行政',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-009',
        role: 'it',
        roleName: 'IT支持',
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-14 15:00',
    updatedAt: '2024-01-15 10:00',
    needProjector: true,
    needWhiteboard: true,
    needVideoConference: false
  },
  {
    id: 'booking-004',
    title: '季度总结大会',
    description: 'Q4季度全员总结大会',
    date: today,
    startTime: '14:00',
    endTime: '17:00',
    attendeeCount: 50,
    roomId: 'room-004',
    roomName: '致远会议室',
    applicantId: 'user-008',
    applicantName: '周总',
    applicantDepartment: '总经办',
    status: 'approved',
    currentStep: 3,
    approvalFlow: [
      {
        id: 'step-010',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-009',
        approverName: '钱总',
        status: 'approved',
        comment: '同意',
        approvedAt: '2024-01-10 09:00',
        order: 1
      },
      {
        id: 'step-011',
        role: 'admin',
        roleName: '行政',
        approverId: 'user-003',
        approverName: '王姐',
        status: 'approved',
        comment: '场地已布置',
        approvedAt: '2024-01-10 10:00',
        order: 2
      },
      {
        id: 'step-012',
        role: 'it',
        roleName: 'IT支持',
        approverId: 'user-004',
        approverName: '陈工',
        status: 'approved',
        comment: '技术设备已调试完成',
        approvedAt: '2024-01-10 11:00',
        order: 3
      }
    ],
    createdAt: '2024-01-09 16:00',
    updatedAt: '2024-01-10 11:00',
    needProjector: true,
    needVideoConference: true
  },
  {
    id: 'booking-005',
    title: '市场推广方案讨论',
    description: '春节营销活动方案讨论',
    date: today,
    startTime: '15:30',
    endTime: '17:00',
    attendeeCount: 5,
    roomId: 'room-003',
    roomName: '灵感会议室',
    applicantId: 'user-010',
    applicantName: '吴经理',
    applicantDepartment: '市场部',
    status: 'rejected',
    currentStep: 1,
    approvalFlow: [
      {
        id: 'step-013',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-011',
        approverName: '郑总',
        status: 'rejected',
        comment: '时间与其他重要会议冲突，请调整时间',
        approvedAt: '2024-01-15 14:00',
        order: 1
      },
      {
        id: 'step-014',
        role: 'admin',
        roleName: '行政',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-015',
        role: 'it',
        roleName: 'IT支持',
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-15 10:00',
    updatedAt: '2024-01-15 14:00',
    needWhiteboard: true
  },
  {
    id: 'booking-006',
    title: '销售业绩复盘',
    description: '上月销售业绩分析与本月计划',
    date: today,
    startTime: '09:30',
    endTime: '11:00',
    attendeeCount: 8,
    roomId: 'room-002',
    roomName: '启航会议室',
    applicantId: 'user-012',
    applicantName: '冯经理',
    applicantDepartment: '销售部',
    status: 'pending',
    currentStep: 2,
    approvalFlow: [
      {
        id: 'step-016',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-013',
        approverName: '陈总',
        status: 'approved',
        comment: '同意',
        approvedAt: '2024-01-15 16:00',
        order: 1
      },
      {
        id: 'step-017',
        role: 'admin',
        roleName: '行政',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-018',
        role: 'it',
        roleName: 'IT支持',
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-15 15:00',
    updatedAt: '2024-01-15 16:00',
    needProjector: true
  },
  {
    id: 'booking-007',
    title: '面试 - 高级前端工程师',
    description: '技术一面',
    date: today,
    startTime: '14:30',
    endTime: '15:30',
    attendeeCount: 3,
    roomId: 'room-006',
    roomName: '专注会议室',
    applicantId: 'user-014',
    applicantName: '蒋经理',
    applicantDepartment: '技术部',
    status: 'cancelled',
    currentStep: 2,
    approvalFlow: [
      {
        id: 'step-019',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-002',
        approverName: '李总',
        status: 'approved',
        comment: '同意',
        approvedAt: '2024-01-15 09:00',
        order: 1
      },
      {
        id: 'step-020',
        role: 'admin',
        roleName: '行政',
        status: 'pending',
        order: 2
      },
      {
        id: 'step-021',
        role: 'it',
        roleName: 'IT支持',
        status: 'pending',
        order: 3
      }
    ],
    createdAt: '2024-01-14 17:00',
    updatedAt: '2024-01-15 11:00',
    needVideoConference: true
  },
  {
    id: 'booking-008',
    title: '客户演示会',
    description: '重要客户产品演示',
    date: today,
    startTime: '10:30',
    endTime: '12:00',
    attendeeCount: 8,
    roomId: 'room-007',
    roomName: '智慧会议室',
    applicantId: 'user-015',
    applicantName: '韩经理',
    applicantDepartment: '销售部',
    status: 'approved',
    currentStep: 3,
    approvalFlow: [
      {
        id: 'step-022',
        role: 'department_head',
        roleName: '部门负责人',
        approverId: 'user-013',
        approverName: '陈总',
        status: 'approved',
        comment: '重要客户，务必做好准备',
        approvedAt: '2024-01-14 10:00',
        order: 1
      },
      {
        id: 'step-023',
        role: 'admin',
        roleName: '行政',
        approverId: 'user-003',
        approverName: '王姐',
        status: 'approved',
        comment: '已安排茶水',
        approvedAt: '2024-01-14 10:30',
        order: 2
      },
      {
        id: 'step-024',
        role: 'it',
        roleName: 'IT支持',
        approverId: 'user-004',
        approverName: '陈工',
        status: 'approved',
        comment: '设备已提前调试',
        approvedAt: '2024-01-14 11:00',
        order: 3
      }
    ],
    createdAt: '2024-01-13 16:00',
    updatedAt: '2024-01-14 11:00',
    needProjector: true,
    needVideoConference: true
  }
]

export const getBookingsByDate = (date: string): Booking[] => {
  return mockBookings.filter(booking => booking.date === date)
}

export const getBookingsByRoom = (roomId: string, date?: string): Booking[] => {
  return mockBookings.filter(booking => {
    if (booking.roomId !== roomId) return false
    if (date && booking.date !== date) return false
    return true
  })
}

export const getBookingsByApplicant = (applicantId: string): Booking[] => {
  return mockBookings.filter(booking => booking.applicantId === applicantId)
}

export const getBookingById = (id: string): Booking | undefined => {
  return mockBookings.find(booking => booking.id === id)
}

export const getPendingApprovalBookings = (role: string): Booking[] => {
  return mockBookings.filter(booking => {
    if (booking.status !== 'pending') return false
    const currentStep = booking.approvalFlow.find(step => step.order === booking.currentStep)
    return currentStep && currentStep.role === role && currentStep.status === 'pending'
  })
}

export const getBookingStatusText = (status: BookingStatus): string => {
  const statusMap: Record<BookingStatus, string> = {
    pending: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消',
    completed: '已完成'
  }
  return statusMap[status] || '未知'
}
