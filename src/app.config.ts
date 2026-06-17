export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/rooms/index',
    'pages/approval/index',
    'pages/mine/index',
    'pages/booking-detail/index',
    'pages/room-detail/index',
    'pages/approval-detail/index',
    'pages/create-booking/index',
    'pages/my-bookings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '会议室预约',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/rooms/index',
        text: '会议室'
      },
      {
        pagePath: 'pages/approval/index',
        text: '审批'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
