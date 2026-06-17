import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { mockApprovals, getApprovalsByStatus, getApprovalCountByStatus } from '@/data/approvals'
import ApprovalCard from '@/components/ApprovalCard'
import styles from './index.module.scss'

const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [approvals, setApprovals] = useState(mockApprovals)

  useDidShow(() => {
    loadApprovals()
  })

  const loadApprovals = () => {
    setApprovals(mockApprovals)
  }

  const filteredApprovals = useMemo(() => {
    return approvals.filter(a => a.status === activeTab)
  }, [approvals, activeTab])

  const stats = useMemo(() => ({
    pending: getApprovalCountByStatus('pending'),
    approved: getApprovalCountByStatus('approved'),
    rejected: getApprovalCountByStatus('rejected')
  }), [])

  const handleApprove = (id: string) => {
    Taro.showModal({
      title: '确认通过',
      content: '确定要通过该审批吗？',
      success: (res) => {
        if (res.confirm) {
          setApprovals(prev =>
            prev.map(a =>
              a.id === id
                ? { ...a, status: 'approved' as const, approvedAt: new Date().toLocaleString() }
                : a
            )
          )
          Taro.showToast({ title: '已通过', icon: 'success' })
          console.log('[Approval] 审批通过:', id)
        }
      }
    })
  }

  const handleReject = (id: string) => {
    Taro.showModal({
      title: '确认拒绝',
      content: '确定要拒绝该审批吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          setApprovals(prev =>
            prev.map(a =>
              a.id === id
                ? { ...a, status: 'rejected' as const, approvedAt: new Date().toLocaleString() }
                : a
            )
          )
          Taro.showToast({ title: '已拒绝', icon: 'none' })
          console.log('[Approval] 审批拒绝:', id)
        }
      }
    })
  }

  const goToApprovalDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/approval-detail/index?id=${id}`
    })
  }

  const tabs = [
    { key: 'pending' as const, label: '待审批' },
    { key: 'approved' as const, label: '已通过' },
    { key: 'rejected' as const, label: '已拒绝' }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
            {tab.key === 'pending' && stats.pending > 0 && (
              <Text className={styles.badge}>{stats.pending}</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.tabContent}>
        <View className={styles.statsCard}>
          <View className={`${styles.statItem} ${styles.pending}`}>
            <Text className={styles.statValue}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待审批</Text>
          </View>
          <View className={`${styles.statItem} ${styles.approved}`}>
            <Text className={styles.statValue}>{stats.approved}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={`${styles.statItem} ${styles.rejected}`}>
            <Text className={styles.statValue}>{stats.rejected}</Text>
            <Text className={styles.statLabel}>已拒绝</Text>
          </View>
        </View>

        <Text className={styles.sectionTitle}>
          {activeTab === 'pending' ? '待我审批' : activeTab === 'approved' ? '已通过审批' : '已拒绝审批'}
        </Text>

        <View className={styles.list}>
          {filteredApprovals.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>
                {activeTab === 'pending' ? '暂无待审批事项' : 
                 activeTab === 'approved' ? '暂无已通过审批' : '暂无已拒绝审批'}
              </Text>
            </View>
          ) : (
            filteredApprovals.map(approval => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                showActions={activeTab === 'pending'}
                onApprove={() => handleApprove(approval.id)}
                onReject={() => handleReject(approval.id)}
                onClick={() => goToApprovalDetail(approval.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default ApprovalPage
