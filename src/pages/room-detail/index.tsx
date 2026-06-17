import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { getRoomById } from '@/data/rooms'
import { MeetingRoom } from '@/types/room'
import { getToday, formatDate, getDayOfWeek } from '@/utils/date'
import { useAppStore } from '@/store/AppStore'
import StatusBadge from '@/components/StatusBadge'
import styles from './index.module.scss'

const RoomDetailPage: React.FC = () => {
  const router = useRouter()
  const { bookings: allBookings } = useAppStore()
  const [room, setRoom] = useState<MeetingRoom | null>(null)
  const paramDate = (router.params.date as string) || getToday()
  const [currentDate, setCurrentDate] = useState(paramDate)

  useEffect(() => {
    loadRoom()
  }, [router.params.id])

  useEffect(() => {
    if (router.params.date) {
      setCurrentDate(router.params.date)
    }
  }, [router.params.date])

  useDidShow(() => {
    loadRoom()
  })

  const loadRoom = () => {
    const id = router.params.id as string
    if (id) {
      const data = getRoomById(id)
      if (data) setRoom(data)
    }
  }

  const bookings = useMemo(() => {
    if (!room) return []
    return allBookings
      .filter(b => b.roomId === room.id && b.date === currentDate)
      .filter(b => b.status === 'approved' || b.status === 'pending')
  }, [room, currentDate, allBookings])

  const handlePrevDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + 1)
    setCurrentDate(date.toISOString().split('T')[0])
  }

  const handleBookNow = () => {
    Taro.navigateTo({
      url: '/pages/create-booking/index'
    })
  }

  const getDeviceTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      projector: '投影仪',
      tv: '电视',
      whiteboard: '白板',
      'video-conferencing': '视频会议',
      audio: '音响'
    }
    return typeMap[type] || type
  }

  const getDeviceIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      projector: '📽️',
      tv: '📺',
      whiteboard: '📝',
      'video-conferencing': '📹',
      audio: '🔊'
    }
    return iconMap[type] || '📱'
  }

  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  const getBookingForSlot = (time: string) => {
    return bookings.find(b => {
      const startHour = parseInt(b.startTime.split(':')[0])
      const slotHour = parseInt(time.split(':')[0])
      return startHour === slotHour
    })
  }

  if (!room) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  const dateText = `${formatDate(currentDate)} ${getDayOfWeek(currentDate)}`

  return (
    <View className={styles.page}>
      <View className={styles.roomHeader}>
        <Text className={styles.roomName}>{room.name}</Text>
        <Text className={styles.roomLocation}>📍 {room.location}</Text>
        <View className={styles.roomStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{room.capacity}</Text>
            <Text className={styles.statLabel}>人容量</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{room.area}</Text>
            <Text className={styles.statLabel}>㎡面积</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{room.usageRate}%</Text>
            <Text className={styles.statLabel}>使用率</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>楼层</Text>
            <Text className={styles.infoValue}>{room.floor}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>状态</Text>
            <View className={styles.infoValue}>
              <StatusBadge status={room.status} />
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>描述</Text>
            <Text className={styles.infoValue}>{room.description}</Text>
          </View>
          <View className={styles.usageRateBar}>
            <View className={styles.usageHeader}>
              <Text className={styles.usageLabel}>今日使用率</Text>
              <Text className={styles.usageValue}>{room.usageRate}%</Text>
            </View>
            <View className={styles.usageBar}>
              <View
                className={styles.usageFill}
                style={{
                  width: `${room.usageRate}%`,
                  background: room.usageRate > 70
                    ? 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
                    : room.usageRate > 50
                    ? 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)'
                    : 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)'
                }}
              />
            </View>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>设备清单</Text>
          <View className={styles.deviceList}>
            {room.devices.map(device => (
              <View key={device.id} className={styles.deviceItem}>
                <View className={styles.deviceIcon}>
                  <Text>{getDeviceIcon(device.type)}</Text>
                </View>
                <View className={styles.deviceInfo}>
                  <Text className={styles.deviceName}>{device.name}</Text>
                  <Text className={styles.deviceModel}>
                    {getDeviceTypeText(device.type)}
                    {device.model && ` · ${device.model}`}
                  </Text>
                </View>
                <Text className={`${styles.deviceStatus} ${device.status}`}>
                  {device.status === 'online' ? '在线' : device.status === 'offline' ? '离线' : '维护中'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.sectionTitle}>配套设施</Text>
          <View className={styles.facilities}>
            {room.facilities.map((facility, index) => (
              <Text key={index} className={styles.facilityTag}>
                {facility}
              </Text>
            ))}
          </View>
        </View>

        <View className={styles.scheduleSection}>
          <View className={styles.dateSelector}>
            <Text className={styles.dateText}>{dateText} 排期</Text>
            <View className={styles.dateNav}>
              <View className={styles.navBtn} onClick={handlePrevDay}>
                <Text>‹</Text>
              </View>
              <View className={styles.navBtn} onClick={handleNextDay}>
                <Text>›</Text>
              </View>
            </View>
          </View>
          <View className={styles.timeline}>
            {timeSlots.map(time => {
              const booking = getBookingForSlot(time)
              return (
                <View
                  key={time}
                  className={`${styles.timeSlot} ${booking ? styles.hasBooking : ''}`}
                >
                  <Text className={styles.timeLabel}>{time}</Text>
                  <View className={styles.slotDot} />
                  {booking && (
                    <View className={styles.bookingBlock}>
                      <Text className={styles.bookingTitle}>{booking.title}</Text>
                      <Text className={styles.bookingTime}>
                        {booking.startTime} - {booking.endTime}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        </View>

        <View style={{ height: '40rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleBookNow}>
          立即预约
        </Button>
      </View>
    </View>
  )
}

export default RoomDetailPage
