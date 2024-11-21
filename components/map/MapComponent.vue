<template>
  <div id="map"></div>
</template>

<script>
export default {
  name: 'MapComponent',
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      const map = this.$leaflet.map('map').setView([40.17161, 44.429071], 13)

      this.$leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        })
        .addTo(map)

      this.$leaflet
        .marker([40.17161, 44.429071])
        .addTo(map)
        .bindPopup('Րաֆֆու 111 ')
        .openPopup()
    },
  },
}
</script>

<style>
#map {
  height: 200px;
  width: 600px;
  z-index: 0;
}
@media screen and (max-width: 1280px) {
  #map {
    width: 400px;
  }
}
@media screen and (max-width: 1024px) {
  #map {
    width: 300px;
  }
}
@media screen and (max-width: 768px) {
  #map {
    margin: auto;
    width: 400px;
  }
}
@media screen and (max-width: 450px) {
  #map {
    margin: auto;
    width: 300px;
  }
}
</style>
