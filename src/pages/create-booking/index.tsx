import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { mockRooms } from '@/data/rooms'
import { autoAllocateRoom } from '@/utils/roomAllocator'
import { getToday, formatDate, getDayOfWeek, formatDateTime } from '@/utils/date'
import { RoomBookingSlot, BookingStatus } from '@/types/room'
import { Booking, ApprovalStep } from '@/types/booking'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { useAppStore } from '@/store/AppStore'
import styles from './index.module.scss'

const CreateBookingPage: React.FC = () => {
  const { addBooking, getRoomBookingsSlots } = useAppStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(getToday())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [attendeeCount, setAttendeeCount] = useState(6)
  const [needProjector, setNeedProjector] = useState(false)
  const [needWhiteboard, setNeedWhiteboard] = useState(false)
  const [needVideoConference, setNeedVideoConference] = useState(false)
  const [allocationResult, setAllocationResult] = useState<any>(null)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const schedules = useMemo(() => {
    const map = new Map<string, RoomBookingSlot[]>()
    mockRooms.forEach(room => {
      map.set(room.id, getRoomBookingsSlots(room.id, date))
    })
    return map
  }, [date, getRoomBookingsSlots])

  useEffect(() => {
    calculateAllocation()
  }, [date, startTime, endTime, attendeeCount, needProjector, needWhiteboard, needVideoConference])

  const calculateAllocation = () => {
    if (!startTime || !endTime) {
      setAllocationResult(null)
      return
    }

    const request = {
      title,
      date,
      startTime,
      endTime,
      attendeeCount,
      needProjector,
      needWhiteboard,
      needVideoConference
    }

    const result = autoAllocateRoom(mockRooms, request, schedules)
    setAllocationResult(result)
    console.log('[CreateBooking] 分配结果:', result)
  }

  const handleAttendeeChange = (delta: number) => {
    const newCount = attendeeCount + delta
    if (newCount >= 1 && newCount <= 50) {
      setAttendeeCount(newCount)
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入会议主题', icon: 'none' })
      return
    }

    if (!allocationResult) {
      Taro.showModal({
        title: '暂无可用会议室',
        content: '当前时段没有符合条件的会议室，是否仍要提交申请？',
        success: (res) => {
          if (res.confirm) {
            submitBooking()
          }
        }
      })
      return
    }

    submitBooking()
  }

  const submitBooking = () => {
    Taro.showLoading({ title: '提交中...' })

    setTimeout(() => {
      const now = formatDateTime(new Date())
      const bookingId = `booking-${Date.now()}`

      const approvalFlow: ApprovalStep[] = [
        {
          id: `step-${Date.now()}-1`,
          role: 'department_head',
          roleName: '部门负责人',
          status: 'pending',
          order: 1
        },
        {
          id: `step-${Date.now()}-2`,
          role: 'admin',
          roleName: '行政',
          status: 'pending',
          order: 2
        },
        {
          id: `step-${Date.now()}-3`,
          role: 'it',
          roleName: 'IT支持',
          status: 'pending',
          order: 3
        }
      ]

      const newBooking: Booking = {
        id: bookingId,
        title,
        description: description || undefined,
        date,
        startTime,
        endTime,
        attendeeCount,
        roomId: allocationResult?.room?.id,
        roomName: allocationResult?.room?.name,
        applicantId: 'user-001',
        applicantName: '张明',
        applicantDepartment: '产品部',
        status: 'pending' as BookingStatus,
        currentStep: 1,
        approvalFlow,
        createdAt: now,
        updatedAt: now,
        needProjector,
        needWhiteboard,
        needVideoConference
      }

      addBooking(newBooking)
      console.log('[CreateBooking] 写入全局Store:', newBooking.id, newBooking.title)

      Taro.hideLoading()
      Taro.showToast({ title: '预约提交成功', icon: 'success' })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }, 600)
  }

  const handleTimeChange = (start: string, end: string) => {
    setStartTime(start)
    setEndTime(end)
  }

  const dateText = `${formatDate(date)} ${getDayOfWeek(date)}`

  const facilities = [
    { key: 'projector', label: '投影仪', value: needProjector, onChange: setNeedProjector },
    { key: 'whiteboard', label: '白板', value: needWhiteboard, onChange: setNeedWhiteboard },
    { key: 'video', label: '视频会议', value: needVideoConference, onChange: setNeedVideoConference }
  ]

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View style={{ padding: '24rpx 32rpx' }}>
          <View className={styles.autoAllocateInfo}>
            <View className={styles.infoHeader}>
              <Text className={styles.infoIcon}>🤖</Text>
              <Text className={styles.infoTitle}>智能自动分配</Text>
            </View>
            <Text className={styles.infoDesc}>
              系统将根据您的需求，从空闲会议室中智能择优分配，避免资源碎片化，提升整体利用率。
            </Text>
            <View className={styles.benefitList}>
              <View className={styles.benefitItem}>
                <Text className={styles.check}>✓</Text>
                <Text>容量匹配：选择最合适的会议室大小</Text>
              </View>
              <View className={styles.benefitItem}>
                <Text className={styles.check}>✓</Text>
                <Text>负载均衡：平衡各会议室使用率</Text>
              </View>
              <View className={styles.benefitItem}>
                <Text className={styles.check}>✓</Text>
                <Text>碎片优化：合并空闲时段减少碎片</Text>
              </View>
            </View>
          </View>

          {allocationResult && (
            <View className={styles.allocationResult}>
              <Text className={styles.resultTitle}>✨ 为您推荐最佳会议室</Text>
              <Text className={styles.resultRoom}>{allocationResult.room.name}</Text>
              <Text className={styles.resultReason}>
                {allocationResult.reason}
              </Text>
            </View>
          )}

          {!allocationResult && (
            <View className={styles.noRoomTip}>
              <Text className={styles.noRoomTitle}>⚠️ 暂无可用会议室</Text>
              <Text className={styles.noRoomDesc}>
                当前时段没有符合条件的会议室，您可以调整时间或参会人数后重试，也可以提交申请等待协调。
              </Text>
            </View>
          )}

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>基本信息</Text>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>会议主题
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入会议主题"
                value={title}
                onInput={(e: any) => setTitle(e.detail.value)}
                maxlength={50}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>会议描述</Text>
              <View className={styles.textareaWrapper}>
                <Textarea
                  className={styles.textarea}
                  placeholder="请输入会议描述（选填）"
                  value={description}
                  onInput={(e: any) => setDescription(e.detail.value)}
                  maxlength={200}
                />
              </View>
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>时间选择</Text>
            <TimeSlotPicker
              selectedDate={date}
              selectedStartTime={startTime}
              selectedEndTime={endTime}
              onDateChange={setDate}
              onTimeChange={handleTimeChange}
            />
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>参会需求</Text>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>参会人数
              </Text>
              <View className={styles.attendeeSelector}>
                <View
                  className={classnames(styles.counterBtn, attendeeCount <= 1 && styles.disabled)}
                  onClick={() => handleAttendeeChange(-1)}
                >
                  <Text>−</Text>
                </View>
                <Text className={styles.counterValue}>{attendeeCount}</Text>
                <View
                  className={classnames(styles.counterBtn, attendeeCount >= 50 && styles.disabled)}
                  onClick={() => handleAttendeeChange(1)}
                >
                  <Text>+</Text>
                </View>
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>所需设备</Text>
              <View className={styles.facilityList}>
                {facilities.map(item => (
                  <View
                    key={item.key}
                    className={classnames(styles.facilityItem, item.value && styles.selected)}
                    onClick={() => item.onChange(!item.value)}
                  >
                    <Text>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>审批流程</Text>
            <View style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16rpx 0'
            }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <View style={{
                  width: '48rpx',
                  height: '48rpx',
                  borderRadius: '999rpx',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24rpx',
                  color: '#2563EB'
                }}>1</View>
                <Text style={{ fontSize: '28rpx', color: '#475569' }}>部门负责人</Text>
              </View>
              <Text style={{ color: '#CBD5E1' }}>→</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <View style={{
                  width: '48rpx',
                  height: '48rpx',
                  borderRadius: '999rpx',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24rpx',
                  color: '#059669'
                }}>2</View>
                <Text style={{ fontSize: '28rpx', color: '#475569' }}>行政</Text>
              </View>
              <Text style={{ color: '#CBD5E1' }}>→</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <View style={{
                  width: '48rpx',
                  height: '48rpx',
                  borderRadius: '999rpx',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24rpx',
                  color: '#7C3AED'
                }}>3</View>
                <Text style={{ fontSize: '28rpx', color: '#475569' }}>IT</Text>
              </View>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#94A3B8', marginTop: '16rpx' }}>
              * 需全部审批通过后方可生效，任一环节否决则终止
            </Text>
          </View>
        </View>

        <View style={{ height: '40rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => Taro.navigateBack()}>
          取消
        </Button>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
          提交预约
        </Button>
      </View>
    </View>
  )
}

export default CreateBookingPage
