export default ({ app }, inject) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:8000'
  inject('baseUrl', baseUrl)
}
