<template>
  <div class="ws-container">
    <div class="folder-label" :style="indent" :class="wsPath === info.path ? 'selected': ''">
      <div class="folder-label-name" :class="!depth? 'root-item': ''">
        <span class="icon-wrapper expand-icon">
            <b-spinner v-if="loadingChildren" small label="Small Spinner" class="clickable-icon"></b-spinner>
            <template v-else>
              <template v-if="info.hasSubFolders">
                <b-icon
                  v-if="showChildren"
                  icon="triangle-fill"
                  class="option-icon clickable-icon"
                  @click="toggleShowChildren"
                />
              <b-icon
                v-else
                rotate="90"
                icon="triangle-fill"
                class="option-icon clickable-icon"
                @click="toggleShowChildren"
              />
              </template>
              <span v-else class="margin-keeper"/>
            </template>
          </span>
        <span
          class="name"
          @click="setWorkspace"
          :style="{
            fontSize: subFolderFontSize
          }"
        >{{info.name}}</span>
      </div>
      <div class="options">
        <div class="option-progress"
             v-if="Number.isInteger(info.classified) && Number.isInteger(info.unclassified)">
          <span class="file-nums option-progress-text">{{totalFiles}} files</span>
          <span class="option-progress-text">{{progress}}%</span>
          <b-progress :max="100" class="ws-progress">
            <b-progress-bar
              class="black-bar"
              :value="progress">
            </b-progress-bar>
          </b-progress>

        </div>
        <div>
          <span class="icon-wrapper">
            <b-icon
              icon="bar-chart-fill"
              :class="canViewStatistics ? 'clickable-icon': 'gray-icon'"
              font-scale="1.5"
              @click="showStatistic"
            />
          </span>
          <span class="icon-wrapper">

            <svg-icon icon-class="note" class="svg-icon clickable-icon"
                      :class="info.highlight ? 'highlight': ''"
                      @click="showNotes"
            />
          </span>
          <span class="icon-wrapper">
            <b-icon
              :class="info.config && canEditConfig ? 'clickable-icon': 'gray-icon'"
              icon="gear-fill"
              font-scale="1.5"
              @click="showConfig"
            />
          </span>
        </div>
      </div>
    </div>
    <div v-if="hasChildren && showChildren">
      <workspace-folder
        v-for="(folder, index) in info.subFolders"
        :info="folder"
        :depth="depth + 1"
        :key-path="`${keyPath}.subFolders.[${index}]`"
        :key="folder.path"
      />
      <div
        class="new-ws"
        :style="{
          marginLeft: `${((depth + 1) * 50)}px`
        }"
        v-if="systemConfig.newWorkspace && newWorkspace"
        @click="createNewFolder"
      >
        <b-icon icon="plus-circle"></b-icon>
        New Workspace
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import EventBus from '../utils/eventbus'

export default {
  name: 'WorkspaceFolder',
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    depth: {
      type: Number,
      default: 0,
    },
    keyPath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showChildren: false,
      loadingChildren: false,
    }
  },
  computed: {
    systemConfig() {
      return this.$store.state.app.config
    },
    totalFiles() {
      return (this.info.unclassified + this.info.classified).toLocaleString()
    },
    indent() {
      return { marginLeft: `${this.depth * 50}px` }
    },
    hasChildren() {
      // eslint-disable-next-line no-mixed-operators
      return !!(this.info && (Array.isArray(this.info.subFolders) && this.info.subFolders.length)
          // eslint-disable-next-line no-mixed-operators
          || !Array.isArray(this.info.subFolders))
    },
    progress() {
      if (this.info.classified || this.info.unclassified) {
        return +(((this.info.classified / (this.info.classified + this.info.unclassified)) * 100)
          .toFixed(1))
      }
      return 100
    },
    wsPath() {
      return this.$store.state.app.config.wsPath
    },
    ...mapGetters([
      'canEditNote',
      'canEditConfig',
      'canViewStatistics',
      'subFolderFontSize',
      'newWorkspace',
    ]),
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
      if (!this.info.subFolders) {
        this.loadingChildren = true
        EventBus
          .$emit('load-sub-folders', {
            info: this.info,
            keyPath: this.keyPath,
            done: () => {
              this.loadingChildren = false
            },
          })
      }
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
      if (!this.depth) {
        this.$emit('select-workspace')
      } else {
        this.$router.push({
          name: 'explorer',
          query: { dir: this.info.path },
        })
      }
    },
    showStatistic() {
      if (this.canViewStatistics) {
        EventBus.$emit('show-statistic', this.info.path)
      }
    },
    createNewFolder() {
      EventBus.$emit('create-new-folder', this.info.path)
    },
  },
}
</script>
