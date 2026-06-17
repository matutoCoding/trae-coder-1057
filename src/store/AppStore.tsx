import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Booking, ApprovalStep } from '@/types/booking'
import { BookingStatus, RoomBookingSlot } from '@/types/room'
import { ApprovalRecord } from '@/types/approval'
import { Notification, NotificationType } from '@/types/notification'
import { mockBookings } from '@/data/bookings'
import { mockApprovals } from '@/data/approvals'
import { formatDateTime } from '@/utils/date'

const STORAGE_KEY_BOOKINGS = 'meeting_room_bookings'
const STORAGE_KEY_APPROVALS = 'meeting_room_approvals'
const STORAGE_KEY_NOTIFICATIONS = 'meeting_room_notifications'

interface AppStoreContextType {
  bookings: Booking[]
  approvals: ApprovalRecord[]
  notifications: Notification[]
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  approveStep: (bookingId: string, role: 'department_head' | 'admin' | 'it', comment?: string) => { success: boolean; message: string }
  rejectStep: (bookingId: string, role: 'department_head' | 'admin' | 'it', comment?: string) => { success: boolean; message: string }
  getBookingsByDate: (date: string) => Booking[]
  getBookingsByApplicant: (applicantId: string) => Booking[]
  getBookingsByRoom: (roomId: string, date?: string) => Booking[]
  getBookingsByDateRange: (roomId: string, startDate: string, endDate: string) => Booking[]
  getPendingApprovalsByRole: (role: 'department_head' | 'admin' | 'it') => ApprovalRecord[]
  getApprovalCountByStatus: (status: 'pending' | 'approved' | 'rejected' | 'cancelled') => number
  getRoomBookingsSlots: (roomId: string, date: string) => RoomBookingSlot[]
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  getUnreadNotificationCount: () => number
  clearAllData: () => void
}

const AppStoreContext = createContext<AppStoreContextType | null>(null)

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = Taro.getStorageSync(key)
    if (data && data !== '') {
      console.log(`[AppStore] 从 Storage 加载 ${key}:`, (data as string).length, '条')
      return JSON.parse(data) as T
    }
  } catch (e) {
    console.warn(`[AppStore] 加载 ${key} 失败:`, e)
  }
  console.log(`[AppStore] 使用默认数据 ${key}:`, (defaultValue as any[]).length, '条')
  return defaultValue
}

const saveToStorage = <T,>(key: string, data: T) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data))
    console.log(`[AppStore] 已同步到 Storage ${key}:`, (data as any[]).length, '条')
  } catch (e) {
    console.warn(`[AppStore] 保存 ${key} 失败:`, e)
  }
}

const buildNextApproval = (booking: Booking, nextStep: ApprovalStep): ApprovalRecord => ({
  id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  bookingId: booking.id,
  bookingTitle: booking.title,
  applicantName: booking.applicantName,
  applicantDepartment: booking.applicantDepartment,
  date: booking.date,
  startTime: booking.startTime,
  endTime: booking.endTime,
  attendeeCount: booking.attendeeCount,
  role: nextStep.role,
  roleName: nextStep.roleName,
  status: 'pending',
  createdAt: formatDateTime(new Date())
})

const buildNotification = (
  type: NotificationType,
  booking: Booking,
  handlerName?: string,
  result?: 'approved' | 'rejected' | 'cancelled'
): Notification => {
  const now = formatDateTime(new Date())
  const configs: Record<NotificationType, { title: string; content: string }> = {
    booking_submitted: {
      title: '预约已提交',
      content: `您的预约「${booking.title}」已提交，等待审批中`
    },
    booking_approved: {
      title: '预约已通过',
      content: `您的预约「${booking.title}」已通过全部审批，会议已生效`
    },
    booking_rejected: {
      title: '预约已拒绝',
      content: `您的预约「${booking.title}」被${handlerName || '审批人'}拒绝`
    },
    booking_cancelled: {
      title: '预约已取消',
      content: `您的预约「${booking.title}」已被取消`
    },
    step_approved: {
      title: '审批进度更新',
      content: `${handlerName || '审批人'}已通过您的预约「${booking.title}」`
    },
    step_rejected: {
      title: '审批进度更新',
      content: `${handlerName || '审批人'}已拒绝您的预约「${booking.title}」`
    }
  }
  const cfg = configs[type]
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: cfg.title,
    content: cfg.content,
    bookingId: booking.id,
    bookingTitle: booking.title,
    handlerName,
    result,
    read: false,
    createdAt: now
  }
}

const mockNotifications: Notification[] = []

export const AppStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(() =>
    loadFromStorage(STORAGE_KEY_BOOKINGS, [...mockBookings])
  )
  const [approvals, setApprovals] = useState<ApprovalRecord[]>(() =>
    loadFromStorage(STORAGE_KEY_APPROVALS, [...mockApprovals])
  )
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage(STORAGE_KEY_NOTIFICATIONS, [...mockNotifications])
  )

  useEffect(() => {
    saveToStorage(STORAGE_KEY_BOOKINGS, bookings)
  }, [bookings])

  useEffect(() => {
    saveToStorage(STORAGE_KEY_APPROVALS, approvals)
  }, [approvals])

  useEffect(() => {
    saveToStorage(STORAGE_KEY_NOTIFICATIONS, notifications)
  }, [notifications])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  const clearAllData = useCallback(() => {
    Taro.showModal({
      title: '重置数据',
      content: '确定要清空所有预约、审批和通知数据吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.removeStorageSync(STORAGE_KEY_BOOKINGS)
            Taro.removeStorageSync(STORAGE_KEY_APPROVALS)
            Taro.removeStorageSync(STORAGE_KEY_NOTIFICATIONS)
            setBookings([...mockBookings])
            setApprovals([...mockApprovals])
            setNotifications([...mockNotifications])
            Taro.showToast({ title: '已重置数据', icon: 'success' })
          } catch (e) {
            console.warn('[AppStore] 清空数据失败:', e)
          }
        }
      }
    })
  }, [])

  const addBooking = useCallback((booking: Booking) => {
    console.log('[AppStore] addBooking:', booking.id, booking.title)

    let firstStepApproval: ApprovalRecord | null = null
    const firstStep = booking.approvalFlow.find(s => s.order === 1)
    if (firstStep) {
      firstStepApproval = {
        id: `approval-${Date.now()}`,
        bookingId: booking.id,
        bookingTitle: booking.title,
        applicantName: booking.applicantName,
        applicantDepartment: booking.applicantDepartment,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        attendeeCount: booking.attendeeCount,
        role: firstStep.role,
        roleName: firstStep.roleName,
        status: 'pending',
        createdAt: formatDateTime(new Date())
      }
      console.log('[AppStore] 生成审批记录:', firstStepApproval.id, firstStepApproval.roleName)
    }

    setBookings(prev => [booking, ...prev])
    if (firstStepApproval) {
      setApprovals(prev => [firstStepApproval!, ...prev])
    }

    const notification = buildNotification('booking_submitted', booking)
    addNotification(notification)
    console.log('[AppStore] 生成通知:', notification.id, notification.title)
  }, [addNotification])

  const updateBooking = useCallback((id: string, updates: Partial<Booking>) => {
    console.log('[AppStore] updateBooking:', id, updates)
    const now = formatDateTime(new Date())

    if (updates.status === 'cancelled') {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: now } : b))
      setApprovals(prev => prev.map(a => {
        if (a.bookingId !== id) return a
        if (a.status === 'pending') {
          return { ...a, status: 'cancelled' as const, approvedAt: now, comment: '预约已取消' }
        }
        return a
      }))

      const booking = bookings.find(b => b.id === id)
      if (booking) {
        const notification = buildNotification('booking_cancelled', booking, undefined, 'cancelled')
        addNotification(notification)
      }
      return
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates, updatedAt: now } : b))
  }, [bookings, addNotification])

  const approveStep = useCallback((
    bookingId: string,
    role: 'department_head' | 'admin' | 'it',
    comment?: string
  ): { success: boolean; message: string } => {
    console.log('[AppStore] approveStep:', bookingId, role)
    const now = formatDateTime(new Date())

    let targetBooking: Booking | undefined
    let newBookingState: Booking | undefined
    let nextApproval: ApprovalRecord | null = null
    let result: { success: boolean; message: string }

    targetBooking = bookings.find(b => b.id === bookingId)

    if (!targetBooking) {
      result = { success: false, message: '预约不存在' }
      return result
    }
    if (targetBooking.status !== 'pending') {
      result = { success: false, message: '该预约已处理' }
      return result
    }

    const currentStep = targetBooking.approvalFlow.find(s => s.order === targetBooking.currentStep)
    if (!currentStep || currentStep.role !== role) {
      result = { success: false, message: '当前不是您的审批环节' }
      return result
    }

    const roleNameMap: Record<string, string> = {
      department_head: '部门负责人',
      admin: '行政',
      it: 'IT支持'
    }
    const handlerName = roleNameMap[role]

    const newFlow: ApprovalStep[] = targetBooking.approvalFlow.map(step => {
      if (step.order === targetBooking!.currentStep) {
        return { ...step, status: 'approved' as const, comment, approvedAt: now, approverName: handlerName }
      }
      return step
    })

    let newStatus: BookingStatus = 'pending'
    let newCurrentStep = targetBooking.currentStep
    let message = '已通过'

    if (targetBooking.currentStep >= 3) {
      newStatus = 'approved'
      message = '审批通过！预约已生效'
    } else {
      newCurrentStep = targetBooking.currentStep + 1
      const nextStep = newFlow.find(s => s.order === newCurrentStep)
      if (nextStep) {
        message = `已通过，等待${nextStep.roleName}审批`
      }
    }

    newBookingState = {
      ...targetBooking,
      status: newStatus,
      currentStep: newCurrentStep,
      approvalFlow: newFlow,
      updatedAt: now
    }

    if (targetBooking.currentStep < 3) {
      const nextStepInfo = newFlow.find(s => s.order === newCurrentStep)
      if (nextStepInfo && nextStepInfo.status === 'pending') {
        nextApproval = buildNextApproval(newBookingState, nextStepInfo)
      }
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? newBookingState! : b))

    setApprovals(prev => {
      let list = prev.map(approval => {
        if (approval.bookingId !== bookingId || approval.role !== role || approval.status !== 'pending') {
          return approval
        }
        return { ...approval, status: 'approved' as const, comment, approvedAt: now }
      })
      if (nextApproval) {
        list = [nextApproval, ...list]
      }
      return list
    })

    if (newStatus === 'approved') {
      const notification = buildNotification('booking_approved', newBookingState, handlerName, 'approved')
      addNotification(notification)
    } else {
      const notification = buildNotification('step_approved', newBookingState, handlerName, 'approved')
      addNotification(notification)
    }

    result = { success: true, message }
    console.log('[AppStore] approveStep 结果:', result)
    return result
  }, [bookings, addNotification])

  const rejectStep = useCallback((
    bookingId: string,
    role: 'department_head' | 'admin' | 'it',
    comment?: string
  ): { success: boolean; message: string } => {
    console.log('[AppStore] rejectStep:', bookingId, role)
    const now = formatDateTime(new Date())

    const targetBooking = bookings.find(b => b.id === bookingId)
    if (!targetBooking) {
      return { success: false, message: '预约不存在' }
    }
    if (targetBooking.status !== 'pending') {
      return { success: false, message: '该预约已处理' }
    }

    const currentStep = targetBooking.approvalFlow.find(s => s.order === targetBooking.currentStep)
    if (!currentStep || currentStep.role !== role) {
      return { success: false, message: '当前不是您的审批环节' }
    }

    const roleNameMap: Record<string, string> = {
      department_head: '部门负责人',
      admin: '行政',
      it: 'IT支持'
    }
    const handlerName = roleNameMap[role]

    const newFlow: ApprovalStep[] = targetBooking.approvalFlow.map(step => {
      if (step.order === targetBooking!.currentStep) {
        return { ...step, status: 'rejected' as const, comment, approvedAt: now, approverName: handlerName }
      }
      return step
    })

    const newBookingState: Booking = {
      ...targetBooking,
      status: 'rejected' as BookingStatus,
      approvalFlow: newFlow,
      updatedAt: now
    }

    setBookings(prev => prev.map(b => b.id === bookingId ? newBookingState : b))
    setApprovals(prev => prev.map(approval => {
      if (approval.bookingId !== bookingId || approval.role !== role || approval.status !== 'pending') {
        return approval
      }
      return { ...approval, status: 'rejected' as const, comment, approvedAt: now }
    }))

    const notification = buildNotification('booking_rejected', newBookingState, handlerName, 'rejected')
    addNotification(notification)

    console.log('[AppStore] rejectStep 成功')
    return { success: true, message: '已拒绝，预约终止' }
  }, [bookings, addNotification])

  const getBookingsByDate = useCallback((date: string) => {
    return bookings.filter(b => b.date === date)
  }, [bookings])

  const getBookingsByApplicant = useCallback((applicantId: string) => {
    return bookings.filter(b => b.applicantId === applicantId)
  }, [bookings])

  const getBookingsByRoom = useCallback((roomId: string, date?: string) => {
    return bookings.filter(b => {
      if (b.roomId !== roomId) return false
      if (date && b.date !== date) return false
      return true
    })
  }, [bookings])

  const getBookingsByDateRange = useCallback((roomId: string, startDate: string, endDate: string) => {
    return bookings.filter(b => {
      if (b.roomId !== roomId) return false
      if (b.date < startDate || b.date > endDate) return false
      if (b.status !== 'approved' && b.status !== 'pending') return false
      return true
    })
  }, [bookings])

  const getPendingApprovalsByRole = useCallback((role: 'department_head' | 'admin' | 'it') => {
    return approvals.filter(a => a.role === role && a.status === 'pending')
  }, [approvals])

  const getApprovalCountByStatus = useCallback((status: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    return approvals.filter(a => a.status === status).length
  }, [approvals])

  const getRoomBookingsSlots = useCallback((roomId: string, date: string): RoomBookingSlot[] => {
    return bookings
      .filter(b => b.roomId === roomId && b.date === date && (b.status === 'approved' || b.status === 'pending'))
      .map(b => ({
        bookingId: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        title: b.title,
        status: b.status
      }))
  }, [bookings])

  return (
    <AppStoreContext.Provider
      value={{
        bookings,
        approvals,
        notifications,
        addBooking,
        updateBooking,
        approveStep,
        rejectStep,
        getBookingsByDate,
        getBookingsByApplicant,
        getBookingsByRoom,
        getBookingsByDateRange,
        getPendingApprovalsByRole,
        getApprovalCountByStatus,
        getRoomBookingsSlots,
        markNotificationRead,
        markAllNotificationsRead,
        getUnreadNotificationCount,
        clearAllData
      }}
    >
      {children}
    </AppStoreContext.Provider>
  )
}

export const useAppStore = (): AppStoreContextType => {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }
  return context
}
