import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/AppStore'
import { getBookingStatusText } from '@/data/bookings'
import StatusBadge from '@/components/StatusBadge'
import { formatDate, getDayOfWeek, formatDuration, getDuration } from '@/utils/date'
import styles from './index.module.scss'

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '审批中' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'cancelled', label: '已取消' }
] as const

const MyBookingsPage: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<string>('all')
  const { bookings, updateBooking } = useAppStore()

  useDidShow(() => {})

  const myBookings = useMemo(() => {
    return bookings
      .filter(b => b.applicantId === 'user-001')
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.startTime.localeCompare(a.startTime)
      })
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (activeStatus === 'all') return myBookings
    return myBookings.filter(b => b.status === activeStatus)
  }, [myBookings, activeStatus])

  const stats = useMemo(() => ({
    all: myBookings.length,
    pending: myBookings.filter(b => b.status === 'pending').length,
    approved: myBookings.filter(b => b.status === 'approved').length,
    rejected: myBookings.filter(b => b.status === 'rejected').length,
    cancelled: myBookings.filter(b => b.status === 'cancelled').length
  }), [myBookings])

  const goToBookingDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/booking-detail/index?id=${id}`
    })
  }

  const handleCancel = (booking: any) => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          updateBooking(booking.id, { status: 'cancelled' })
          Taro.showToast({ title: '已取消预约', icon: 'success' })
        }
      }
    })
  }

  const handleNewBooking = () => {
    Taro.navigateTo({
      url: '/pages/create-booking/index'
    })
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>我的预约</Text>
        <Text className={styles.subtitle}>共 {myBookings.length} 条预约记录</Text>
      </View>

      <ScrollView scrollX className={styles.statusTabs}>
        {STATUS_TABS.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.statusTab, activeStatus === tab.key && styles.active)}
            onClick={() => setActiveStatus(tab.key)}
          >
            <Text className={styles.tabLabel}>{tab.label}</Text>
            {stats[tab.key] > 0 && (
              <Text className={styles.tabCount}>{stats[tab.key]}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.bookingList}>
        {filteredBookings.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>暂无相关预约记录</Text>
            <View className={styles.emptyBtn} onClick={handleNewBooking}>
              <Text>新建预约</Text>
            </View>
          </View>
        ) : (
          filteredBookings.map(booking => {
            const dateText = `${formatDate(booking.date)} ${getDayOfWeek(booking.date)}`
            const duration = formatDuration(getDuration(booking.startTime, booking.endTime))
            return (
              <View
                key={booking.id}
                className={styles.bookingCard}
                onClick={() => goToBookingDetail(booking.id)}
              >
                <View className={styles.cardHeader}>
                  <Text className={styles.bookingTitle}>{booking.title}</Text>
                  <StatusBadge status={booking.status} />
                </View>

                <View className={styles.cardBody}>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>📅</Text>
                    <Text className={styles.infoValue}>{dateText}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>🕐</Text>
                    <Text className={styles.infoValue}>
                      {booking.startTime} - {booking.endTime}
                      <Text className={styles.durationText}> ({duration})</Text>
                    </Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>🏢</Text>
                    <Text className={styles.infoValue}>
                      {booking.roomName || '系统分配中...'}
                    </Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>👥</Text>
                    <Text className={styles.infoValue}>{booking.attendeeCount} 人参会</Text>
                  </View>
                </View>

                {booking.status === 'pending' && (
                  <View className={styles.cardFooter}>
                    <View
                      className={styles.cancelBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancel(booking)
                      }}
                    >
                      <Text>取消预约</Text>
                    </View>
                  </View>
                )}

                {booking.status === 'pending' && (
                  <View className={styles.approvalHint}>
                    <Text className={styles.hintText}>
                      等待审批 · 第 {booking.currentStep} 步/共 3 步
                    </Text>
                  </View>
                )}
              </View>
            )
          })
        )}

        <View style={{ height: '40rpx' }} />
      </ScrollView>

      <View className={styles.fab} onClick={handleNewBooking}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  )
}

export default MyBookingsPage
