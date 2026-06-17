import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/AppStore'
import ApprovalCard from '@/components/ApprovalCard'
import styles from './index.module.scss'

const ALL_ROLES: Array<{ role: 'department_head' | 'admin' | 'it'; label: string; color: string }> = [
  { role: 'department_head', label: '部门负责人', color: '#2563EB' },
  { role: 'admin', label: '行政', color: '#059669' },
  { role: 'it', label: 'IT支持', color: '#7C3AED' }
]

const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [currentRole, setCurrentRole] = useState<'all' | 'department_head' | 'admin' | 'it'>('all')
  const {
    approvals,
    approveStep,
    rejectStep,
    getPendingApprovalsByRole
  } = useAppStore()

  useDidShow(() => {})

  const roleList = useMemo(() => {
    if (currentRole === 'all') return ['department_head', 'admin', 'it'] as const
    return [currentRole]
  }, [currentRole])

  const pendingApprovals = useMemo(() => {
    const allPending: any[] = []
    roleList.forEach(role => {
      allPending.push(...getPendingApprovalsByRole(role))
    })
    const seen = new Set()
    return allPending.filter(a => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    }).sort((a, b) => {
      const order = ['department_head', 'admin', 'it']
      return order.indexOf(a.role) - order.indexOf(b.role)
    })
  }, [roleList, getPendingApprovalsByRole])

  const handledApprovals = useMemo(() => {
    return approvals.filter(a =>
      roleList.includes(a.role as any) &&
      a.status !== 'pending'
    )
  }, [roleList, approvals])

  const filteredApprovals = useMemo(() => {
    if (activeTab === 'pending') return pendingApprovals
    if (activeTab === 'approved') return handledApprovals.filter(a => a.status === 'approved')
    return handledApprovals.filter(a => a.status === 'rejected')
  }, [activeTab, pendingApprovals, handledApprovals])

  const stats = useMemo(() => ({
    pending: pendingApprovals.length,
    approved: handledApprovals.filter(a => a.status === 'approved').length,
    rejected: handledApprovals.filter(a => a.status === 'rejected').length
  }), [pendingApprovals, handledApprovals])

  const totalPending = useMemo(() => {
    return getPendingApprovalsByRole('department_head').length +
           getPendingApprovalsByRole('admin').length +
           getPendingApprovalsByRole('it').length
  }, [getPendingApprovalsByRole])

  const getRolePendingCount = (role: 'department_head' | 'admin' | 'it') => {
    return getPendingApprovalsByRole(role).length
  }

  const handleApprove = (approvalId: string) => {
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) return

    Taro.showModal({
      title: '确认通过',
      content: `确定要作为「${approval.roleName}」通过该审批吗？`,
      success: (res) => {
        if (res.confirm) {
          const result = approveStep(approval.bookingId, approval.role)
          if (result.success) {
            Taro.showToast({ title: result.message || '已通过', icon: 'success' })
            console.log('[Approval] 审批通过:', approvalId, result)
          } else {
            Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleReject = (approvalId: string) => {
    const approval = approvals.find(a => a.id === approvalId)
    if (!approval) return

    Taro.showModal({
      title: '确认拒绝',
      content: `确定要作为「${approval.roleName}」拒绝该审批吗？拒绝后预约将终止。`,
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          const result = rejectStep(approval.bookingId, approval.role, '不符合审批要求')
          if (result.success) {
            Taro.showToast({ title: result.message || '已拒绝', icon: 'none' })
            console.log('[Approval] 审批拒绝:', approvalId, result)
          } else {
            Taro.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
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
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>审批中心</Text>
        <Text className={styles.pageSubtitle}>共 {totalPending} 条待处理</Text>
      </View>

      <View className={styles.roleSelector}>
        <View
          className={classnames(styles.roleChip, currentRole === 'all' && styles.active)}
          style={currentRole === 'all' ? { backgroundColor: '#334155', borderColor: '#334155' } : {}}
          onClick={() => setCurrentRole('all')}
        >
          <Text className={styles.roleLabel}>全部角色</Text>
          {totalPending > 0 && <Text className={styles.roleCount}>{totalPending}</Text>}
        </View>
        {ALL_ROLES.map(r => {
          const count = getRolePendingCount(r.role)
          const isActive = currentRole === r.role
          return (
            <View
              key={r.role}
              className={classnames(styles.roleChip, isActive && styles.active)}
              style={isActive ? { backgroundColor: r.color, borderColor: r.color } : {}}
              onClick={() => setCurrentRole(r.role)}
            >
              <Text className={styles.roleLabel}>{r.label}</Text>
              {count > 0 && <Text className={styles.roleCount}>{count}</Text>}
            </View>
          )
        })}
      </View>

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
