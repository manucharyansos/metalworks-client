// plugins/tawk.js
export default () => {
  if (!process.client) return

  // սրանք optional են, բայց լավ ա որ լինեն
  window.Tawk_API = window.Tawk_API || {}
  window.Tawk_LoadStart = new Date()
  ;(function () {
    const s1 = document.createElement('script')
    const s0 = document.getElementsByTagName('script')[0]

    s1.async = true
    s1.src = 'https://embed.tawk.to/693a8a4d63fe071984ec644d/1jc6aog5i'
    s1.charset = 'UTF-8'
    s1.setAttribute('crossorigin', '*')

    s0.parentNode.insertBefore(s1, s0)
  })()
}
