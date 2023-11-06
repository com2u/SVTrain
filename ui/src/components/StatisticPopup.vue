<template>
  <div>
    <b-button
      :disabled="isLoading || backgroundCalculating"
      @click="calculate(dir)">
        Calculate statistic{{ isLoading || backgroundCalculating ? ' (loading...)' : ''}}
      </b-button>
    <div v-if="statistic">
      <div class="right-side-section" v-if="statistic.calculated !== false">
        <div class="caption">
          <div>{{currentFolder}}</div>
          <div>
            Matched: {{ this.isDataFormatAbsolute ? formatNumberWithCommas(this.statistic.matched) : convertDecimalUptoTwoDigit((this.statistic.matched/(this.statistic.matched + this.statistic.mismatched))*100) + '%'}}
            | Mismatched: {{
              this.isDataFormatAbsolute ? formatNumberWithCommas(this.statistic.mismatched)
              : convertDecimalUptoTwoDigit((this.statistic.mismatched/(this.statistic.matched + this.statistic.mismatched))*100) + '%'}}
            | Unclassified: {{
              this.isDataFormatAbsolute ? formatNumberWithCommas(this.statistic.unclassified)
              : convertDecimalUptoTwoDigit((this.statistic.unclassified/(this.statistic.matched + this.statistic.mismatched))*100) + '%'
              }}
          </div>
        </div>
        <statistic-table
          v-bind:folder="dir"
          v-bind:table="statistic.table"
          :toggleDataDisplayFormat = "toggleDataDisplayFormat"/>
      </div>
      <div v-else class="right-side-section">
        Statistic didn't calculated
      </div>
    </div>
  </div>
</template>

<script>
import StatisticTable from './StatisticTable.vue'
import api from '../utils/api'

export default {
  name: 'StatisticPopup',
  components: { StatisticTable },
  data() {
    return {
      statistic: null,
      isLoading: false,
      dir: '',
      showTable: false,
      isDataFormatAbsolute: true,
    }
  },
  computed: {
    backgroundCalculating() {
      return this.$store.state.app.calculating
    },

    currentFolder() {
      const { root } = this.$store.state.app.config
      if (root && this.dir) {
        return this.dir.substring(root.length)
      }
      return ''
    },
  },
  methods: {
    formatNumberWithCommas(number) {
      return number.toLocaleString()
    },
    convertDecimalUptoTwoDigit(selectionPercentage) {
      return selectionPercentage.toFixed(2)
    },
    toggleDataDisplayFormat(isDataFormatAbsolute) {
      this.isDataFormatAbsolute = isDataFormatAbsolute
    },
    open(dir) {
      if (typeof dir === 'object') {
        this.statistic = dir
        this.dir = dir.path
        this.isLoading = false
        return
      }
      this.dir = dir
      this.load(dir)
    },
    async load(dir) {
      if (!dir) {
        // eslint-disable-next-line no-param-reassign
        dir = this.dir
      }
      const response = await api.getStatistic(dir)
      const folderInfo = await api.getSubfolders(dir)
      if (folderInfo.hasSubFolders && folderInfo.subFolders) {
        this.statistic = {
          ...folderInfo,
          ...this.sumObjectsByKey({
            classified: folderInfo.classified,
            unclassified: folderInfo.unclassified,
            missed: folderInfo.missed,
            matched: folderInfo.matched,
            mismatched: folderInfo.mismatched,
          }, ...folderInfo.subFolders),
        }
      } else {
        this.statistic = folderInfo
      }
      console.log(folderInfo)
      this.statistic.table = response.table
    },
    async calculate(dir) {
      this.isLoading = true
      await api.calculateStatistic(dir)
      await this.load()
      this.isLoading = false
    },
    toggleShowTable() {
      this.showTable = !this.showTable
    },
    selectFolder(item) {
      const gotoDir = `${this.dir}\\${item.folder}`
      this.$router.push({ name: 'explorer', query: { dir: gotoDir } })
    },
    getSubFolderStatistics(folderInfo) {
      if (folderInfo.hasSubFolders && folderInfo.subFolders) {
        return this.sumObjectsByKey(...folderInfo.subFolders)
      }
      return folderInfo
    },
    sumObjectsByKey(...objs) {
      return objs.reduce((totalStats, currentSubFolder) => {
        const subFolderStats = {
          ...currentSubFolder,
          ...this.getSubFolderStatistics(currentSubFolder),
        }
        Object.entries(subFolderStats).forEach(([key, value]) => {
          if (!Number.isInteger(value)) return
          totalStats[key] = (totalStats[key] || 0) + value // eslint-disable-line no-param-reassign
        })
        return totalStats
      }, {})
    },
  },
}
</script>

<style scoped lang="scss">
  .caption {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
  }
</style>
