import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { MeetingRoom } from '@/types/room'
import StatusBadge from '@/components/StatusBadge'
import styles from './index.module.scss'

interface RoomCardProps {
  room: MeetingRoom
  onClick?: () => void
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/room-detail/index?id=${room.id}`
      })
    }
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

  return (
    <View className={styles.roomCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.roomName}>{room.name}</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
          <Text className={styles.floorBadge}>{room.floor}</Text>
          <StatusBadge status={room.status} />
        </View>
      </View>

      <View className={styles.roomInfo}>
        <View className={styles.infoItem}>
          <Text className={styles.icon}>👥</Text>
          <Text>{room.capacity}人</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.icon}>📐</Text>
          <Text>{room.area}㎡</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.icon}>📍</Text>
          <Text>{room.location}</Text>
        </View>
      </View>

      <View className={styles.roomDevices}>
        {room.devices.slice(0, 4).map(device => (
          <Text
            key={device.id}
            className={styles.deviceTag}
            style={{
              backgroundColor: device.status === 'online' ? '#EFF6FF' : '#FEF2F2',
              color: device.status === 'online' ? '#2563EB' : '#DC2626'
            }}
          >
            {getDeviceTypeText(device.type)}
          </Text>
        ))}
        {room.devices.length > 4 && (
          <Text className={styles.deviceTag} style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
            +{room.devices.length - 4}
          </Text>
        )}
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.usageRate}>
          <Text className={styles.usageLabel}>使用率</Text>
          <View className={styles.usageBar}>
            <View
              className={styles.usageFill}
              style={{
                width: `${room.usageRate}%`,
                backgroundColor: room.usageRate > 70 ? '#DC2626' : room.usageRate > 50 ? '#D97706' : '#2563EB'
              }}
            />
          </View>
          <Text style={{ fontSize: '24rpx', color: '#64748B' }}>{room.usageRate}%</Text>
        </View>
      </View>
    </View>
  )
}

export default RoomCard
