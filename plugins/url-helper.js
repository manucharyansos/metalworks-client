export default ({ $axios }, inject) => {
  const getFileUrl = (filePath) =>
    `${$axios.defaults.baseURL}/api/storage/${filePath}`
  inject('getFileUrl', getFileUrl)
}
