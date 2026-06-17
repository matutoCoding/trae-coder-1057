import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusBadgeProps {
  status: string
  text?: string
  className?: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className }) => {
  const statusTextMap: Record<string, string> = {
    pending: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
    cancelled: '已取消',
    completed: '已完成',
    available: '空闲',
    occupied: '使用中',
    maintenance: '维护中',
    online: '在线',
    offline: '离线'
  }

  return (
    <View className={classnames(styles.statusBadge, styles[status], className)}>
      <Text>{text || statusTextMap[status] || status}</Text>
    </View>
  )
}

export default StatusBadge
