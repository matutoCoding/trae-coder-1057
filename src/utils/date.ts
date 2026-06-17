import dayjs from 'dayjs'

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format)
}

export const formatTime = (time: string): string => {
  return time
}

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

export const getWeekDates = (): string[] => {
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    dates.push(dayjs().add(i, 'day').format('YYYY-MM-DD'))
  }
  return dates
}

export const getDayOfWeek = (date: string): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[dayjs(date).day()]
}

export const isToday = (date: string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day')
}

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  return s1 < e2 && s2 < e1
}

export const generateTimeSlots = (start = '08:00', end = '20:00', interval = 30): string[] => {
  const slots: string[] = []
  let current = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  
  while (current < endMinutes) {
    slots.push(minutesToTime(current))
    current += interval
  }
  
  return slots
}

export const getDuration = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}小时${mins}分钟`
  } else if (hours > 0) {
    return `${hours}小时`
  } else {
    return `${mins}分钟`
  }
}

export const getWeekStart = (date?: string): string => {
  const d = date ? dayjs(date) : dayjs()
  return d.startOf('week').add(1, 'day').format('YYYY-MM-DD')
}

export const getWeekDatesFromMonday = (date?: string): string[] => {
  const weekStart = getWeekStart(date)
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    dates.push(dayjs(weekStart).add(i, 'day').format('YYYY-MM-DD'))
  }
  return dates
}

export const getNextWeek = (date: string): string => {
  return dayjs(date).add(7, 'day').format('YYYY-MM-DD')
}

export const getPrevWeek = (date: string): string => {
  return dayjs(date).subtract(7, 'day').format('YYYY-MM-DD')
}
