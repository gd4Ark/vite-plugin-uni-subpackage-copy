Component({
  methods: {
    navToPkgA() {
      wx.navigateTo({
        url: '/pkg-a/pages/index/index',
      })
    },
    navToPkgB() {
      wx.navigateTo({
        url: '/pkg-b/pages/detail/index',
      })
    },
  },
})
