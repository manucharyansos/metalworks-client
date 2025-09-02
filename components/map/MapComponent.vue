<template>
  <div ref="wrapper" class="relative w-full h-full">
    <div ref="map" class="absolute inset-0"></div>
  </div>
</template>

<script>
export default {
  name: 'MapComponent',
  props: {
    lat: { type: Number, default: 40.17161 },
    lng: { type: Number, default: 44.429071 },
    zoom: { type: Number, default: 13 },
    popup: { type: String, default: 'Րաֆֆու 111' },
    scrollWheelZoom: { type: Boolean, default: false }, // footer-ի համար հարմար է off
    tileUrl: {
      type: String,
      default: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
    maxZoom: { type: Number, default: 19 },
  },
  data() {
    return { map: null, ro: null }
  },
  mounted() {
    if (!this.$leaflet) return
    this.initMap()

    this.$nextTick(() =>
      setTimeout(() => this.map && this.map.invalidateSize(), 50)
    )

    this.ro = new ResizeObserver(() => this.map && this.map.invalidateSize())
    this.ro.observe(this.$refs.wrapper)
  },
  beforeDestroy() {
    if (this.ro) {
      this.ro.disconnect()
      this.ro = null
    }
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
  methods: {
    initMap() {
      const L = this.$leaflet
      const center = [this.lat, this.lng]

      this.map = L.map(this.$refs.map, {
        center,
        zoom: this.zoom,
        scrollWheelZoom: this.scrollWheelZoom,
      })

      L.tileLayer(this.tileUrl, {
        maxZoom: this.maxZoom,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map)

      const marker = L.marker(center).addTo(this.map)
      if (this.popup) marker.bindPopup(this.popup)
    },
    setView(lat, lng, zoom = this.zoom) {
      if (this.map) this.map.setView([lat, lng], zoom)
    },
  },
}
</script>

<style scoped></style>
