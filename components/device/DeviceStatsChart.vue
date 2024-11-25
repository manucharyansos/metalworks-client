<template>
  <div class="device-stats">
    <!-- Circle Chart -->
    <div class="progress-circle" :style="circleStyle">
      <div class="circle-center">{{ totalVisitors }} Total</div>
    </div>

    <!-- Device Counts Below the Circle -->
    <div class="stats-info">
      <div v-for="(device, type) in deviceData" :key="type" class="stats-item">
        <span class="device-label" :style="{ color: device.color }"
          >{{ type }}:</span
        >
        <span class="device-count">{{ device.count }}</span>
        <span class="device-percentage">({{ device.percentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalVisitors: 0,
      deviceData: {
        desktop: { percentage: 0, count: 0, color: '#42b883' },
        mobile: { percentage: 0, count: 0, color: '#ff6666' },
        tablet: { percentage: 0, count: 0, color: '#ffc107' },
      },
    }
  },
  computed: {
    circleStyle() {
      // Generate a conic-gradient using the percentages and colors from deviceData
      const gradients = Object.values(this.deviceData)
        .map(({ percentage, color }, index, arr) => {
          const start = arr
            .slice(0, index)
            .reduce((sum, { percentage }) => sum + percentage, 0)
          const end = start + percentage
          return `${color} ${start}% ${end}%`
        })
        .join(', ')
      return {
        background: `conic-gradient(${gradients})`,
      }
    },
  },
  mounted() {
    this.fetchDeviceStats()
  },
  methods: {
    async fetchDeviceStats() {
      try {
        const response = await this.$axios.get('/api/visitor-stats')
        const { total, desktop, mobile, tablet } = response.data

        this.totalVisitors = total
        this.deviceData.desktop = {
          percentage: desktop.percentage.toFixed(1),
          count: desktop.count,
          color: '#42b883',
        }
        this.deviceData.mobile = {
          percentage: mobile.percentage.toFixed(1),
          count: mobile.count,
          color: '#ff6666',
        }
        this.deviceData.tablet = {
          percentage: tablet.percentage.toFixed(1),
          count: tablet.count,
          color: '#ffc107',
        }
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
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.progress-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 30px;
}

.circle-center {
  position: absolute;
  font-size: 1.2em;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.stats-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  width: 250px;
  margin: 5px 0;
  font-size: 1em;
}

.device-label {
  font-weight: bold;
}

.device-count {
  margin-left: auto;
  color: #333;
}

.device-percentage {
  margin-left: 10px;
  color: gray;
}
</style>
