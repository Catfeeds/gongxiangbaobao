/**
 * 工具包
 */

module.exports = Behavior({
  behaviors: [],
  properties: {

  },
  data: {

  },
  attached: function () {

  },
  methods: {
    truncate(s, max=10) {
      console.log(s)
      if (s.length > max) {
        return s.substr(0, max) + '...'
      }
      return s
    }
  }
})