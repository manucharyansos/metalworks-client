<template>
  <main
    class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6"
  >
    <div
      class="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Header -->
      <div
        class="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-800 to-gray-600 text-white"
      >
        <h1 class="text-3xl md:text-4xl font-bold">Նախագծեր</h1>
      </div>

      <!-- Body -->
      <div class="p-6 md:p-8 h-screen">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- GROUP -->
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-indigo-700">Խումբ</h2>

            <!-- Ծածկագիր (≡ also finds by Անվանում) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >Ծածկագիր</label
              >
              <div class="relative">
                <input
                  v-model.trim="pmpGroup"
                  type="text"
                  maxlength="3"
                  class="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  placeholder="000"
                  autocomplete="off"
                  @focus="openDropdown('groupCode')"
                  @input="onGroupCodeInput"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 text-gray-500"
                  @click="toggleDropdown('groupCode')"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <transition name="fade">
                <div
                  v-if="isDD.groupCode && filteredGroupsByGroup.length"
                  class="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto z-10"
                >
                  <ul class="py-2">
                    <li
                      v-for="p in filteredGroupsByGroup"
                      :key="p.id"
                      class="px-4 py-3 hover:bg-indigo-50 cursor-pointer flex justify-between"
                      @click="applyGroup(p)"
                    >
                      <span class="font-mono font-bold text-indigo-700">{{
                        p.group
                      }}</span>
                      <span class="text-sm text-gray-600 truncate ml-2">{{
                        p.group_name
                      }}</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>

            <!-- Անվանում (≡ also finds by Ծածկագիր) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >Անվանում</label
              >
              <div class="relative">
                <input
                  v-model.trim="pmpGroupName"
                  type="text"
                  class="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Մուտքագրեք անվանում"
                  autocomplete="off"
                  @focus="openDropdown('groupName')"
                  @input="onGroupNameInput"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 text-gray-500"
                  @click="toggleDropdown('groupName')"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <transition name="fade">
                <div
                  v-if="isDD.groupName && filteredGroupsByName.length"
                  class="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto"
                >
                  <ul class="py-2">
                    <li
                      v-for="p in filteredGroupsByName"
                      :key="p.id"
                      class="px-4 py-3 hover:bg-indigo-50 cursor-pointer"
                      @click="applyGroup(p)"
                    >
                      {{ p.group_name }}
                      <span class="text-gray-400">· {{ p.group }}</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>
          </div>

          <!-- REMOTE -->
          <div
            class="space-y-6"
            :class="{ 'opacity-50 pointer-events-none': !isExistingGroup }"
          >
            <h2 class="text-2xl font-bold text-purple-700">Ենթախումբ</h2>

            <!-- Համար (≡ also finds by Նկարագրություն) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >Համար</label
              >
              <div class="relative">
                <input
                  v-model.trim="pmpRemoteNumber"
                  type="text"
                  maxlength="2"
                  :disabled="!isExistingGroup"
                  class="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="00"
                  autocomplete="off"
                  @focus="openDropdown('remoteCode')"
                  @input="onRemoteCodeInput"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 text-gray-500"
                  :disabled="!isExistingGroup"
                  @click="toggleDropdown('remoteCode')"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <transition name="fade">
                <div
                  v-if="isDD.remoteCode && filteredRemotesByNumber.length"
                  class="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto"
                >
                  <ul class="py-2">
                    <li
                      v-for="r in filteredRemotesByNumber"
                      :key="r.id"
                      class="px-4 py-3 hover:bg-purple-50 cursor-pointer flex justify-between"
                      @click="applyRemote(r)"
                    >
                      <span class="font-mono font-bold text-purple-700">{{
                        r.remote_number
                      }}</span>
                      <span class="text-sm text-gray-600 truncate ml-2">{{
                        r.remote_number_name
                      }}</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>

            <!-- Նկարագրություն (≡ also finds by Համար) -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-1"
                >Նկարագրություն</label
              >
              <div class="relative">
                <input
                  v-model.trim="pmpRemoteNumberName"
                  type="text"
                  :disabled="!isExistingGroup"
                  class="w-full pl-4 pr-10 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Մուտքագրեք նկարագրություն"
                  autocomplete="off"
                  @focus="openDropdown('remoteName')"
                  @input="onRemoteNameInput"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 text-gray-500"
                  :disabled="!isExistingGroup"
                  @click="toggleDropdown('remoteName')"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <transition name="fade">
                <div
                  v-if="isDD.remoteName && filteredRemotesByName.length"
                  class="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-2xl border max-h-64 overflow-y-auto"
                >
                  <ul class="py-2">
                    <li
                      v-for="r in filteredRemotesByName"
                      :key="r.id"
                      class="px-4 py-3 hover:bg-purple-50 cursor-pointer"
                      @click="applyRemote(r)"
                    >
                      {{ r.remote_number_name }}
                      <span class="text-gray-400">· {{ r.remote_number }}</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="flex flex-col justify-end space-y-4">
            <button
              v-if="showCreateGroup"
              class="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg"
              @click="addPmpGroup"
            >
              Ստեղծել խումբ
            </button>

            <button
              v-if="showCreateRemote"
              class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg"
              @click="addPmpGroupRemoteNumber"
            >
              Ստեղծել ենթախումբ
            </button>

            <button
              v-if="showView"
              class="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
              @click="viewFiles"
            >
              Դիտել ֆայլերը
            </button>
          </div>
        </div>
      </div>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EngineerProjects',
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data() {
    return {
      // form
      pmpGroup: '',
      pmpGroupName: '',
      pmpRemoteNumber: '',
      pmpRemoteNumberName: '',
      isDD: {
        groupCode: false,
        groupName: false,
        remoteCode: false,
        remoteName: false,
      },
      pmpId: null,
      remoteNumberId: null,
      pmpRemoteNumbers: [],
    }
  },

  computed: {
    ...mapGetters('pmp', ['getPmpes']),
    filteredGroupsByGroup() {
      const q = (this.pmpGroup || '').toLowerCase()
      const list = this.getPmpes?.pmp || []
      if (!q) return list
      return list.filter(
        (p) =>
          String(p.group || '')
            .toLowerCase()
            .includes(q) ||
          String(p.group_name || '')
            .toLowerCase()
            .includes(q)
      )
    },
    filteredGroupsByName() {
      const q = (this.pmpGroupName || '').toLowerCase()
      const list = this.getPmpes?.pmp || []
      if (!q) return list
      return list.filter(
        (p) =>
          String(p.group_name || '')
            .toLowerCase()
            .includes(q) ||
          String(p.group || '')
            .toLowerCase()
            .includes(q)
      )
    },

    existingGroup() {
      const list = this.getPmpes?.pmp || []
      const code = this.pmpGroup ? this.pmpGroup.padStart(3, '0') : null
      const name = this.pmpGroupName || null
      return (
        list.find(
          (p) =>
            (code && String(p.group) === code) ||
            (name && String(p.group_name) === name)
        ) || null
      )
    },
    isExistingGroup() {
      return !!this.existingGroup
    },

    filteredRemotesByNumber() {
      const q = (this.pmpRemoteNumber || '').toLowerCase()
      const list = this.pmpRemoteNumbers || []
      if (!q) return list
      return list.filter(
        (r) =>
          String(r.remote_number || '')
            .toLowerCase()
            .includes(q) ||
          String(r.remote_number_name || '')
            .toLowerCase()
            .includes(q)
      )
    },
    filteredRemotesByName() {
      const q = (this.pmpRemoteNumberName || '').toLowerCase()
      const list = this.pmpRemoteNumbers || []
      if (!q) return list
      return list.filter(
        (r) =>
          String(r.remote_number_name || '')
            .toLowerCase()
            .includes(q) ||
          String(r.remote_number || '')
            .toLowerCase()
            .includes(q)
      )
    },

    showCreateGroup() {
      return !!this.pmpGroup && !!this.pmpGroupName && !this.isExistingGroup
    },
    showCreateRemote() {
      if (!this.isExistingGroup) return false
      if (!this.pmpRemoteNumber || !this.pmpRemoteNumberName) return false
      const num = this.pmpRemoteNumber.padStart(2, '0')
      const dup = (this.pmpRemoteNumbers || []).some(
        (r) =>
          String(r.remote_number) === String(num) ||
          String(r.remote_number_name) === String(this.pmpRemoteNumberName)
      )
      return !dup
    },
    showView() {
      return this.isExistingGroup && !!this.remoteNumberId
    },
  },

  watch: {
    pmpGroup() {
      this.onGroupFieldsChanged()
    },
    pmpGroupName() {
      this.onGroupFieldsChanged()
    },

    pmpRemoteNumber() {
      this.linkRemoteByInputs()
    },
    pmpRemoteNumberName() {
      this.linkRemoteByInputs()
    },
  },

  created() {
    this.fetchPmps()
  },

  methods: {
    ...mapActions('pmp', ['fetchPmps', 'createPmp', 'rememberNumberPmp']),

    toggleDropdown(which) {
      Object.keys(this.isDD).forEach(
        (k) => (this.isDD[k] = k === which ? !this.isDD[k] : false)
      )
    },
    openDropdown(which) {
      // eslint-disable-next-line no-return-assign
      Object.keys(this.isDD).forEach((k) => (this.isDD[k] = k === which))
    },

    onGroupCodeInput() {
      this.isDD.groupCode = true
    },
    onGroupNameInput() {
      this.isDD.groupName = true
    },
    onRemoteCodeInput() {
      if (this.isExistingGroup) this.isDD.remoteCode = true
    },
    onRemoteNameInput() {
      if (this.isExistingGroup) this.isDD.remoteName = true
    },

    applyGroup(p) {
      this.pmpGroup = p.group
      this.pmpGroupName = p.group_name
      this.isDD.groupCode = false
      this.isDD.groupName = false
      this.onGroupFieldsChanged()
    },

    applyRemote(r) {
      this.pmpRemoteNumber = r.remote_number
      this.pmpRemoteNumberName = r.remote_number_name
      this.remoteNumberId = r.id
      this.isDD.remoteCode = false
      this.isDD.remoteName = false
    },

    onGroupFieldsChanged() {
      const g = this.existingGroup
      if (g) {
        this.pmpId = g.id
        this.pmpRemoteNumbers = Array.isArray(g.remote_number)
          ? g.remote_number
          : []
        this.linkRemoteByInputs()
      } else {
        this.pmpId = null
        this.pmpRemoteNumbers = []
        this.pmpRemoteNumber = ''
        this.pmpRemoteNumberName = ''
        this.remoteNumberId = null
      }
    },

    linkRemoteByInputs() {
      if (!this.isExistingGroup) {
        this.remoteNumberId = null
        return
      }
      const list = this.pmpRemoteNumbers || []
      const num = this.pmpRemoteNumber
        ? this.pmpRemoteNumber.padStart(2, '0')
        : null
      const name = this.pmpRemoteNumberName || null
      const hit = list.find(
        (r) =>
          (num && String(r.remote_number) === String(num)) ||
          (name && String(r.remote_number_name) === String(name))
      )
      if (hit) this.applyRemote(hit)
      else this.remoteNumberId = null
    },

    async addPmpGroup() {
      if (!this.pmpGroup || !this.pmpGroupName) {
        this.$notify({ type: 'error', text: 'Լրացրեք Խումբի երկու դաշտերն էլ' })
        return
      }
      if (
        (this.pmpRemoteNumber && !this.pmpRemoteNumberName) ||
        (!this.pmpRemoteNumber && this.pmpRemoteNumberName)
      ) {
        this.$notify({
          type: 'error',
          text: 'Ենթախմբի համարն ու նկարագրությունը լրացրեք միասին կամ թողեք դատարկ',
        })
        return
      }

      const payload = {
        group: this.pmpGroup.padStart(3, '0'),
        group_name: this.pmpGroupName,
        admin_confirmation: true,
        remote_number: this.pmpRemoteNumber
          ? this.pmpRemoteNumber.padStart(2, '0')
          : null,
        remote_number_name: this.pmpRemoteNumberName || null,
      }

      try {
        await this.createPmp(payload)
        this.$notify({ type: 'success', text: 'Խումբը ստեղծվեց' })
        this.resetAll()
        await this.fetchPmps()
      } catch (e) {
        this.$notify({
          type: 'error',
          text: e?.response?.data?.message || 'Սխալ խումբ ստեղծելիս',
        })
      }
    },

    async addPmpGroupRemoteNumber() {
      if (!this.isExistingGroup) {
        this.$notify({ type: 'error', text: 'Սկզբում ընտրեք խումբ' })
        return
      }
      if (!this.pmpRemoteNumber || !this.pmpRemoteNumberName) {
        this.$notify({
          type: 'error',
          text: 'Լրացրեք Ենթախմբի երկու դաշտերն էլ',
        })
        return
      }
      const num = this.pmpRemoteNumber.padStart(2, '0')
      const dup = (this.pmpRemoteNumbers || []).some(
        (r) =>
          String(r.remote_number) === String(num) ||
          String(r.remote_number_name) === String(this.pmpRemoteNumberName)
      )
      if (dup) {
        this.$notify({
          type: 'error',
          text: 'Այդ համարը կամ անվանումն արդեն կա այս խմբում',
        })
        return
      }

      try {
        const res = await this.rememberNumberPmp({
          id: this.existingGroup.id,
          group: this.pmpGroup.padStart(3, '0'),
          group_name: this.pmpGroupName,
          remote_number: num,
          remote_number_name: this.pmpRemoteNumberName,
        })
        this.$notify({ type: 'success', text: 'Ենթախումբը ստեղծվեց' })
        await this.fetchPmps()
        const rid =
          res?.remote_number_id ||
          this.findRemoteId(num, this.pmpRemoteNumberName)
        if (rid)
          this.$router.push({
            path: '/engineer/files/view',
            query: { id: rid },
          })
        this.resetAll()
      } catch (e) {
        this.$notify({
          type: 'error',
          text: e?.response?.data?.message || 'Սխալ ենթախումբ ստեղծելիս',
        })
      }
    },

    viewFiles() {
      if (!this.remoteNumberId) {
        this.$notify({ type: 'error', text: 'Ընտրեք ենթախումբ' })
        return
      }
      this.$router.push({
        path: '/engineer/files/view',
        query: { id: this.remoteNumberId },
      })
    },

    findRemoteId(num, name) {
      const g = this.getPmpes?.pmp?.find((p) => p.id === this.existingGroup?.id)
      const hit = g?.remote_number?.find(
        (r) =>
          String(r.remote_number) === String(num) &&
          String(r.remote_number_name) === String(name)
      )
      return hit?.id || null
    },

    resetAll() {
      this.pmpGroup = ''
      this.pmpGroupName = ''
      this.pmpRemoteNumber = ''
      this.pmpRemoteNumberName = ''
      this.pmpId = null
      this.remoteNumberId = null
      this.pmpRemoteNumbers = []
      // eslint-disable-next-line no-return-assign
      Object.keys(this.isDD).forEach((k) => (this.isDD[k] = false))
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
