import Vue from 'vue'
import moment from 'moment'

Vue.prototype.$moment = function (date, explicitFormat = null) {
  if (!date) return moment.invalid()

  const formats = explicitFormat
    ? [explicitFormat]
    : [
        'DD/MM/YYYY HH:mm',
        'DD/MM/YYYY',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'YYYY-MM-DD',
      ]

  return moment(date, formats, true)
}

Vue.filter('date', (value, outputFormat = 'DD/MM/YYYY HH:mm') => {
  if (!value) return '—'

  const m = moment(
    value,
    [
      'DD/MM/YYYY HH:mm',
      'DD/MM/YYYY',
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DDTHH:mm:ss.SSSZ',
      'YYYY-MM-DD',
    ],
    true
  )

  return m.isValid() ? m.format(outputFormat) : value
})
