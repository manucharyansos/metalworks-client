export default (context, inject) => {
  const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d)) return 'Invalid Date'
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  inject('formatDate', formatDate)
}
