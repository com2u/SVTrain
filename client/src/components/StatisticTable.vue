<template>
  <div>
    <div>
      <span>Statistic for <b>{{ folder }}</b></span>
    </div>
    <div>
      <input type="radio" name="view" v-model="valuesView" id="absoluteView" value="absolute">
      <label for="absoluteView">Absolute Numbers</label>
      <input type="radio" name="view" v-model="valuesView" id="percentageView" value="percentage">
      <label for="percentageView">Percentage</label>
    </div>
    <div>
      <input type="radio" name="exclude" v-model="exclude" id="excludeTrue" v-bind:value="true">
      <label for="excludeTrue">Exclude</label>
      <input type="radio" name="exclude" v-model="exclude" id="excludeFalse" v-bind:value="false">
      <label for="excludeFalse">All</label>
    </div>
    <table>
      <tr>
        <td></td>
        <td v-for="name in names" v-bind:key="name" class="title">
          {{ name }}
        </td>
      </tr>
      <tr v-for="name1 in names" v-bind:key="name1">
        <td class="title">{{ name1 }}</td>
        <td v-for="name2 in names" v-bind:key="name2">
          <span v-if="table[name2][name1].all > 0">
            <a href="javascript:;" v-on:click="select(name1, name2)">
              <span v-if="valuesView === 'absolute'">
                {{ exclude ? table[name2][name1].exclude : table[name2][name1].all }}
              </span>
              <span v-if="valuesView === 'percentage'">
                {{ Math.round(table[name2][name1][exclude ? 'exclude' : 'all'] / sumFor(name2) * 100) }}%
              </span>
            </a>
          </span>
          <span v-else>
            0
          </span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: [
    'table',
    'folder',
  ],
  data() {
    return {
      valuesView: 'absolute',
      exclude: false,
      sums: {},
    };
  },
  methods: {
    select(dir1, dir2) {
      this.$emit('folderselected', {
        folder: dir1,
        filter: {
          include: dir2,
          exclude: this.exclude ? '!' : null,
        },
      });
    },
    sumFor(name) {
      return Object.keys(this.table[name])
        .map((n) => (this.exclude ? this.table[name][n].exclude : this.table[name][n].all))
        .reduce((p, c) => c + p);
    },
  },
  computed: {
    names() {
      console.log(Object.keys(this.table).map((n) => n));
      return Object.keys(this.table).map((n) => n);
    },
  },
  created() {
  },
};
</script>

<style lang="scss" scoped>
table {
  font-size: 11px;
  border-collapse: collapse;
}
table, th, td {
  border: 1px solid gray;
}
td.title {
  background: #bbb;
  font-weight: bold;
}
</style>
