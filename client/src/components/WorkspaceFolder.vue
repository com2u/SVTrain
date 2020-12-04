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
            <svg-icon :icon-class="info.highlight ? 'note-highlight': 'note'" class="svg-icon clickable-icon"
                      :class="info.highlight ? 'highlight': ''"
                      @click="showNotes"
            />
          </span>
          <span v-if="depth === 0" class="icon-wrapper clickable" @click="showConfusionMatrix()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 100 103"
                 preserveAspectRatio="xMidYMid meet">
              <g transform="translate(0.000000,103.000000) scale(0.100000,-0.100000)"
                 :fill="wsPath !== info.path ? wsPath === info.path ? '#FFF' : '#000' : '#DDD'" stroke="none">
                <path d="M35 988 c-3 -7 -4 -229 -3 -493 l3 -480 473 -3 472 -2 0 495 0 495
                -470 0 c-367 0 -472 -3 -475 -12z m443 -483 l-3 -446 -198 0 -197 0 -3 446 -2
                445 203 0 202 0 -2 -445z m460 0 l-3 -446 -198 -2 -197 -2 0 448 0 447 200 0
                200 0 -2 -445z"/>
                <path d="M191 859 l-24 -30 29 -30 28 -29 -29 -30 -29 -30 29 -30 29 -30 27
                33 28 32 31 -31 32 -31 30 31 30 30 -33 29 -33 30 34 29 33 30 -31 30 -30 31
                -30 -34 -30 -33 -27 32 c-15 18 -30 32 -33 31 -4 0 -18 -14 -31 -30z"/>
                <path d="M120 470 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"/>
                <path d="M120 310 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"/>
                <path d="M120 150 l0 -40 160 0 160 0 0 40 0 40 -160 0 -160 0 0 -40z"/>
                <path d="M768 823 l-47 -47 -18 22 -18 21 -31 -28 -32 -29 52 -51 52 -51 73
                74 74 75 -29 30 -30 30 -46 -46z"/>
                <path d="M580 470 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"/>
                <path d="M580 310 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"/>
                <path d="M580 150 l0 -40 155 0 155 0 0 40 0 40 -155 0 -155 0 0 -40z"/>
              </g>
            </svg>
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
    showConfusionMatrix() {
      if (this.wsPath !== this.info.path) {
        EventBus.$emit('show-confusion-matrix', this.info.path)
      }
    },
  },
}
</script>
