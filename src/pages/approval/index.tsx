import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Picker } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/AppStore'
import { formatDate, getToday } from '@/utils/date'
import ApprovalCard from '@/components/ApprovalCard'
import styles from './index.module.scss'

const ALL_ROLES: Array<{ role: 'department_head' | 'admin' | 'it'; label: string; color: string }> = [
  { role: 'department_head', label: '部门负责人', color: '#2563EB' },
  { role: 'admin', label: '行政', color: '#059669' },
  { role: 'it', label: 'IT支持', color: '#7C3AED' }
]

const DEPARTMENTS = ['全部', '产品部', '研发部', '市场部', '人事部', '财务部', '运营部']

const ApprovalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'cancelled'>('pending')
  const [currentRole, setCurrentRole] = useState<'all' | 'department_head' | 'admin' | 'it'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterDept, setFilterDept] = useState('全部')
  const [filterRole, setFilterRole] = useState<'all' | 'department_head' | 'admin' | 'it'>('all')

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

  const filterRoleList = useMemo(() => {
    if (filterRole === 'all') return ['department_head', 'admin', 'it'] as const
    return [filterRole]
  }, [filterRole])

  const pendingApprovals = useMemo(() => {
    const allPending: any[] = []
    roleList.forEach(role => {
      if (filterRole !== 'all' && role !== filterRole) return
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
  }, [roleList, filterRole, getPendingApprovalsByRole])

  const handledApprovals = useMemo(() => {
    return approvals.filter(a =>
      filterRoleList.includes(a.role as any) &&
      a.status !== 'pending'
    )
  }, [filterRoleList, approvals])

  const allApprovals = useMemo(() => {
    return [...pendingApprovals, ...handledApprovals]
  }, [pendingApprovals, handledApprovals])

  const filteredApprovals = useMemo(() => {
    let list: any[]
    if (activeTab === 'pending') {
      list = pendingApprovals
    } else if (activeTab === 'approved') {
      list = handledApprovals.filter(a => a.status === 'approved')
    } else if (activeTab === 'rejected') {
      list = handledApprovals.filter(a => a.status === 'rejected')
    } else {
      list = handledApprovals.filter(a => a.status === 'cancelled')
    }

    if (filterDate) {
      list = list.filter(a => a.date === filterDate)
    }
    if (filterDept !== '全部') {
      list = list.filter(a => a.applicantDepartment === filterDept)
    }

    return list.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.localeCompare(a.createdAt)
      }
      return 0
    })
  }, [activeTab, pendingApprovals, handledApprovals, filterDate, filterDept])

  const stats = useMemo(() => ({
    pending: pendingApprovals.length,
    approved: handledApprovals.filter(a => a.status === 'approved').length,
    rejected: handledApprovals.filter(a => a.status === 'rejected').length,
    cancelled: handledApprovals.filter(a => a.status === 'cancelled').length
  }), [pendingApprovals, handledApprovals])

  const totalPending = useMemo(() => {
    return getPendingApprovalsByRole('department_head').length +
           getPendingApprovalsByRole('admin').length +
           getPendingApprovalsByRole('it').length
  }, [getPendingApprovalsByRole])

  const getRolePendingCount = (role: 'department_head' | 'admin' | 'it') => {
    return getPendingApprovalsByRole(role).length
  }

  const hasActiveFilters = useMemo(() => {
    return filterDate !== '' || filterDept !== '全部' || filterRole !== 'all'
  }, [filterDate, filterDept, filterRole])

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

  const clearFilters = () => {
    setFilterDate('')
    setFilterDept('全部')
    setFilterRole('all')
  }

  const onDateChange = (e: any) => {
    setFilterDate(e.detail.value)
  }

  const tabs = [
    { key: 'pending' as const, label: '待审批' },
    { key: 'approved' as const, label: '已通过' },
    { key: 'rejected' as const, label: '已拒绝' },
    { key: 'cancelled' as const, label: '已取消' }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.pageHeader}>
        <View className={styles.pageHeaderRow}>
          <View>
            <Text className={styles.pageTitle}>审批中心</Text>
            <Text className={styles.pageSubtitle}>共 {totalPending} 条待处理</Text>
          </View>
          <View
            className={classnames(styles.filterBtn, hasActiveFilters && styles.activeFilter)}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Text>🔍 筛选</Text>
            {hasActiveFilters && <View className={styles.filterDot} />}
          </View>
        </View>
      </View>

      {showFilter && (
        <View className={styles.filterPanel}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>会议日期</Text>
            <Picker mode='date' value={filterDate || getToday()} onChange={onDateChange}>
              <View className={styles.filterPicker}>
                <Text>{filterDate || '选择日期'}</Text>
                <Text className={styles.pickerArrow}>›</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>申请部门</Text>
            <ScrollView scrollX className={styles.deptScroll}>
              {DEPARTMENTS.map(dept => (
                <View
                  key={dept}
                  className={classnames(styles.deptChip, filterDept === dept && styles.active)}
                  onClick={() => setFilterDept(dept)}
                >
                  <Text>{dept}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>审批角色</Text>
            <View className={styles.roleChips}>
              <View
                className={classnames(styles.roleChipSmall, filterRole === 'all' && styles.active)}
                onClick={() => setFilterRole('all')}
              >
                <Text>全部</Text>
              </View>
              {ALL_ROLES.map(r => (
                <View
                  key={r.role}
                  className={classnames(styles.roleChipSmall, filterRole === r.role && styles.active)}
                  style={filterRole === r.role ? { backgroundColor: r.color, borderColor: r.color } : {}}
                  onClick={() => setFilterRole(r.role)}
                >
                  <Text>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.filterActions}>
            <View className={styles.clearBtn} onClick={clearFilters}>
              <Text>清除筛选</Text>
            </View>
            <View className={styles.applyBtn} onClick={() => setShowFilter(false)}>
              <Text>确定</Text>
            </View>
          </View>
        </View>
      )}

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
            {tab.key === 'approved' && stats.approved > 0 && (
              <Text className={classnames(styles.badge, styles.badgeSuccess)}>{stats.approved}</Text>
            )}
            {tab.key === 'rejected' && stats.rejected > 0 && (
              <Text className={classnames(styles.badge, styles.badgeError)}>{stats.rejected}</Text>
            )}
            {tab.key === 'cancelled' && stats.cancelled > 0 && (
              <Text className={classnames(styles.badge, styles.badgeGrey)}>{stats.cancelled}</Text>
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

        {hasActiveFilters && (
          <View className={styles.activeFilterHint}>
            <Text className={styles.filterHintText}>
              已筛选：{filterDate ? `日期 ${filterDate}` : ''}
              {filterDate && filterDept !== '全部' ? ' · ' : ''}
              {filterDept !== '全部' ? `部门 ${filterDept}` : ''}
              {(filterDate || filterDept !== '全部') && filterRole !== 'all' ? ' · ' : ''}
              {filterRole !== 'all' ? `角色 ${ALL_ROLES.find(r => r.role === filterRole)?.label}` : ''}
            </Text>
            <Text className={styles.filterClear} onClick={clearFilters}>清除</Text>
          </View>
        )}

        <Text className={styles.sectionTitle}>
          {activeTab === 'pending' ? '待我审批' :
           activeTab === 'approved' ? '已通过审批' :
           activeTab === 'rejected' ? '已拒绝审批' : '已取消审批'}
        </Text>

        <View className={styles.list}>
          {filteredApprovals.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>
                {activeTab === 'pending' ? '暂无待审批事项' :
                 activeTab === 'approved' ? '暂无已通过审批' :
                 activeTab === 'rejected' ? '暂无已拒绝审批' : '暂无已取消审批'}
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
