import { MeetingRoom, RoomBookingSlot } from '@/types/room'
import { CreateBookingRequest } from '@/types/booking'
import { isTimeOverlap, timeToMinutes, getDuration } from './date'

interface AllocationScore {
  roomId: string
  score: number
  reason: string
}

export const findAvailableRooms = (
  rooms: MeetingRoom[],
  date: string,
  startTime: string,
  endTime: string,
  schedules: Map<string, RoomBookingSlot[]>,
  options?: {
    minCapacity?: number
    needProjector?: boolean
    needWhiteboard?: boolean
    needVideoConference?: boolean
  }
): MeetingRoom[] => {
  console.log('[RoomAllocator] 查找可用会议室', { date, startTime, endTime, options })

  const availableRooms = rooms.filter(room => {
    if (room.status !== 'available') {
      return false
    }

    if (options?.minCapacity && room.capacity < options.minCapacity) {
      return false
    }

    if (options?.needProjector) {
      const hasProjector = room.devices.some(
        d => d.type === 'projector' && d.status === 'online'
      )
      if (!hasProjector) return false
    }

    if (options?.needWhiteboard) {
      const hasWhiteboard = room.devices.some(
        d => d.type === 'whiteboard' && d.status === 'online'
      )
      if (!hasWhiteboard) return false
    }

    if (options?.needVideoConference) {
      const hasVC = room.devices.some(
        d => d.type === 'video-conferencing' && d.status === 'online'
      )
      if (!hasVC) return false
    }

    const roomBookings = schedules.get(room.id) || []
    const hasConflict = roomBookings.some(booking => {
      if (booking.status === 'cancelled' || booking.status === 'rejected') {
        return false
      }
      return isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
    })

    return !hasConflict
  })

  console.log('[RoomAllocator] 找到可用会议室数量:', availableRooms.length)
  return availableRooms
}

export const calculateAllocationScore = (
  room: MeetingRoom,
  request: CreateBookingRequest,
  schedules: Map<string, RoomBookingSlot[]>
): AllocationScore => {
  let score = 0
  const reasons: string[] = []

  const capacityDiff = room.capacity - request.attendeeCount
  if (capacityDiff >= 0 && capacityDiff <= 2) {
    score += 30
    reasons.push('容量匹配度高')
  } else if (capacityDiff > 2 && capacityDiff <= 5) {
    score += 20
    reasons.push('容量适中')
  } else if (capacityDiff > 5) {
    score += 10
    reasons.push('容量偏大')
  }

  const duration = getDuration(request.startTime, request.endTime)
  const roomBookings = schedules.get(room.id) || []
  
  let totalMinutesBooked = 0
  roomBookings.forEach(booking => {
    if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
      totalMinutesBooked += getDuration(booking.startTime, booking.endTime)
    }
  })

  const utilizationRate = totalMinutesBooked / (12 * 60)
  if (utilizationRate < 0.3) {
    score += 25
    reasons.push('负载较低，优先分配')
  } else if (utilizationRate < 0.6) {
    score += 15
    reasons.push('负载适中')
  } else {
    score += 5
    reasons.push('负载较高')
  }

  let gapBefore = Infinity
  let gapAfter = Infinity
  
  const requestStart = timeToMinutes(request.startTime)
  const requestEnd = timeToMinutes(request.endTime)

  roomBookings.forEach(booking => {
    if (booking.status === 'cancelled' || booking.status === 'rejected') return
    
    const bookingStart = timeToMinutes(booking.startTime)
    const bookingEnd = timeToMinutes(booking.endTime)

    if (bookingEnd <= requestStart) {
      gapBefore = Math.min(gapBefore, requestStart - bookingEnd)
    }
    if (bookingStart >= requestEnd) {
      gapAfter = Math.min(gapAfter, bookingStart - requestEnd)
    }
  })

  const minGap = Math.min(gapBefore, gapAfter)
  if (minGap <= 30) {
    score += 25
    reasons.push('可合并空闲时段，减少碎片')
  } else if (minGap <= 60) {
    score += 15
    reasons.push('空闲时段较近')
  } else {
    score += 5
    reasons.push('空闲时段较远')
  }

  if (room.usageRate < 50) {
    score += 10
    reasons.push('使用率较低，均衡负载')
  } else if (room.usageRate < 70) {
    score += 5
    reasons.push('使用率适中')
  }

  if (request.needProjector) {
    const hasGoodProjector = room.devices.some(d => d.type === 'projector' && d.status === 'online')
    if (hasGoodProjector) {
      score += 5
      reasons.push('投影设备匹配')
    }
  }

  if (request.needWhiteboard) {
    const hasWhiteboard = room.devices.some(d => d.type === 'whiteboard' && d.status === 'online')
    if (hasWhiteboard) {
      score += 5
      reasons.push('白板设备匹配')
    }
  }

  console.log('[RoomAllocator] 会议室评分', { room: room.name, score, reasons })

  return {
    roomId: room.id,
    score,
    reason: reasons.join('、')
  }
}

export const autoAllocateRoom = (
  rooms: MeetingRoom[],
  request: CreateBookingRequest,
  schedules: Map<string, RoomBookingSlot[]>
): { room: MeetingRoom; score: number; reason: string } | null => {
  console.log('[RoomAllocator] 开始自动分配会议室', { request })

  const availableRooms = findAvailableRooms(
    rooms,
    request.date,
    request.startTime,
    request.endTime,
    schedules,
    {
      minCapacity: request.attendeeCount,
      needProjector: request.needProjector,
      needWhiteboard: request.needWhiteboard,
      needVideoConference: request.needVideoConference
    }
  )

  if (availableRooms.length === 0) {
    console.warn('[RoomAllocator] 没有找到可用会议室')
    return null
  }

  const scoredRooms = availableRooms.map(room => ({
    room,
    ...calculateAllocationScore(room, request, schedules)
  }))

  scoredRooms.sort((a, b) => b.score - a.score)

  const bestMatch = scoredRooms[0]
  console.log('[RoomAllocator] 最优会议室:', bestMatch.room.name, '得分:', bestMatch.score)

  return {
    room: bestMatch.room,
    score: bestMatch.score,
    reason: bestMatch.reason
  }
}

export const getFragmentationInfo = (
  room: MeetingRoom,
  date: string,
  schedules: Map<string, RoomBookingSlot[]>
): { fragments: number; totalFreeMinutes: number; avgFragmentSize: number } => {
  const roomBookings = schedules.get(room.id) || []
  const validBookings = roomBookings.filter(
    b => b.status !== 'cancelled' && b.status !== 'rejected'
  )

  validBookings.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  let fragments = 0
  let totalFreeMinutes = 0
  const workStart = timeToMinutes('08:00')
  const workEnd = timeToMinutes('20:00')

  if (validBookings.length === 0) {
    return {
      fragments: 1,
      totalFreeMinutes: workEnd - workStart,
      avgFragmentSize: workEnd - workStart
    }
  }

  const firstBookingStart = timeToMinutes(validBookings[0].startTime)
  if (firstBookingStart > workStart) {
    fragments++
    totalFreeMinutes += firstBookingStart - workStart
  }

  for (let i = 0; i < validBookings.length - 1; i++) {
    const gap = timeToMinutes(validBookings[i + 1].startTime) - timeToMinutes(validBookings[i].endTime)
    if (gap > 0) {
      fragments++
      totalFreeMinutes += gap
    }
  }

  const lastBookingEnd = timeToMinutes(validBookings[validBookings.length - 1].endTime)
  if (lastBookingEnd < workEnd) {
    fragments++
    totalFreeMinutes += workEnd - lastBookingEnd
  }

  return {
    fragments,
    totalFreeMinutes,
    avgFragmentSize: fragments > 0 ? totalFreeMinutes / fragments : 0
  }
}
