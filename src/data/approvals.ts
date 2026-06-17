import { ApprovalRecord } from '@/types/approval'
import { getToday } from '@/utils/date'

const today = getToday()

export const mockApprovals: ApprovalRecord[] = [
  {
    id: 'approval-001',
    bookingId: 'booking-002',
    bookingTitle: '技术架构评审',
    applicantName: '刘工',
    applicantDepartment: '技术部',
    date: today,
    startTime: '14:00',
    endTime: '16:00',
    attendeeCount: 10,
    role: 'department_head',
    roleName: '部门负责人',
    status: 'pending',
    createdAt: '2024-01-16 09:00'
  },
  {
    id: 'approval-002',
    bookingId: 'booking-003',
    bookingTitle: '新员工入职培训',
    applicantName: '赵经理',
    applicantDepartment: '人力资源部',
    date: today,
    startTime: '10:00',
    endTime: '12:00',
    attendeeCount: 15,
    role: 'admin',
    roleName: '行政',
    status: 'pending',
    createdAt: '2024-01-14 15:00'
  },
  {
    id: 'approval-003',
    bookingId: 'booking-006',
    bookingTitle: '销售业绩复盘',
    applicantName: '冯经理',
    applicantDepartment: '销售部',
    date: today,
    startTime: '09:30',
    endTime: '11:00',
    attendeeCount: 8,
    role: 'admin',
    roleName: '行政',
    status: 'pending',
    createdAt: '2024-01-15 15:00'
  },
  {
    id: 'approval-004',
    bookingId: 'booking-001',
    bookingTitle: '产品部周会',
    applicantName: '张明',
    applicantDepartment: '产品部',
    date: today,
    startTime: '09:00',
    endTime: '10:00',
    attendeeCount: 6,
    role: 'department_head',
    roleName: '部门负责人',
    status: 'approved',
    comment: '同意',
    createdAt: '2024-01-15 14:00',
    approvedAt: '2024-01-15 16:30'
  },
  {
    id: 'approval-005',
    bookingId: 'booking-004',
    bookingTitle: '季度总结大会',
    applicantName: '周总',
    applicantDepartment: '总经办',
    date: today,
    startTime: '14:00',
    endTime: '17:00',
    attendeeCount: 50,
    role: 'it',
    roleName: 'IT支持',
    status: 'approved',
    comment: '技术设备已调试完成',
    createdAt: '2024-01-09 16:00',
    approvedAt: '2024-01-10 11:00'
  },
  {
    id: 'approval-006',
    bookingId: 'booking-005',
    bookingTitle: '市场推广方案讨论',
    applicantName: '吴经理',
    applicantDepartment: '市场部',
    date: today,
    startTime: '15:30',
    endTime: '17:00',
    attendeeCount: 5,
    role: 'department_head',
    roleName: '部门负责人',
    status: 'rejected',
    comment: '时间与其他重要会议冲突，请调整时间',
    createdAt: '2024-01-15 10:00',
    approvedAt: '2024-01-15 14:00'
  },
  {
    id: 'approval-007',
    bookingId: 'booking-008',
    bookingTitle: '客户演示会',
    applicantName: '韩经理',
    applicantDepartment: '销售部',
    date: today,
    startTime: '10:30',
    endTime: '12:00',
    attendeeCount: 8,
    role: 'admin',
    roleName: '行政',
    status: 'approved',
    comment: '已安排茶水',
    createdAt: '2024-01-13 16:00',
    approvedAt: '2024-01-14 10:30'
  },
  {
    id: 'approval-008',
    bookingId: 'booking-007',
    bookingTitle: '面试 - 高级前端工程师',
    applicantName: '蒋经理',
    applicantDepartment: '技术部',
    date: today,
    startTime: '14:30',
    endTime: '15:30',
    attendeeCount: 3,
    role: 'department_head',
    roleName: '部门负责人',
    status: 'approved',
    comment: '同意',
    createdAt: '2024-01-14 17:00',
    approvedAt: '2024-01-15 09:00'
  },
  {
    id: 'approval-009',
    bookingId: 'booking-007',
    bookingTitle: '面试 - 高级前端工程师',
    applicantName: '蒋经理',
    applicantDepartment: '技术部',
    date: today,
    startTime: '14:30',
    endTime: '15:30',
    attendeeCount: 3,
    role: 'admin',
    roleName: '行政',
    status: 'cancelled',
    comment: '预约已取消',
    createdAt: '2024-01-14 17:00',
    approvedAt: '2024-01-15 11:00'
  },
  {
    id: 'approval-010',
    bookingId: 'booking-007',
    bookingTitle: '面试 - 高级前端工程师',
    applicantName: '蒋经理',
    applicantDepartment: '技术部',
    date: today,
    startTime: '14:30',
    endTime: '15:30',
    attendeeCount: 3,
    role: 'it',
    roleName: 'IT支持',
    status: 'cancelled',
    comment: '预约已取消',
    createdAt: '2024-01-14 17:00',
    approvedAt: '2024-01-15 11:00'
  }
]

export const getApprovalsByStatus = (status: 'pending' | 'approved' | 'rejected'): ApprovalRecord[] => {
  return mockApprovals.filter(approval => approval.status === status)
}

export const getApprovalById = (id: string): ApprovalRecord | undefined => {
  return mockApprovals.find(approval => approval.id === id)
}

export const getApprovalCountByStatus = (status: 'pending' | 'approved' | 'rejected'): number => {
  return mockApprovals.filter(approval => approval.status === status).length
}
