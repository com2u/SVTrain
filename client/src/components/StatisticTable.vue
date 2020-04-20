<template>
  <div>
    <div>
      <b-table-simple :class="{'statistic-table-responsive': responsive}" class="statistic-table">
        <b-thead>
          <b-tr>
            <b-th colspan="2" rowspan="2">
              <div class="input-container">
                <input type="radio" name="responsive" v-model="responsive" id="autofit" :value="false">
                <label for="autofit">Autofit</label>
                <input type="radio" name="responsive" v-model="responsive" id="scroll" :value="true">
                <label for="scroll">Scroll</label>
              </div>
              <div class="input-container">
                <input type="radio" name="exclude" v-model="exclude" id="excludeTrue" v-bind:value="true">
                <label for="excludeTrue">Exclude</label>
                <input type="radio" name="exclude" v-model="exclude" id="excludeFalse" v-bind:value="false">
                <label for="excludeFalse">All</label>
              </div>
            </b-th>
            <b-th class="header" :colspan="names.length">User classification</b-th>
          </b-tr>
          <b-tr>
            <b-th class="header" v-for="name in names" :key="name"> {{name}}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="(name1, index1) in names" :key="name1">
            <b-td v-if="index1 === 0" class="header"  :rowspan="names.length">AI classification</b-td>
            <b-td class="header">{{name1}}</b-td>
            <b-td v-for="(name2, index2) in names" :key="name2" :class="{'main-diagonal': index1 === index2}">
              <span v-if="table[name2][name1].all > 0" class="clickable-text">
                <a href="javascript:;" v-on:click="select(name1, name2)">
                  <span v-if="valuesView === 'absolute'">
                    {{ exclude ? table[name2][name1].exclude : table[name2][name1].all }}
                  </span>
                  <span v-if="valuesView === 'percentage'">
                    {{ Math.round(table[name2][name1][exclude ? 'exclude' : 'all'] / sumFor(name2) * 100) }}%
                  </span>
                </a>
              </span>
              <span v-else class="gray-text">0<span v-show="valuesView === 'percentage'">%</span></span>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
      <div class="input-container value-type-input">
        <input type="radio" name="view" v-model="valuesView" id="absoluteView" value="absolute">
        <label for="absoluteView">Absolute Numbers</label>
        <input type="radio" name="view" v-model="valuesView" id="percentageView" value="percentage">
        <label for="percentageView">Percentage</label>
      </div>
    </div>
  </div>
</template>

<script>

import EventBus from '../utils/eventbus';

export default {
  props: [
    'table',
    'folder',
  ],
  data() {
    return {
      valuesView: 'absolute',
      exclude: false,
      responsive: false,
      sums: {},
    };
  },
  methods: {
    select(dir1, dir2) {
      const gotoDir = `${this.folder}\\${dir1}`;
      console.log(' goto dir', gotoDir);
      EventBus.$emit('statistic-folder-selected', {
        folder: gotoDir,
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
      console.log(Object.keys(this.table)
        .map((n) => n));
      return Object.keys(this.table)
        .map((n) => n);
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

  .statistic-table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  th, td {
    border: 1px solid gray;
  }

  td.title {
    background: #bbb;
    font-weight: bold;
  }

  .statistic-table {
    td, thead {
      text-align: center;
    }

    .main-diagonal {
      background: #dadada;
    }

    .header {
      background: #676767;
      color: #fff;
      font-weight: 600;
      border: 1px solid #fff;
    }

    .gray-text {
      color: #5f5f5f;
    }

    .clickable-text {
      a {
        color: #000;
        font-weight: 600;
      }
    }
  }
  .input-container {
    input {
      margin-left: 10px;
    }
  }

  .value-type-input {
    text-align: right;
  }
</style>
