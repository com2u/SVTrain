<template>
  <div class="ws-container">
    <div
      :data-e2e-testid="`workspace-${info.name}`"
      class="folder-label"
      :style="indent"
      :class="wsPath === systemConfig.root + info.path ? 'selected' : ''"
      @click="setWorkspace"
    >
      <div class="folder-label-name" :class="!depth ? 'root-item' : ''">
        <span class="icon-wrapper expand-icon">
          <b-spinner
            v-if="loadingChildren"
            small
            label="Small Spinner"
            class="clickable-icon"
          ></b-spinner>
          <template v-else>
            <template v-if="info.hasSubFolders">
              <b-icon
                v-if="showChildren"
                icon="triangle-fill"
                class="option-icon clickable-icon cursor-pointer"
                @click.stop="toggleShowChildren"
                data-e2e-testid="traingle-icon"
              />
              <b-icon
                v-else
                rotate="90"
                icon="triangle-fill"
                class="option-icon clickable-icon cursor-pointer"
                @click.stop="toggleShowChildren"
                data-e2e-testid="traingle-icon"
              />
            </template>
            <span v-else class="margin-keeper" />
          </template>
        </span>
        <span
          :data-e2e-testid="`workspace-inner-folder-${info.name}`"
          class="name"
          :style="{
            fontSize: subFolderFontSize,
          }"
          >{{ info.name }}</span
        >
      </div>
      <div class="options">
        <div class="option-progress" title="Percentage Classified">
          <span class="file-nums option-progress-text" data-e2e-testid="file-nums"
            >{{ formatNumberWithCommas(totalFiles) }} files</span
          >
          <span
            class="option-progress-text"
            v-if="
              showSubFolderProgress &&
              info.name.toLowerCase() !== info.unclassifiedPath &&
              totalFiles > 0
            "
          >
            {{ progress }}%</span
          >
          <progress
            :max="100"
            :value="progress"
            class="ws-progress"
            v-bind:class="{
              'opacity-0':
                !(showSubFolderProgress || depth === 0) ||
                info.name.toLowerCase() === info.unclassifiedPath ||
                totalFiles <= 0,
              'cursor-pointer':
                totalFiles > 0 &&
                info.name.toLowerCase() !== info.unclassifiedPath &&
                (showSubFolderProgress || depth === 0),
            }"
            @click.stop="
              !(
                !(showSubFolderProgress || depth === 0) ||
                info.name.toLowerCase() === info.unclassifiedPath ||
                totalFiles <= 0
              ) && canViewStatistics
                ? showStatistic()
                : null
            "
          ></progress>
        </div>
        <div>
          <div v-b-tooltip.hover class="icon-wrapper" title="AI Statistic" data-e2e-testid="ai-statistic">
            <b-icon
              icon="bar-chart-fill"
              :class="canViewStatistics && hasChildren && depth !== 0 && totalFiles > 0 ? 'clickable-icon' : 'gray-icon'"
              font-scale="1.5"
              @click.stop="showStatistic"
            />
          </div>
          <div v-b-tooltip.hover class="icon-wrapper" title="Notes">
            <b-icon
              :icon="info && info.highlight ? 'file-text-fill' : 'file-text'"
              class="svg-icon clickable-icon"
              :class="info.highlight ? 'highlight' : ''"
              data-e2e-testid="notes"
              @click.stop="showNotes"
            />
          </div>
          <div
            v-b-tooltip.hover
            v-if="canSeeConfusionMatrix"
            class="icon-wrapper clickable"
            @click.stop="showConfusionMatrix()"
            data-e2e-testid="compare-workspaces"
            title="Compare Workspaces"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20px"
              height="20px"
              viewBox="0 0 100 103"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                transform="translate(0.000000,103.000000) scale(0.100000,-0.100000)"
                :fill="
                  depth === 0 && wsPath !== info.path
                    ? wsPath === info.path
                      ? '#FFF'
                      : '#000'
                    : '#999'
                "
                stroke="none"
              >
                <path
                  d="M35 988 c-3 -7 -4 -229 -3 -493 l3 -480 473 -3 472 -2 0 495 0 495
                -470 0 c-367 0 -472 -3 -475 -12z m443 -483 l-3 -446 -198 0 -197 0 -3 446 -2
                445 203 0 202 0 -2 -445z m460 0 l-3 -446 -198 -2 -197 -2 0 448 0 447 200 0
                200 0 -2 -445z"
                />
                <path
                  d="M191 859 l-24 -30 29 -30 28 -29 -29 -30 -29 -30 29 -30 29 -30 27
                33 28 32 31 -31 32 -31 30 31 30 30 -33 29 -33 30 34 29 33 30 -31 30 -30 31
                -30 -34 -30 -33 -27 32 c-15 18 -30 32 -33 31 -4 0 -18 -14 -31 -30z"
                />
                <path
                  d="M120 470 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"
                />
                <path
                  d="M120 310 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"
                />
                <path
                  d="M120 150 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"
                />
                <path
                  d="M768 823 l-47 -47 -18 22 -18 21 -31 -28 -32 -29 52 -51 52 -51 73
                74 74 75 -29 30 -30 30 -46 -46z"
                />
                <path
                  d="M580 470 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"
                />
                <path
                  d="M580 310 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"
                />
                <path
                  d="M580 150 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"
                />
              </g>
            </svg>
          </div>
          <div
            v-if="false"
            class="icon-wrapper"
            v-b-tooltip.hover
            title="Convert to Database"
          >
            <b-icon
              :animation="DBSyncing ? 'fade' : undefined"
              :class="info.isDB ? 'gray-icon' : 'clickable-icon'"
              icon="shuffle"
              font-scale="1.5"
              @click.stop="syncDB"
            />
          </div>
          <div class="icon-wrapper" :style="{'margin-right': '15px', 'padding-top': '-15px'}" v-b-tooltip.hover title="Workspace Settings">
            <b-iconstack font-scale='1.3'>
              <b-icon
                :class="
                  info.config && canEditConfig ? 'clickable-icon' : 'gray-icon'
                "
                icon="gear-fill"
                @click.stop="showConfig"
              />
              <b-icon
                v-if='!info.config && canEditConfig && depth === 0'
                icon='exclamation-lg'
                variant='danger'
              />
            </b-iconstack>
          </div>
          <div v-if="canBackup" v-b-tooltip.hover class="icon-wrapper" title="Backup Workspace">
            <b-icon
              :class="
                depth === 0 ? 'clickable-icon' : 'gray-icon'
              "
              icon="server"
              font-scale="1.5"
              @click.stop="backup()"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="hasChildren && showChildren">
      <workspace-folder
        v-for="(folder, index) in info.subFolders"
        :rawInfo="folder"
        :depth="depth + 1"
        :key-path="`${keyPath}.subFolders.[${index}]`"
        :key="folder.path"
        :show-sub-folder-progress="showSubFolderProgress"
        @select-workspace="$emit('select-workspace', $event)"
      />
      <div
        v-b-tooltip.hover
        class="new-ws"
        :style="{
          marginLeft: `${(depth + 1) * 50}px`,
        }"
        v-if="systemConfig.newWorkspace && newWorkspace"
        @click.stop="createNewFolder"
      >
        <b-icon icon="plus-circle"></b-icon>
        New folder
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '@/utils/api'
import EventBus from '../utils/eventbus'
import utilsMixin from '../mixins/utilsMixin'

export default {
  name: 'WorkspaceFolder',
  mixins: [utilsMixin],
  props: {
    rawInfo: {
      type: Object,
      default: () => ({
        highlight: false,
      }),
    },
    depth: {
      type: Number,
      default: 0,
    },
    keyPath: {
      type: String,
      default: '',
    },
    showSubFolderProgress: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showChildren: false,
      loadingChildren: false,
      DBSyncing: false,
      backuping: false,
    }
  },
  computed: {
    systemConfig() {
      return this.$store.state.app.config
    },
    totalFiles() {
      const totalFiles = this.info.matched + this.info.mismatched
      return Number.isNaN(totalFiles) ? 0 : totalFiles
    },
    indent() {
      return { marginLeft: `${this.depth * 50}px` }
    },
    hasChildren() {
      // eslint-disable-next-line no-mixed-operators
      return !!(
        (
          (this.info && // eslint-disable-line operator-linebreak
            Array.isArray(this.info.subFolders) && // eslint-disable-line operator-linebreak
            this.info.subFolders.length) || // eslint-disable-line operator-linebreak
          !Array.isArray(this.info.subFolders)
        )
        // eslint-disable-next-line no-mixed-operators
      )
    },
    progress() {
      if (this.info.classified !== undefined) {
        if (!this.info.unclassified) return 100
        return +(
          (this.info.classified / // eslint-disable-line operator-linebreak
            (this.info.classified + this.info.unclassified)) * // eslint-disable-line operator-linebreak
          100
        ).toFixed(1)
      }
      return 0
    },
    wsPath() {
      return this.$store.state.app.config.wsPath
    },
    info() {
      const excludedFolders = ['model']
      const filteredSubFolder = this.rawInfo.subFolders.filter((folder) => !excludedFolders.includes(folder.name.toLowerCase()))
      const pseudoRawInfo = this.rawInfo
      pseudoRawInfo.subFolders = filteredSubFolder
      if (pseudoRawInfo.hasSubFolders && pseudoRawInfo.subFolders) {
        return {
          ...pseudoRawInfo,
          ...this.sumObjectsByKey(
            {
              classified: pseudoRawInfo.classified,
              unclassified: pseudoRawInfo.unclassified,
              missed: pseudoRawInfo.missed,
              matched: pseudoRawInfo.matched,
              mismatched: pseudoRawInfo.mismatched,
            },
            ...pseudoRawInfo.subFolders,
          ),
        }
      }
      return this.rawInfo
    },
    ...mapGetters([
      'canEditNote',
      'canEditConfig',
      'canViewStatistics',
      'subFolderFontSize',
      'newWorkspace',
      'canSeeConfusionMatrix',
      'canSyncDB',
      'canBackup',
    ]),
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
      this.$store.commit('app/ADD_EXPANDED', {
        path: this.info.path,
        flag: this.showChildren,
      })
      if (!this.info.subFolders) {
        this.loadSubFolders()
      }
    },
    loadSubFolders() {
      this.loadingChildren = true
      EventBus.$emit('load-sub-folders', {
        info: this.info,
        keyPath: this.keyPath,
        done: () => {
          this.loadingChildren = false
        },
      })
    },
    getSubFolderStatistics(folderInfo) {
      if (folderInfo.hasSubFolders && folderInfo.subFolders) {
        return this.sumObjectsByKey(
          {
            classified: folderInfo.classified,
            unclassified: folderInfo.unclassified,
            missed: folderInfo.missed,
            matched: folderInfo.matched,
            mismatched: folderInfo.mismatched,
          },
          ...folderInfo.subFolders,
        )
      }
      return folderInfo
    },
    showNotes() {
      this.$store.dispatch('notes/showFolder', this.info)
    },
    showConfig() {
      if (this.canEditConfig) {
        this.$store.dispatch('wsconfig/showFolder', this.info)
      }
    },
    setWorkspace() {
      if (['ws', 'batch'].includes(this.info.type)) return
      if (!this.depth || this.info.type === 'defectclass') {
        this.$emit(
          'select-workspace',
          this.info.type === 'defectclass'
            ? {
              name: 'explorer',
              query: {
                dir: this.info.path,
                type: this.info.type,
                batch: this.info.batch,
                ws: this.info.ws,
              },
            }
            : undefined,
        )
      } else {
        this.$router.push({
          name: 'explorer',
          query: {
            dir: this.info.path,
            type: this.info.type,
            batch: this.info.batch,
            ws: this.info.ws,
          },
        })
        api.getConfig(this.info.isDB).then((data) => {
          this.$store.dispatch('app/setConfig', data)
        })
      }
    },
    showStatistic() {
      if (this.canViewStatistics) {
        EventBus.$emit('show-statistic', this.info)
      }
    },
    createNewFolder() {
      EventBus.$emit('create-new-folder', this.info.path)
    },
    showConfusionMatrix() {
      if (this.wsPath !== this.info.path && this.depth === 0) {
        EventBus.$emit('show-confusion-matrix', this.info.path)
      }
    },
    async syncDB() {
      this.DBSyncing = true
      const { status } = await api.syncDB(this.info.name)
      if (status) {
        this.$emit('sync-done')
      }
      this.DBSyncing = false
    },
    async backup() {
      this.backuping = true
      const { status } = await api.backup(this.info.name)
      if (status) {
        this.$emit('backup-done')
      }
      this.backuping = false
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
  mounted() {
    if (this.$store.state.app.expanded.includes(this.info.path)) {
      this.toggleShowChildren()
    }
  },
}
</script>
<style lang="scss">
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.b-icon-animation-fade {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.tooltip {
  opacity: 1;
}

.icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.ws-progress {
  -webkit-appearance: none;
  appearance: none;
  height: 1rem;
  border-radius: 0.25rem;
  overflow: hidden;
  width: 150px;
  background: black;

  &[value]::-webkit-progress-value {
    background: black;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
