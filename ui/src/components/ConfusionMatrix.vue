<template>
  <div>
    <div>
      <div v-if="matrix && cols.length && rows.length" class="right-side-section">
        <div class="caption">
          <div v-if="calculated">
            Matched: {{calculated.matched}}
            | Mismatched: {{calculated['miss_matched']}}
            | Unclassified: {{calculated.unclassified}}
          </div>
        </div>
        <b-table-simple striped :class="{'statistic-table-responsive': false}" class="statistic-table" data-e2e-testid="statistic-table">
          <b-thead>
            <b-tr>
              <b-th colspan="2" rowspan="2" class="input-conner"></b-th>
              <b-th class="header" :colspan="cols.length" @click="loadSub(null)" :class="{'clickable': subPaths.length}">{{ getDirName(dir) }}</b-th>
            </b-tr>
            <b-tr>
              <b-th class="header clickable underline" v-for="col in cols" :key="col" @click="loadSub(col)">{{col}}</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="(row, index1) in rows" :key="index1">
              <b-td style="width: 50px" v-if="index1 === 0" class="header header-rotation"  :rowspan="rows.length">
                <span class="rotation">{{getDirName(currentWS)}}</span>
              </b-td>
              <b-td style="width: 20%" class="header">{{row}}</b-td>
              <b-td v-for="(col, index2) in cols" :key="index2" :class="{'main-diagonal': index1 === index2}">
                <div v-if="valuesView === 'absolute'" :data-e2e-testid="`table${col}${row}`">
                  <span
                    v-if="matrix[index2][index1] > 0"
                    class="clickable-text"
                  >
                    <a href="javascript:;" v-on:click="select(col, row)">
                      <span>{{ matrix[index2][index1] }}</span>
                    </a>
                  </span>
                  <span v-else class="gray-text">0</span>
                </div>
                <div v-else :data-e2e-testid="`table${col}${row}`">
                  <span
                    v-if="percentageMatrix[index2][index1] > 0"
                    class="clickable-text"
                  >
                    <a href="javascript:;" v-on:click="select(col, row)">
                      <span>{{ percentageMatrix[index2][index1] + "%" }}</span>
                    </a>
                  </span>
                  <span v-else class="gray-text">0%</span>
                </div>
               </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <div class="input-container value-type-input">
          <input
            type="radio"
            name="view"
            v-model="valuesView"
            id="absoluteView"
            value="absolute"
            @click="changeDataDisplayFormat(true)"
          />
          <label for="absoluteView">Absolute Numbers</label>
          <input
            type="radio"
            name="view"
            v-model="valuesView"
            id="percentageView"
            value="percentage"
            @click="changeDataDisplayFormat(false)"
          />
          <label for="percentageView">Percentage</label>
        </div>
      </div>
      <div v-else class="right-side-section">
        <span v-if="isLoading">Data are loading...</span>
        <span v-else>Data is empty!</span>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/utils/eventbus'
import api from '../utils/api'

export default {
  name: 'ConfusionMatrix',
  data() {
    return {
      isLoading: false,
      dir: '',
      subPaths: [],
      currentRight: '',
      matrix: [],
      percentageMatrix: [],
      valuesView: 'absolute',
      cols: [],
      rows: [],
    }
  },
  computed: {
    calculated() {
      return null
    },
    currentWS() {
      return this.$store.state.app.config.wsPath
    },
  },
  methods: {
    async loadSub(subDir) {
      if (subDir) {
        this.subPaths.push(subDir)
      } else {
        this.subPaths.pop()
      }

      await this.load(this.dir)
    },
    async load(dir) {
      this.isLoading = true
      let left = dir
      let right = this.$store.getters.currentWs
      if (this.subPaths.length) {
        const subPath = this.subPaths.join('/')
        left = `${left}/${subPath}`
        right = `${right}/${subPath}`
      }
      const { matrix, compareNames, percentageMatrix } = await api.fetchConfusionMatrix(left, right)
      this.matrix = matrix
      this.percentageMatrix = percentageMatrix
      this.cols = compareNames
      this.rows = compareNames.concat('Order')
      this.isLoading = false
    },
    getDirName(dir) {
      if (this.subPaths.length > 1) {
        return this.subPaths[this.subPaths.length - 2]
      }
      return dir.split('/')[dir.split('/').length - 1]
    },
    select(dir1, dir2) {
      let left = `${this.dir}`
      let right = `${this.getDirName(this.$store.state.app.config.wsPath)}`
      if (this.subPaths.length) {
        const subPath = this.subPaths.join('/')
        left = `${left}/${subPath}`
        right = `${right}/${subPath}`
      }
      left = `${left}/${dir1}`
      right = `${right}/${dir2}`
      EventBus.$emit('statistic-folder-selected', {
        folder: left,
        to: right,
        filter: {
          include: dir2,
          exclude: this.exclude ? '!' : null,
        },
      })
    },
    changeDataDisplayFormat(isAbsolute) {
      if (isAbsolute) {
        this.valuesView = 'absolute'
      } else {
        this.valuesView = 'percentage'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.caption {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}

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

.underline {
  text-decoration: underline;
}
</style>
