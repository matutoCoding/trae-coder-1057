import React, { useState, useMemo } from 'react'
import { View, Text, Button, Textarea } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { formatDate, getDayOfWeek } from '@/utils/date'
import { useAppStore } from '@/store/AppStore'
import styles from './index.module.scss'

const ApprovalDetailPage: React.FC = () => {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const { approvals, bookings, approveStep, rejectStep } = useAppStore()

  useDidShow(() => {})

  const approval = useMemo(() => {
    const id = router.params.id as string
    if (!id) return null
    return approvals.find(a => a.id === id) || null
  }, [router.params.id, approvals])

  const booking = useMemo(() => {
    if (!approval) return null
    return bookings.find(b => b.id === approval.bookingId) || null
  }, [approval, bookings])

  const handleApprove = () => {
    if (!approval) return
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该审批吗？',
      confirmColor: '#059669',
      success: (res) => {
        if (res.confirm) {
          const result = approveStep(approval.bookingId, approval.role, comment || undefined)
          if (result.success) {
            Taro.showToast({ title: result.message || '审批通过', icon: 'success' })
            console.log('[ApprovalDetail] 审批通过:', approval.id, result)
            setTimeout(() => Taro.navigateBack(), 1200)
          } else {
            Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleReject = () => {
    if (!approval) return
    if (!comment.trim()) {
      Taro.showToast({ title: '请填写拒绝原因', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该审批吗？拒绝后预约将终止。',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          const result = rejectStep(approval.bookingId, approval.role, comment)
          if (result.success) {
            Taro.showToast({ title: result.message || '已拒绝', icon: 'none' })
            console.log('[ApprovalDetail] 审批拒绝:', approval.id, result)
            setTimeout(() => Taro.navigateBack(), 1200)
          } else {
            Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  }

  if (!approval || !booking) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const dateText = `${formatDate(booking.date)} ${getDayOfWeek(booking.date)}`

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝'
    }
    return map[status] || status
  }

  const getBookingStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '审批中',
      approved: '已通过',
      rejected: '已拒绝',
      cancelled: '已取消',
      completed: '已完成'
    }
    return map[status] || status
  }

  const getStepDot = (step: any, idx: number) => {
    if (step.status === 'approved') return { text: '✓', classes: [styles.stepDot, styles.approved] }
    if (step.status === 'rejected') return { text: '✕', classes: [styles.stepDot, styles.rejected] }
    if (idx + 1 === booking.currentStep) return { text: String(idx + 1), classes: [styles.stepDot, styles.current] }
    return { text: String(idx + 1), classes: [styles.stepDot] }
  }

  const getLineClass = (step: any) => {
    return step.status === 'approved' ? styles.completed : ''
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>{booking.title}</Text>
        <Text className={styles.statusBadge}>{getBookingStatusText(booking.status)}</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>会议信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>日期</Text>
            <Text className={styles.infoValue}>{dateText}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时间</Text>
            <Text className={`${styles.infoValue} ${styles.timeHighlight}`}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>会议室</Text>
            <Text className={styles.infoValue}>{booking.roomName || '待分配'}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>人数</Text>
            <Text className={styles.infoValue}>{booking.attendeeCount}人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请时间</Text>
            <Text className={styles.infoValue}>{booking.createdAt}</Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>申请人</Text>
          <View className={styles.applicantInfo}>
            <View className={styles.avatar}>
              <Text>{booking.applicantName.charAt(0)}</Text>
            </View>
            <View className={styles.applicantDetail}>
              <Text className={styles.applicantName}>{booking.applicantName}</Text>
              <Text className={styles.applicantDept}>{booking.applicantDepartment}</Text>
            </View>
            <Text className={styles.roleTag}>{approval.roleName}</Text>
          </View>
        </View>

        <View className={styles.approvalFlowSection}>
          <Text className={styles.sectionTitle}>审批流程</Text>
          <View className={styles.flowSteps}>
            {booking.approvalFlow.map((step, idx) => {
              const dot = getStepDot(step, idx)
              const isLast = idx === booking.approvalFlow.length - 1
              return (
                <View key={step.id} className={styles.flowStep}>
                  <View className={dot.classes.join(' ')}>{dot.text}</View>
                  <Text className={styles.stepName}>{step.roleName}</Text>
                  {!isLast && (
                    <View className={classnames(styles.stepLine, getLineClass(step))} />
                  )}
                  {step.approverName && (
                    <Text className={styles.stepApprover}>
                      {step.approverName}
                    </Text>
                  )}
                  {step.status === 'pending' && idx + 1 === booking.currentStep && (
                    <Text className={styles.stepApprover}>审批中...</Text>
                  )}
                  {step.comment && (
                    <View className={styles.stepCommentBox}>
                      <Text>{step.comment}</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {approval.status === 'pending' && (
          <View className={styles.commentSection}>
            <Text className={styles.sectionTitle}>审批意见</Text>
            <Textarea
              className={styles.commentInput}
              placeholder="请输入审批意见（拒绝必填）"
              value={comment}
              onInput={(e: any) => setComment(e.detail.value)}
              maxlength={200}
            />
          </View>
        )}

        {approval.comment && approval.status !== 'pending' && (
          <View className={styles.commentSection}>
            <Text className={styles.sectionTitle}>审批意见</Text>
            <View style={{
              padding: '24rpx',
              backgroundColor: '#F8FAFC',
              borderRadius: '16rpx'
            }}>
              <Text style={{ fontSize: '28rpx', color: '#475569' }}>{approval.comment}</Text>
            </View>
          </View>
        )}
      </View>

      {approval.status === 'pending' && booking.status === 'pending' && (
        <View className={styles.bottomBar}>
          <Button className={`${styles.btn} ${styles.btnReject}`} onClick={handleReject}>
            拒绝
          </Button>
          <Button className={`${styles.btn} ${styles.btnApprove}`} onClick={handleApprove}>
            通过
          </Button>
        </View>
      )}
    </View>
  )
}

export default ApprovalDetailPage
