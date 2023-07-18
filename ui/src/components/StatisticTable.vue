<template>
  <div>
    <div>
      <b-table-simple
        striped
        :class="{'statistic-table-responsive': responsive}"
        class="statistic-table">
        <b-thead>
          <b-tr>
            <b-th colspan="2" rowspan="2" class="input-conner">
              <div class="input-container">
                <input type="radio" name="responsive" v-model="responsive" id="autofit" :value="false">
                <label for="autofit">Autofit</label>
                <input type="radio" name="responsive" v-model="responsive" id="scroll" :value="true">
                <label for="scroll">Scroll</label>
              </div>
            </b-th>
            <b-th class="header" :colspan="names.length">AI classification</b-th>
          </b-tr>
          <b-tr>
            <b-th class="header" v-for="name in names" :key="name"> {{name}}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="(name1, index1) in names" :key="name1">
            <b-td v-if="index1 === 0" class="header header-rotation"  :rowspan="names.length">
              <span class="rotation">User classification</span>
            </b-td>
            <b-td class="header">{{name1}}</b-td>
            <b-td v-for="(name2, index2) in names" :key="name2" :class="{'main-diagonal': index1 === index2}">
              <span v-if="table[name2][name1].all > 0" class="clickable-text">
                <a href="javascript:;" v-on:click="select(name1, name2)">
                  <span v-if="valuesView === 'absolute'">
                    {{ (table[name2][name1][exclude ? 'exclude' : 'all']).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}
                  </span>
                  <span v-if="valuesView === 'percentage'">
                    {{ (table[name2][name1][exclude ? 'exclude' : 'all'] / sumFor(name1) * 100).toFixed(1) }}%
                  </span>
                </a>
              </span>
              <span v-else class="gray-text">0<span v-show="valuesView === 'percentage'">%</span></span>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
      <div class="input-container value-type-input">
        <input type="radio" name="view" v-model="valuesView" id="absoluteView" value="absolute" @change="changeDataDisplayFormat(true)">
        <label for="absoluteView">Absolute Numbers</label>
        <input type="radio" name="view" v-model="valuesView" id="percentageView" value="percentage" @change="changeDataDisplayFormat(false)">
        <label for="percentageView">Percentage</label>
      </div>
    </div>
  </div>
</template>

<script>

import EventBus from '../utils/eventbus'

export default {
  props: {
    table: { type: Object, required: true },
    folder: { type: String, required: true },
    toggleDataDisplayFormat: { type: Function, required: true },
  },
  data() {
    return {
      valuesView: 'absolute',
      exclude: false,
      responsive: false,
      sums: {},
    }
  },
  methods: {
    changeDataDisplayFormat(isDataFormatAbsolute) {
      this.$props.toggleDataDisplayFormat(isDataFormatAbsolute)
    },
    select(dir1, dir2) {
      const gotoDir = `${this.folder}/${dir1}`
      console.log(' goto dir', gotoDir)
      EventBus.$emit('statistic-folder-selected', {
        folder: gotoDir,
        to: dir2,
        isStatistic: true,
        filter: {
          include: dir2,
          exclude: this.exclude ? '!' : null,
        },
      })
    },
    sumFor(name) {
      return Object.values(this.table)
        .map((row) => row[name][this.exclude ? 'exclude' : 'all'])
        .reduce((p, c) => c + p, 0)
    },
  },
  computed: {
    names() {
      return Object.keys(this.table)
        .map((n) => n)
    },

  },
  created() {
  },
}
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
    border: 1px solid #fff;
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
      background: #BFB8AF;
    }

    .header {
      background: #968B7C;
      color: #fff;
      font-weight: 600;
      border: 1px solid #fff;

      &.header-rotation {
        vertical-align: middle;
        text-align: center;

        .rotation {
          -ms-writing-mode: tb-rl;
          -webkit-writing-mode: vertical-rl;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
        }
      }
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

  .input-conner {
    padding: 0;
    vertical-align: middle;
  }
  .input-container {
    text-align: left;
    label {
      font-size: 12px;
      font-weight: bold;
      margin-right: 10px;
    }
  }

  .value-type-input {
    text-align: right;
  }

  .table-striped tbody tr:nth-of-type(odd) {
    background-color: #E8E6E3;
  }
  .table-striped tbody tr:nth-of-type(even) {
    background-color: #F4F3F2;
  }
</style>
