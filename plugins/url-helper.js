export default ({ $axios }, inject) => {
  const getFileUrl = (filePath) => `${$axios.defaults.baseURL}/storage/${filePath}`;
  inject('getFileUrl', getFileUrl);
};
