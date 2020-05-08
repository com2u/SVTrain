<template>
  <div>
<!--    <b-button-->
<!--      :disabled="isLoading || backgroundCalculating"-->
<!--      @click="calculate()">-->
<!--      Calculate statistic{{ isLoading || backgroundCalculating ? ' (loading...)' : ''}}-->
<!--    </b-button>-->
    <div v-if="statistic">
      <div class="right-side-section" v-if="statistic.calculated">
        <div class="caption">
          <div>{{currentFolder}}</div>
          <div>
            Matched: {{this.statistic.matched}}
            | Mismatched: {{this.statistic.missmatched}}
            | Unclassified: {{this.statistic.unclassified}}
          </div>
        </div>
        <statistic-table
          v-bind:folder="dir"
          v-bind:table="statistic.table"/>
      </div>
      <div v-else class="right-side-section">
        Statistic didn't calculated
      </div>
    </div>
  </div>
</template>

<script>
import StatisticTable from './StatisticTable.vue';
import api from '../utils/api';

export default {
  name: 'StatisticPopup',
  components: { StatisticTable },
  data() {
    return {
      statistic: null,
      isLoading: false,
      dir: '',
      showTable: false,
    };
  },
  computed: {
    backgroundCalculating() {
      return this.$store.state.app.calculating;
    },

    currentFolder() {
      const { root } = this.$store.state.app.config;
      if (root && this.dir) {
        return this.dir.substring(root.length);
      }
      return '';
    },
  },
  methods: {
    open(dir) {
      this.dir = dir;
      this.load(dir);
    },
    async load(dir) {
      if (!dir) {
        // eslint-disable-next-line no-param-reassign
        dir = this.dir;
      }
      const response = await api.getStatistic(dir);
      console.log(response);
      this.statistic = response;
    },
    async calculate() {
      this.isLoading = true;
      await api.calculateStatistic();
      await this.load();
      this.isLoading = false;
    },
    toggleShowTable() {
      this.showTable = !this.showTable;
    },
    selectFolder(item) {
      const gotoDir = `${this.dir}\\${item.folder}`;
      this.$router.push({ name: 'explorer', query: { dir: gotoDir } });
    },
  },
};
</script>

<style scoped lang="scss">
  .caption {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;
  }
</style>
