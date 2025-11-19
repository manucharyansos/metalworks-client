import Vue from 'vue'
import moment from 'moment'

Vue.prototype.$moment = moment

Vue.filter('formatDate', function (date, format = 'DD/MM/YYYY HH:mm') {
  if (!date) return '—'
  return moment(date).format(format)
})
