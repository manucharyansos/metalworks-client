import Vue from 'vue'
import L from 'leaflet'

// Create a plugin that makes Leaflet available globally
Vue.prototype.$leaflet = L

// Optionally, you can set the default icon for markers
delete L.Icon.Default.prototype._getIconUrl // Remove default URL

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})
