import React, { useState, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import { getWeekDates, getDayOfWeek, formatDate, generateTimeSlots, timeToMinutes, minutesToTime } from '@/utils/date'
import styles from './index.module.scss'

interface TimeSlotPickerProps {
  selectedDate?: string
  selectedStartTime?: string
  selectedEndTime?: string
  onDateChange?: (date: string) => void
  onTimeChange?: (startTime: string, endTime: string) => void
  disabledSlots?: string[]
  durationOptions?: number[]
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onDateChange,
  onTimeChange,
  disabledSlots = [],
  durationOptions = [30, 60, 90, 120, 180]
}) => {
  const weekDates = useMemo(() => getWeekDates(), [])
  const [currentDate, setCurrentDate] = useState(selectedDate || weekDates[0])
  const [startTime, setStartTime] = useState(selectedStartTime || '09:00')
  const [duration, setDuration] = useState(60)

  const timeSlots = useMemo(() => generateTimeSlots('08:00', '20:00', 30), [])

  const endTime = useMemo(() => {
    const startMinutes = timeToMinutes(startTime)
    return minutesToTime(startMinutes + duration)
  }, [startTime, duration])

  const handleDateSelect = (date: string) => {
    setCurrentDate(date)
    onDateChange?.(date)
  }

  const handleTimeSelect = (time: string) => {
    const slotIndex = timeSlots.indexOf(time)
    const durationSlots = duration / 30
    
    if (slotIndex + durationSlots > timeSlots.length) {
      return
    }

    setStartTime(time)
    const end = minutesToTime(timeToMinutes(time) + duration)
    onTimeChange?.(time, end)
  }

  const handleDurationChange = (mins: number) => {
    setDuration(mins)
    const end = minutesToTime(timeToMinutes(startTime) + mins)
    onTimeChange?.(startTime, end)
  }

  const isSlotDisabled = (time: string): boolean => {
    const slotIndex = timeSlots.indexOf(time)
    const durationSlots = duration / 30
    
    if (slotIndex + durationSlots > timeSlots.length) {
      return true
    }

    for (let i = 0; i < durationSlots; i++) {
      if (disabledSlots.includes(timeSlots[slotIndex + i])) {
        return true
      }
    }

    return false
  }

  const isSlotSelected = (time: string): boolean => {
    const startIndex = timeSlots.indexOf(startTime)
    const currentIndex = timeSlots.indexOf(time)
    const durationSlots = duration / 30
    return currentIndex >= startIndex && currentIndex < startIndex + durationSlots
  }

  const formatDuration = (mins: number): string => {
    if (mins >= 60) {
      const hours = Math.floor(mins / 60)
      const remain = mins % 60
      if (remain > 0) {
        return `${hours}小时${remain}分钟`
      }
      return `${hours}小时`
    }
    return `${mins}分钟`
  }

  return (
    <View className={styles.timeSlotPicker}>
      <Text className={styles.sectionLabel}>选择日期</Text>
      <View className={styles.dateSelector}>
        {weekDates.map(date => {
          const dayOfWeek = getDayOfWeek(date)
          const dayNum = formatDate(date, 'MM/DD')
          const isActive = date === currentDate
          return (
            <View
              key={date}
              className={classnames(styles.dateItem, isActive && styles.active)}
              onClick={() => handleDateSelect(date)}
            >
              <Text className={styles.dateDay}>{dayOfWeek}</Text>
              <Text className={styles.dateNum}>{dayNum}</Text>
            </View>
          )
        })}
      </View>

      <Text className={styles.sectionLabel}>选择开始时间</Text>
      <View className={styles.timeSlots}>
        {timeSlots.map(time => {
          const disabled = isSlotDisabled(time)
          const selected = isSlotSelected(time)
          return (
            <View
              key={time}
              className={classnames(
                styles.timeSlot,
                selected && styles.selected,
                disabled && styles.disabled
              )}
              onClick={() => !disabled && handleTimeSelect(time)}
            >
              <Text>{time}</Text>
            </View>
          )
        })}
      </View>

      <View className={styles.durationSelector}>
        <Text className={styles.sectionLabel}>会议时长</Text>
        <View className={styles.durationOptions}>
          {durationOptions.map(mins => (
            <View
              key={mins}
              className={classnames(styles.durationOption, duration === mins && styles.active)}
              onClick={() => handleDurationChange(mins)}
            >
              <Text>{formatDuration(mins)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.selectedInfo}>
        <Text className={styles.selectedText}>
          已选择：{formatDate(currentDate)} {startTime} - {endTime}（{formatDuration(duration)}）
        </Text>
      </View>
    </View>
  )
}

export default TimeSlotPicker
