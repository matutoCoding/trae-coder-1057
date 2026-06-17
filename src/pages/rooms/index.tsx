import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { mockRooms } from '@/data/rooms'
import RoomCard from '@/components/RoomCard'
import { getToday, formatDate, generateTimeSlots, timeToMinutes } from '@/utils/date'
import { useAppStore } from '@/store/AppStore'
import StatusBadge from '@/components/StatusBadge'
import styles from './index.module.scss'

const START_HOUR = 8
const END_HOUR = 20
const SLOT_MINUTES = 60
const PIXELS_PER_MINUTE = 1.2

const RoomsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('list')
  const [currentDate, setCurrentDate] = useState(getToday())
  const { bookings } = useAppStore()

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'available', label: '空闲' },
    { key: 'occupied', label: '使用中' },
    { key: 'small', label: '小型(1-6人)' },
    { key: 'medium', label: '中型(7-15人)' },
    { key: 'large', label: '大型(15人+)' }
  ]

  useDidShow(() => {})

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  const timeAxisWidth = (END_HOUR - START_HOUR) * SLOT_MINUTES * PIXELS_PER_MINUTE

  const filteredRooms = useMemo(() => {
    let rooms = [...mockRooms]

    if (searchText) {
      const keyword = searchText.toLowerCase()
      rooms = rooms.filter(
        r => r.name.toLowerCase().includes(keyword) || r.floor.toLowerCase().includes(keyword)
      )
    }

    switch (activeFilter) {
      case 'available':
        rooms = rooms.filter(r => r.status === 'available')
        break
      case 'occupied':
        rooms = rooms.filter(r => r.status === 'occupied')
        break
      case 'small':
        rooms = rooms.filter(r => r.capacity <= 6)
        break
      case 'medium':
        rooms = rooms.filter(r => r.capacity > 6 && r.capacity <= 15)
        break
      case 'large':
        rooms = rooms.filter(r => r.capacity > 15)
        break
    }

    return rooms
  }, [searchText, activeFilter])

  const roomSchedules = useMemo(() => {
    const map = new Map<string, any[]>()
    filteredRooms.forEach(room => {
      const roomBookings = bookings.filter(
        b => b.roomId === room.id && b.date === currentDate &&
             (b.status === 'approved' || b.status === 'pending')
      )
      map.set(room.id, roomBookings)
    })
    return map
  }, [filteredRooms, currentDate, bookings])

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

  const goToRoomDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/room-detail/index?id=${id}&date=${currentDate}`
    })
  }

  const getBookingStyle = (booking: any) => {
    const startMin = timeToMinutes(booking.startTime) - START_HOUR * 60
    const endMin = timeToMinutes(booking.endTime) - START_HOUR * 60
    const left = Math.max(0, startMin * PIXELS_PER_MINUTE)
    const width = Math.max(60, (endMin - startMin) * PIXELS_PER_MINUTE - 4)
    return { left: `${left}rpx`, width: `${width}rpx` }
  }

  const renderScheduleView = () => (
    <ScrollView scrollX className={styles.scheduleWrapper}>
      <View style={{ width: `${240 + timeAxisWidth}rpx` }}>
        <View className={styles.scheduleHeader}>
          <View className={styles.scheduleRoomHeader}><Text>会议室</Text></View>
          <View className={styles.scheduleTimeAxis} style={{ width: `${timeAxisWidth}rpx` }}>
            {timeSlots.map(t => (
              <View key={t} className={styles.scheduleTimeSlot}>
                <Text>{t}</Text>
              </View>
            ))}
          </View>
        </View>
        {filteredRooms.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏢</Text>
            <Text className={styles.emptyText}>暂无符合条件的会议室</Text>
          </View>
        ) : (
          filteredRooms.map(room => {
            const roomBookings = roomSchedules.get(room.id) || []
            return (
              <View
                key={room.id}
                className={styles.scheduleRow}
                onClick={() => goToRoomDetail(room.id)}
              >
                <View className={styles.scheduleRoomCol}>
                  <Text className={styles.scheduleRoomName}>{room.name}</Text>
                  <Text className={styles.scheduleRoomInfo}>{room.floor} · {room.capacity}人</Text>
                </View>
                <View className={styles.scheduleTimeline} style={{ width: `${timeAxisWidth}rpx` }}>
                  {timeSlots.map((t, idx) => (
                    idx < timeSlots.length - 1 && (
                      <View key={t} className={styles.scheduleGridSlot} />
                    )
                  ))}
                  {roomBookings.map(b => (
                    <View
                      key={b.id}
                      className={classnames(
                        styles.scheduleBooking,
                        b.status === 'pending' && styles.pendingBooking
                      )}
                      style={getBookingStyle(b)}
                    >
                      <Text className={styles.scheduleBookingTitle}>{b.title}</Text>
                      <Text className={styles.scheduleBookingTime}>{b.startTime}-{b.endTime}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索会议室名称、楼层"
            value={searchText}
            onInput={(e: any) => setSearchText(e.detail.value)}
          />
        </View>
        <ScrollView scrollX className={styles.filterTabs}>
          {filters.map(filter => (
            <View
              key={filter.key}
              className={classnames(styles.filterTab, activeFilter === filter.key && styles.active)}
              onClick={() => setActiveFilter(filter.key)}
            >
              <Text>{filter.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.dateSelector}>
        <View className={styles.dateNav}>
          <View className={styles.navBtn} onClick={handlePrevDay}>
            <Text>‹</Text>
          </View>
          <Text className={styles.currentDate}>{formatDate(currentDate, 'YYYY年MM月DD日')}</Text>
          <View className={styles.navBtn} onClick={handleNextDay}>
            <Text>›</Text>
          </View>
        </View>
        <View className={styles.viewToggle}>
          <View
            className={classnames(styles.toggleBtn, viewMode === 'list' && styles.active)}
            onClick={() => setViewMode('list')}
          >
            <Text>列表</Text>
          </View>
          <View
            className={classnames(styles.toggleBtn, viewMode === 'schedule' && styles.active)}
            onClick={() => setViewMode('schedule')}
          >
            <Text>排期</Text>
          </View>
        </View>
      </View>

      {viewMode === 'list' ? (
        <ScrollView scrollY className={styles.roomList}>
          {filteredRooms.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🏢</Text>
              <Text className={styles.emptyText}>暂无符合条件的会议室</Text>
            </View>
          ) : (
            filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} onClick={() => goToRoomDetail(room.id)} />
            ))
          )}
        </ScrollView>
      ) : (
        renderScheduleView()
      )}
    </View>
  )
}

export default RoomsPage
