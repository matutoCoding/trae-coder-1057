import { MeetingRoom } from '@/types/room'

export const mockRooms: MeetingRoom[] = [
  {
    id: 'room-001',
    name: '创新会议室',
    floor: '3F',
    capacity: 8,
    area: 40,
    description: '中型会议室，适合部门周会、项目评审等',
    devices: [
      { id: 'dev-001', name: '投影仪-A1', type: 'projector', status: 'online', model: 'Epson-CB-X50' },
      { id: 'dev-002', name: '智能白板-01', type: 'whiteboard', status: 'online', model: 'Maxhub-V5' },
      { id: 'dev-003', name: '视频会议终端', type: 'video-conferencing', status: 'online', model: 'Poly-Studio' }
    ],
    facilities: ['WiFi', '空调', '饮水机'],
    status: 'available',
    usageRate: 65,
    location: '3楼东侧'
  },
  {
    id: 'room-002',
    name: '启航会议室',
    floor: '3F',
    capacity: 12,
    area: 60,
    description: '大型会议室，适合全员大会、培训等',
    devices: [
      { id: 'dev-004', name: '投影仪-A2', type: 'projector', status: 'online', model: 'Epson-CB-L200' },
      { id: 'dev-005', name: '智能白板-02', type: 'whiteboard', status: 'online', model: 'Maxhub-V5' },
      { id: 'dev-006', name: '视频会议终端', type: 'video-conferencing', status: 'online', model: 'Poly-Studio' },
      { id: 'dev-007', name: '音响系统', type: 'audio', status: 'online', model: 'Bose-Pro' }
    ],
    facilities: ['WiFi', '空调', '饮水机', '讲台'],
    status: 'available',
    usageRate: 72,
    location: '3楼西侧'
  },
  {
    id: 'room-003',
    name: '灵感会议室',
    floor: '4F',
    capacity: 6,
    area: 25,
    description: '小型会议室，适合小组讨论、脑暴',
    devices: [
      { id: 'dev-008', name: '电视屏幕-01', type: 'tv', status: 'online', model: 'Sony-65X90' },
      { id: 'dev-009', name: '智能白板-03', type: 'whiteboard', status: 'online', model: 'Maxhub-V5' }
    ],
    facilities: ['WiFi', '空调'],
    status: 'available',
    usageRate: 58,
    location: '4楼南侧'
  },
  {
    id: 'room-004',
    name: '致远会议室',
    floor: '4F',
    capacity: 20,
    area: 80,
    description: '大型报告厅，适合重要会议、发布会',
    devices: [
      { id: 'dev-010', name: '投影仪-A3', type: 'projector', status: 'online', model: 'Epson-CB-L500' },
      { id: 'dev-011', name: '智能白板-04', type: 'whiteboard', status: 'maintenance', model: 'Maxhub-V5' },
      { id: 'dev-012', name: '视频会议系统', type: 'video-conferencing', status: 'online', model: 'Cisco-Webex' },
      { id: 'dev-013', name: '专业音响', type: 'audio', status: 'online', model: 'JBL-Pro' }
    ],
    facilities: ['WiFi', '空调', '饮水机', '讲台', '录播设备'],
    status: 'available',
    usageRate: 45,
    location: '4楼北侧'
  },
  {
    id: 'room-005',
    name: '协作会议室',
    floor: '5F',
    capacity: 10,
    area: 45,
    description: '标准会议室，适合各类会议',
    devices: [
      { id: 'dev-014', name: '电视屏幕-02', type: 'tv', status: 'online', model: 'Sony-75X90' },
      { id: 'dev-015', name: '视频会议终端', type: 'video-conferencing', status: 'online', model: 'Poly-Studio' }
    ],
    facilities: ['WiFi', '空调', '饮水机'],
    status: 'available',
    usageRate: 68,
    location: '5楼东侧'
  },
  {
    id: 'room-006',
    name: '专注会议室',
    floor: '5F',
    capacity: 4,
    area: 18,
    description: '迷你会议室，适合1v1面谈、面试',
    devices: [
      { id: 'dev-016', name: '电视屏幕-03', type: 'tv', status: 'online', model: 'Sony-55X80' }
    ],
    facilities: ['WiFi', '空调'],
    status: 'maintenance',
    usageRate: 55,
    location: '5楼西侧'
  },
  {
    id: 'room-007',
    name: '智慧会议室',
    floor: '6F',
    capacity: 15,
    area: 70,
    description: '智能化会议室，配备全套会议设备',
    devices: [
      { id: 'dev-017', name: '激光投影仪', type: 'projector', status: 'online', model: 'Epson-CB-L610' },
      { id: 'dev-018', name: '智能白板-05', type: 'whiteboard', status: 'online', model: 'Maxhub-V6' },
      { id: 'dev-019', name: '视频会议系统', type: 'video-conferencing', status: 'online', model: 'Zoom-Room' },
      { id: 'dev-020', name: '全向麦克风', type: 'audio', status: 'online', model: 'Jabra-PanaCast' }
    ],
    facilities: ['WiFi', '空调', '饮水机', '智能灯控'],
    status: 'available',
    usageRate: 75,
    location: '6楼中央'
  },
  {
    id: 'room-008',
    name: '阳光会议室',
    floor: '6F',
    capacity: 6,
    area: 28,
    description: '采光良好的小型会议室',
    devices: [
      { id: 'dev-021', name: '电视屏幕-04', type: 'tv', status: 'online', model: 'Sony-65X80' },
      { id: 'dev-022', name: '智能白板-06', type: 'whiteboard', status: 'online', model: 'Maxhub-V5' }
    ],
    facilities: ['WiFi', '空调', '落地窗'],
    status: 'available',
    usageRate: 52,
    location: '6楼南侧'
  }
]

export const getRoomById = (id: string): MeetingRoom | undefined => {
  return mockRooms.find(room => room.id === id)
}

export const getRoomsByFloor = (floor: string): MeetingRoom[] => {
  return mockRooms.filter(room => room.floor === floor)
}

export const getAvailableRooms = (): MeetingRoom[] => {
  return mockRooms.filter(room => room.status === 'available')
}
