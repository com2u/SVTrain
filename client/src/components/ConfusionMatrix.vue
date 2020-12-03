<template>
  <div>
    <div>
      <div v-if="matrix && col && row" class="right-side-section">
        <div class="caption">
          <div v-if="calculated">
            Matched: {{calculated.matched}}
            | Mismatched: {{calculated['miss_matched']}}
            | Unclassified: {{calculated.unclassified}}
          </div>
        </div>
        <b-table-simple striped :class="{'statistic-table-responsive': false}" class="statistic-table">
          <b-thead>
            <b-tr>
              <b-th colspan="2" rowspan="2" class="input-conner"></b-th>
              <b-th class="header" :colspan="col.length">{{ getDirName(dir) }}</b-th>
            </b-tr>
            <b-tr>
              <b-th class="header" v-for="folder in col" :key="folder.name">{{folder.name}}</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="(folderLeft, index1) in row" :key="index1">
              <b-td style="width: 50px" v-if="index1 === 0" class="header header-rotation"  :rowspan="row.length">
                <span class="rotation">{{getDirName(currentWS)}}</span>
              </b-td>
              <b-td style="width: 20%" class="header">{{folderLeft.name}}</b-td>
              <b-td v-for="(folderRight, index2) in col" :key="index2" :class="{'main-diagonal': index1 === index2}">
                <span v-if="matrix[index2][index1] && row[index1].files.length" class="gray-text">
                  {{ (matrix[index2][index1] * 100 / (row[index1].files.length)).toFixed(1)}}%
                </span>
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
      <div v-else class="right-side-section">Statistic didn't calculated</div>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'ConfusionMatrix',
  data() {
    return {
      isLoading: false,
      dir: '',
      matrix: [],
      col: null,
      row: null,
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
    async load(dir) {
      this.dir = dir
      const { left, right } = await api.fetchConfusionMatrix(dir, this.$store.state.app.config.wsPath)
      this.col = left
      this.row = right
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.col.length; i++) {
        this.matrix[i] = []
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < this.row.length; j++) {
          let count = 0
          const colFiles = this.col[i].files.map((x) => x.name)
          const rowFiles = this.row[j].files.map((x) => x.name)
          rowFiles.forEach((f1) => {
            if (colFiles.includes(f1)) {
              count += 1
            }
          })
          this.matrix[i][j] = count
        }
      }
    },
    getDirName(dir) {
      return dir.split('/')[dir.split('/').length - 1]
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
</style>
