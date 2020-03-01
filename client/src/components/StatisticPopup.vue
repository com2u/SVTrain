<template>
  <div>
    <div v-if="statistic">
      <div class="right-side-section" v-if="statistic.calculated">
        <button
          v-bind:disabled="isLoading"
          v-on:click="calculate()">
          Calculate statistic{{ isLoading ? ' (loading...)' : ''}}
        </button>
        <br>
        <span v-if="!statistic.table">
            Statistic: matched={{statistic.matched}}, missed={{statistic.missed}}, missmatched={{statistic.missmatched}}
          </span>
        <button v-if="statistic.table" @click="toggleShowTable">Expand statistic table</button>
        <div v-show="showTable">
          <statistic-table
            v-on:folderselected="selectFolder"
            v-bind:folder="dir"
            v-bind:table="statistic.table"/>
        </div>
      </div>
      <div v-else class="right-side-section">
        Statistic didn't calculated
      </div>
    </div>
  </div>
</template>

<script>
  import StatisticTable from "./StatisticTable.vue";
  import api from "../api";

  export default {
    name: "StatisticPopup",
    components: {StatisticTable},
    data() {
      return {
        statistic: null,
        isLoading: false,
        dir: '',
        showTable: false
      }
    },
    methods: {
      open(dir) {
        this.dir = dir
        this.load(dir)
      },
      async load(dir) {
        if (!dir) {
          dir = this.dir
        }
        const response = await api.getStatistic(dir)
        this.statistic = response
      },
      async calculate() {
        this.isLoading = true
        await api.calculateStatistic()
        await this.load()
        this.isLoading = false
      },
      toggleShowTable() {
        this.showTable = !this.showTable
      },
      selectFolder(item) {
        const gotoDir = `${this.dir}\\${item.folder}`
        this.$router.push({name: 'explorer', query: {dir: gotoDir}})
      }
    }
  }
</script>

<style scoped>

</style>
