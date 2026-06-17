import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { mockRooms } from '@/data/rooms'
import RoomCard from '@/components/RoomCard'
import { getToday, formatDate } from '@/utils/date'
import styles from './index.module.scss'

const RoomsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('list')
  const [currentDate, setCurrentDate] = useState(getToday())

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'available', label: '空闲' },
    { key: 'occupied', label: '使用中' },
    { key: 'small', label: '小型(1-6人)' },
    { key: 'medium', label: '中型(7-15人)' },
    { key: 'large', label: '大型(15人+)' }
  ]

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
      url: `/pages/room-detail/index?id=${id}`
    })
  }

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
    </View>
  )
}

export default RoomsPage
