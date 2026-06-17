export interface MeetingDevice {
  id: string
  name: string
  type: 'projector' | 'tv' | 'whiteboard' | 'video-conferencing' | 'audio'
  status: 'online' | 'offline' | 'maintenance'
  model?: string
}

export interface MeetingRoom {
  id: string
  name: string
  floor: string
  capacity: number
  area: number
  description: string
  devices: MeetingDevice[]
  facilities: string[]
  status: 'available' | 'occupied' | 'maintenance'
  usageRate: number
  image?: string
  location: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface RoomSchedule {
  roomId: string
  date: string
  bookings: RoomBookingSlot[]
}

export interface RoomBookingSlot {
  bookingId: string
  startTime: string
  endTime: string
  title: string
  status: BookingStatus
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'

export type RoomStatus = 'available' | 'occupied' | 'maintenance'
