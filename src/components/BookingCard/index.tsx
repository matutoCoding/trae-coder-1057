import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Booking } from '@/types/booking'
import StatusBadge from '@/components/StatusBadge'
import { formatDate, getDayOfWeek } from '@/utils/date'
import styles from './index.module.scss'

interface BookingCardProps {
  booking: Booking
  onClick?: () => void
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/booking-detail/index?id=${booking.id}`
      })
    }
  }

  const dateText = `${formatDate(booking.date)} ${getDayOfWeek(booking.date)}`

  return (
    <View className={styles.bookingCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.bookingTitle}>{booking.title}</Text>
        <StatusBadge status={booking.status} />
      </View>

      <View className={styles.bookingInfo}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>时间</Text>
          <View className={styles.infoValue}>
            <Text>{dateText}</Text>
            <Text className={styles.timeHighlight} style={{ marginLeft: '16rpx' }}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>会议室</Text>
          <Text className={styles.infoValue}>
            {booking.roomName || '待分配'}
          </Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>参会人数</Text>
          <Text className={styles.infoValue}>{booking.attendeeCount}人</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.applicantInfo}>
          <View
            style={{
              width: '48rpx',
              height: '48rpx',
              borderRadius: '999rpx',
              backgroundColor: '#E0E7FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24rpx',
              color: '#4F46E5'
            }}
          >
            {booking.applicantName.charAt(0)}
          </View>
          <View>
            <Text className={styles.applicantName}>{booking.applicantName}</Text>
            <Text className={styles.department}> · {booking.applicantDepartment}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default BookingCard
