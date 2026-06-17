import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ApprovalRecord } from '@/types/approval'
import StatusBadge from '@/components/StatusBadge'
import { formatDate, getDayOfWeek } from '@/utils/date'
import styles from './index.module.scss'

interface ApprovalCardProps {
  approval: ApprovalRecord
  showActions?: boolean
  onApprove?: () => void
  onReject?: () => void
  onClick?: () => void
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  approval,
  showActions = false,
  onApprove,
  onReject,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/approval-detail/index?id=${approval.id}`
      })
    }
  }

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApprove?.()
  }

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation()
    onReject?.()
  }

  const dateText = `${formatDate(approval.date)} ${getDayOfWeek(approval.date)}`

  return (
    <View className={styles.approvalCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.bookingTitle}>{approval.bookingTitle}</Text>
        <StatusBadge status={approval.status} />
      </View>

      <View className={styles.applicantRow}>
        <View className={styles.avatar}>
          <Text>{approval.applicantName.charAt(0)}</Text>
        </View>
        <View className={styles.applicantInfo}>
          <Text className={styles.applicantName}>{approval.applicantName}</Text>
          <Text className={styles.applicantDept}>{approval.applicantDepartment}</Text>
        </View>
        <Text className={styles.roleTag}>{approval.roleName}</Text>
      </View>

      <View className={styles.bookingInfo}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>日期</Text>
          <Text className={styles.infoValue}>{dateText}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>时间</Text>
          <Text className={`${styles.infoValue} ${styles.timeValue}`}>
            {approval.startTime} - {approval.endTime}
          </Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>人数</Text>
          <Text className={styles.infoValue}>{approval.attendeeCount}人</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.createTime}>申请时间：{approval.createdAt}</Text>
        {showActions && approval.status === 'pending' && (
          <View className={styles.actionBtns}>
            <Button className={`${styles.btn} ${styles.rejectBtn}`} onClick={handleReject}>
              拒绝
            </Button>
            <Button className={`${styles.btn} ${styles.approveBtn}`} onClick={handleApprove}>
              通过
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}

export default ApprovalCard
