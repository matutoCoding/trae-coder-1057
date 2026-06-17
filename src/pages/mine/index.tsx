import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { mockBookings } from '@/data/bookings'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const [userInfo] = useState({
    name: '张明',
    department: '产品部',
    role: '产品经理',
    roles: ['employee', 'department_head']
  })

  const [myBookings, setMyBookings] = useState<any[]>([])

  useDidShow(() => {
    loadMyBookings()
  })

  const loadMyBookings = () => {
    const bookings = mockBookings.filter(b => b.applicantId === 'user-001')
    setMyBookings(bookings)
  }

  const stats = useMemo(() => {
    const pending = myBookings.filter(b => b.status === 'pending').length
    const approved = myBookings.filter(b => b.status === 'approved').length
    const rejected = myBookings.filter(b => b.status === 'rejected').length
    const total = myBookings.length
    return { total, pending, approved, rejected }
  }, [myBookings])

  const pendingApprovalCount = useMemo(() => {
    return mockBookings.filter(b => {
      if (b.status !== 'pending') return false
      const currentStep = b.approvalFlow.find(s => s.order === b.currentStep)
      return currentStep && currentStep.role === 'department_head' && currentStep.status === 'pending'
    }).length
  }, [])

  const goToMyBookings = () => {
    Taro.showToast({ title: '我的预约', icon: 'none' })
  }

  const goToMyApprovals = () => {
    Taro.switchTab({ url: '/pages/approval/index' })
  }

  const goToSettings = () => {
    Taro.showToast({ title: '设置', icon: 'none' })
  }

  const goToHelp = () => {
    Taro.showToast({ title: '帮助中心', icon: 'none' })
  }

  const goToAbout = () => {
    Taro.showToast({ title: '关于我们', icon: 'none' })
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'none' })
          console.log('[Auth] 用户退出登录')
        }
      }
    })
  }

  const goToCreateBooking = () => {
    Taro.navigateTo({ url: '/pages/create-booking/index' })
  }

  const goToRooms = () => {
    Taro.switchTab({ url: '/pages/rooms/index' })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.userHeader}>
          <View className={styles.avatar}>
            <Text>{userInfo.name.charAt(0)}</Text>
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{userInfo.name}</Text>
            <Text className={styles.userDept}>{userInfo.department} · {userInfo.role}</Text>
            <View className={styles.userRole}>
              <Text>部门负责人</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>总预约</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#D97706' }}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待审批</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#059669' }}>{stats.approved}</Text>
            <Text className={styles.statLabel}>已通过</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#DC2626' }}>{stats.rejected}</Text>
            <Text className={styles.statLabel}>已拒绝</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={goToCreateBooking}>
            <View className={styles.actionIcon} style={{ backgroundColor: '#EFF6FF' }}>📅</View>
            <Text className={styles.actionLabel}>新建预约</Text>
          </View>
          <View className={styles.actionItem} onClick={goToRooms}>
            <View className={styles.actionIcon} style={{ backgroundColor: '#ECFDF5' }}>🏢</View>
            <Text className={styles.actionLabel}>会议室</Text>
          </View>
          <View className={styles.actionItem} onClick={goToMyApprovals}>
            <View className={styles.actionIcon} style={{ backgroundColor: '#FFFBEB' }}>✅</View>
            <Text className={styles.actionLabel}>我的审批</Text>
          </View>
        </View>

        <View className={styles.menuSection}>
          <Text className={styles.sectionTitle}>预约管理</Text>
          <View className={styles.menuGroup}>
            <View className={styles.menuItem} onClick={goToMyBookings}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuText}>我的预约</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={goToMyApprovals}>
              <Text className={styles.menuIcon}>✅</Text>
              <Text className={styles.menuText}>待我审批</Text>
              {pendingApprovalCount > 0 && (
                <Text className={styles.menuBadge}>{pendingApprovalCount}</Text>
              )}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuSection}>
          <Text className={styles.sectionTitle}>其他</Text>
          <View className={styles.menuGroup}>
            <View className={styles.menuItem} onClick={goToSettings}>
              <Text className={styles.menuIcon}>⚙️</Text>
              <Text className={styles.menuText}>设置</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={goToHelp}>
              <Text className={styles.menuIcon}>❓</Text>
              <Text className={styles.menuText}>帮助中心</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={goToAbout}>
              <Text className={styles.menuIcon}>ℹ️</Text>
              <Text className={styles.menuText}>关于我们</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>

        <View className={styles.logoutBtn} onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>

        <View style={{ height: '100rpx' }} />
      </ScrollView>
    </View>
  )
}

export default MinePage
