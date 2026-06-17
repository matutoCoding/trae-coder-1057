import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { getBookingStatusText } from '@/data/bookings'
import { Booking } from '@/types/booking'
import { formatDate, getDayOfWeek, formatDuration, getDuration } from '@/utils/date'
import { useAppStore } from '@/store/AppStore'
import styles from './index.module.scss'

const BookingDetailPage: React.FC = () => {
  const router = useRouter()
  const { bookings, updateBooking } = useAppStore()

  useDidShow(() => {})

  const booking = useMemo(() => {
    const id = router.params.id as string
    if (!id) return null
    return bookings.find(b => b.id === id) || null
  }, [router.params.id, bookings])

  const handleCancel = () => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm && booking) {
          updateBooking(booking.id, { status: 'cancelled' })
          Taro.showToast({ title: '已取消预约', icon: 'success' })
          console.log('[Booking] 取消预约:', booking.id)
        }
      }
    })
  }

  const handleEdit = () => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' })
  }

  if (!booking) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const dateText = `${formatDate(booking.date)} ${getDayOfWeek(booking.date)}`
  const duration = formatDuration(getDuration(booking.startTime, booking.endTime))

  const getStepClass = (status: string) => {
    switch (status) {
      case 'approved': return styles.stepApproved
      case 'rejected': return styles.stepRejected
      default: return styles.stepPending
    }
  }

  const getStepStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '已通过'
      case 'rejected': return '已拒绝'
      default: return '待审批'
    }
  }

  const getStepDotClass = (step: any, index: number) => {
    const classes = [styles.stepDot]
    if (step.status === 'approved') classes.push(styles.approved)
    if (step.status === 'rejected') classes.push(styles.rejected)
    if (step.status === 'pending') classes.push(styles.pending)
    if (index + 1 === booking.currentStep && step.status === 'pending') classes.push(styles.current)
    return classes.join(' ')
  }

  const facilities = []
  if (booking.needProjector) facilities.push('投影仪')
  if (booking.needWhiteboard) facilities.push('白板')
  if (booking.needVideoConference) facilities.push('视频会议')

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>{booking.title}</Text>
        <View className={styles.statusRow}>
          <Text className={styles.statusBadge}>{getBookingStatusText(booking.status)}</Text>
          <Text className={styles.timeText}>{dateText}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>会议信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时间</Text>
            <View className={styles.infoValue}>
              <Text>{dateText}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时段</Text>
            <View className={styles.infoValue}>
              <Text>{booking.startTime} - {booking.endTime}</Text>
              <Text style={{ marginLeft: '16rpx', color: '#64748B', fontSize: '24rpx' }}>
              ({duration})
            </Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>会议室</Text>
            <Text className={`${styles.infoValue} ${styles.roomName}`}>
              {booking.roomName || '系统自动分配中...'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>参会人数</Text>
            <Text className={styles.infoValue}>{booking.attendeeCount}人</Text>
          </View>
          {booking.description && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>会议描述</Text>
              <Text className={styles.infoValue}>{booking.description}</Text>
            </View>
          )}
          {facilities.length > 0 && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>所需设备</Text>
              <View className={styles.facilities}>
                {facilities.map((f, i) => (
                  <Text key={i} className={styles.facilityTag}>{f}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>申请人</Text>
          <View className={styles.applicantInfo}>
            <View className={styles.applicantAvatar}>
              <Text>{booking.applicantName.charAt(0)}</Text>
            </View>
            <View className={styles.applicantDetail}>
              <Text className={styles.applicantName}>{booking.applicantName}</Text>
              <Text className={styles.applicantDept}>{booking.applicantDepartment}</Text>
            </View>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>审批流程</Text>
          <View className={styles.approvalFlow}>
            {booking.approvalFlow.map((step, index) => (
              <View
                key={step.id}
                className={classnames(styles.approvalStep, getStepClass(step.status))}
              >
                <View className={getStepDotClass(step, index)} />
                <View className={styles.stepContent}>
                  <View className={styles.stepHeader}>
                    <Text className={styles.stepRole}>{step.roleName}</Text>
                    <Text className={styles.stepStatus}>{getStepStatusText(step.status)}</Text>
                  </View>
                  {step.approverName && (
                    <Text className={styles.stepApprover}>
                      {step.approverName}
                      {step.approvedAt && ` · ${step.approvedAt}`}
                    </Text>
                  )}
                  {!step.approverName && step.status === 'pending' && (
                    <Text className={styles.stepApprover}>等待审批中...</Text>
                  )}
                  {step.comment && (
                    <View className={styles.stepComment}>
                      <Text>{step.comment}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {booking.status === 'pending' && (
        <View className={styles.bottomBar}>
          <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCancel}>
            取消预约
          </Button>
          <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleEdit}>
            修改预约
          </Button>
        </View>
      )}

      {booking.status === 'approved' && (
        <View className={styles.bottomBar}>
          <Button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleCancel}>
            取消预约
          </Button>
        </View>
      )}
    </View>
  )
}

export default BookingDetailPage
