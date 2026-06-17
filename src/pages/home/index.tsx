import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { mockRooms } from '@/data/rooms'
import StatusBadge from '@/components/StatusBadge'
import { getToday, getDayOfWeek, formatDate } from '@/utils/date'
import { useAppStore } from '@/store/AppStore'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const { bookings } = useAppStore()
  const today = getToday()

  useDidShow(() => {
    // 切换回页面时自动响应式数据，bookings变化自动触发重渲染
  })

  const todayBookings = useMemo(() => {
    return bookings
      .filter(b => b.date === today)
      .filter(b => b.status === 'approved' || b.status === 'pending')
  }, [bookings, today])

  const stats = useMemo(() => {
    const totalRooms = mockRooms.filter(r => r.status !== 'maintenance').length
    const availableRooms = mockRooms.filter(r => r.status === 'available').length
    const todayApproved = todayBookings.filter(b => b.status === 'approved').length
    const pendingCount = todayBookings.filter(b => b.status === 'pending').length
    return {
      totalRooms,
      availableRooms,
      todayApproved,
      pendingCount
    }
  }, [todayBookings])

  const handleQuickBook = () => {
    Taro.navigateTo({
      url: '/pages/create-booking/index'
    })
  }

  const goToRooms = () => {
    Taro.switchTab({
      url: '/pages/rooms/index'
    })
  }

  const goToApprovals = () => {
    Taro.switchTab({
      url: '/pages/approval/index'
    })
  }

  const goToBookingDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/booking-detail/index?id=${id}`
    })
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <Text className={styles.greeting}>{greeting()}，同事</Text>
          <Text className={styles.subGreeting}>欢迎使用会议室预约系统</Text>
          <View className={styles.dateInfo}>
            <Text className={styles.dateText}>{formatDate(today, 'MM月DD日')}</Text>
            <Text className={styles.weekdayText}>{getDayOfWeek(today)}</Text>
          </View>
        </View>

        <View className={styles.quickActions}>
          <View className={styles.actionCard} onClick={handleQuickBook}>
            <View className={`${styles.actionIcon} ${styles.primary}`}>
              <Text>📅</Text>
            </View>
            <Text className={styles.actionText}>快速预约</Text>
          </View>
          <View className={styles.actionCard} onClick={goToRooms}>
            <View className={`${styles.actionIcon} ${styles.success}`}>
              <Text>🏢</Text>
            </View>
            <Text className={styles.actionText}>会议室</Text>
          </View>
          <View className={styles.actionCard} onClick={goToApprovals}>
            <View className={`${styles.actionIcon} ${styles.warning}`}>
              <Text>✅</Text>
            </View>
            <Text className={styles.actionText}>审批</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日概览</Text>
          </View>
          <View className={styles.statsRow}>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{stats.availableRooms}</Text>
              <Text className={styles.statLabel}>可用会议室</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{stats.todayApproved}</Text>
              <Text className={styles.statLabel}>今日会议</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue} style={{ color: '#D97706' }}>{stats.pendingCount}</Text>
              <Text className={styles.statLabel}>待审批</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日会议</Text>
            <Text className={styles.moreLink} onClick={goToRooms}>查看全部</Text>
          </View>
          <View className={styles.todayBookings}>
            {todayBookings.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无会议安排</Text>
              </View>
            ) : (
              todayBookings.slice(0, 5).map(booking => (
                <View
                  key={booking.id}
                  className={styles.bookingItem}
                  onClick={() => goToBookingDetail(booking.id)}
                >
                  <View className={styles.timeBlock}>
                    <Text className={styles.startTime}>{booking.startTime}</Text>
                    <Text className={styles.endTime}>- {booking.endTime}</Text>
                  </View>
                  <View className={styles.bookingInfo}>
                    <Text className={styles.bookingTitle}>{booking.title}</Text>
                    <Text className={styles.bookingRoom}>{booking.roomName || '待分配'}</Text>
                  </View>
                  <StatusBadge status={booking.status} />
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: '200rpx' }} />
      </ScrollView>

      <View className={styles.quickBookBtn} onClick={handleQuickBook}>
        <Text className={styles.quickBookIcon}>+</Text>
      </View>
    </View>
  )
}

export default HomePage
