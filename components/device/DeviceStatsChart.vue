<template>
  <div class="device-stats">
    <div class="device-stat">
      <h3>Desktop</h3>
      <div
        class="progress-circle"
        :style="{
          background: `conic-gradient(#42b883 ${desktopPercentage}%, #ddd ${desktopPercentage}% 100%)`,
        }"
      >
        <span>{{ desktopPercentage }}%</span>
      </div>
    </div>

    <div class="device-stat">
      <h3>Mobile</h3>
      <div
        class="progress-circle"
        :style="{
          background: `conic-gradient(#ff6666 ${mobilePercentage}%, #ddd ${mobilePercentage}% 100%)`,
        }"
      >
        <span>{{ mobilePercentage }}%</span>
      </div>
    </div>

    <div class="device-stat">
      <h3>Tablet</h3>
      <div
        class="progress-circle"
        :style="{
          background: `conic-gradient(#ffc107 ${tabletPercentage}%, #ddd ${tabletPercentage}% 100%)`,
        }"
      >
        <span>{{ tabletPercentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      desktopPercentage: 0,
      mobilePercentage: 0,
      tabletPercentage: 0,
    }
  },
  mounted() {
    this.fetchDeviceStats()
  },
  methods: {
    async fetchDeviceStats() {
      try {
        const response = await this.$axios.get('/api/visitor-stats')
        const { desktop, mobile, tablet } = response.data

        const total = desktop + mobile + tablet
        this.desktopPercentage = total
          ? ((desktop / total) * 100).toFixed(0)
          : 0
        this.mobilePercentage = total ? ((mobile / total) * 100).toFixed(0) : 0
        this.tabletPercentage = total ? ((tablet / total) * 100).toFixed(0) : 0
      } catch (error) {
        console.error('Error fetching device stats:', error)
      }
    },
  },
}
</script>

<style scoped>
.device-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 50px;
}

.device-stat {
  text-align: center;
}

.progress-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  color: #fff;
  background: conic-gradient(
    #42b883 75%,
    /* Desktop color fills 75% of the circle */ #ddd 75% 100%
      /* The remaining part of the circle is gray */
  );
  margin-top: 20px;
  position: relative;
}

.progress-circle span {
  position: absolute;
}
</style>
