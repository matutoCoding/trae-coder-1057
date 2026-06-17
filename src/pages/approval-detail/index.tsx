import React, { useState, useEffect } from 'react'
import { View, Text, Button, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { getApprovalById } from '@/data/approvals'
import { ApprovalRecord } from '@/types/approval'
import { formatDate, getDayOfWeek } from '@/utils/date'
import styles from './index.module.scss'

const ApprovalDetailPage: React.FC = () => {
  const router = useRouter()
  const [approval, setApproval] = useState<ApprovalRecord | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadApproval()
  }, [router.params.id])

  const loadApproval = () => {
    const id = router.params.id as string
    if (id) {
      const data = getApprovalById(id)
      if (data) {
        setApproval(data)
      }
    }
  }

  const handleApprove = () => {
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该审批吗？',
      confirmColor: '#059669',
      success: (res) => {
        if (res.confirm) {
          setApproval(prev =>
            prev
              ? { ...prev, status: 'approved' as const, approvedAt: new Date().toLocaleString(), comment }
              : null
          )
          Taro.showToast({ title: '审批通过', icon: 'success' })
          console.log('[Approval] 审批通过:', approval?.id, comment)
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      }
    })
  }

  const handleReject = () => {
    if (!comment.trim()) {
      Taro.showToast({ title: '请填写拒绝原因', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该审批吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          setApproval(prev =>
            prev
              ? { ...prev, status: 'rejected' as const, approvedAt: new Date().toLocaleString(), comment }
              : null
          )
          Taro.showToast({ title: '已拒绝', icon: 'none' })
          console.log('[Approval] 审批拒绝:', approval?.id, comment)
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      }
    })
  }

  if (!approval) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const dateText = `${formatDate(approval.date)} ${getDayOfWeek(approval.date)}`

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝'
    }
    return map[status] || status
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>{approval.bookingTitle}</Text>
        <Text className={styles.statusBadge}>{getStatusText(approval.status)}</Text>
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
              {approval.startTime} - {approval.endTime}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>人数</Text>
            <Text className={styles.infoValue}>{approval.attendeeCount}人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>申请时间</Text>
            <Text className={styles.infoValue}>{approval.createdAt}</Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>申请人</Text>
          <View className={styles.applicantInfo}>
            <View className={styles.avatar}>
              <Text>{approval.applicantName.charAt(0)}</Text>
            </View>
            <View className={styles.applicantDetail}>
              <Text className={styles.applicantName}>{approval.applicantName}</Text>
              <Text className={styles.applicantDept}>{approval.applicantDepartment}</Text>
            </View>
            <Text className={styles.roleTag}>{approval.roleName}</Text>
          </View>
        </View>

        <View className={styles.approvalFlowSection}>
          <Text className={styles.sectionTitle}>审批流程</Text>
          <View className={styles.flowSteps}>
            <View className={styles.flowStep}>
              <View className={classnames(styles.stepDot, styles.approved)}>✓</View>
              <Text className={styles.stepName}>部门负责人</Text>
              <View className={classnames(styles.stepLine, styles.completed)} />
            </View>
            <View className={styles.flowStep}>
              <View className={classnames(styles.stepDot, approval.status === 'pending' && styles.current, approval.status === 'approved' && styles.approved, approval.status === 'rejected' && styles.rejected)}>
                {approval.status === 'approved' ? '✓' : approval.status === 'rejected' ? '✕' : '2'}
              </View>
              <Text className={styles.stepName}>行政</Text>
              <View className={classnames(styles.stepLine, approval.status === 'approved' && styles.completed)} />
            </View>
            <View className={styles.flowStep}>
              <View className={classnames(styles.stepDot, approval.status === 'approved' && styles.approved)}>
                {approval.status === 'approved' ? '✓' : '3'}
              </View>
              <Text className={styles.stepName}>IT支持</Text>
            </View>
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

        {approval.comment && (
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

      {approval.status === 'pending' && (
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
