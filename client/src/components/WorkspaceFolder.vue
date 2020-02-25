<template>
  <div class="ws-container">
    <div class="folder-label" :style="indent" :class="wsPath == info.path ? 'selected': ''">
      <div class="name" :class="!depth? 'root-item': ''" @click="setWorkspace">{{info.name}}</div>
      <div class="options">
        <span>{{info.unclassified + info.classified}} files</span>
        <span>{{progress}}%</span>
        <b-progress :max="100" class="ws-progress" variant="secondary">
          <b-progress-bar
            :value="progress">
          </b-progress-bar>
        </b-progress>

        <div>
          <span class="icon-wrapper">
            <b-icon
              icon="bar-chart-fill"
              :class="info.statistic ? 'clickable-icon': 'gray-icon'"
              font-scale="1.5"
            />
          </span>
          <span class="icon-wrapper">
            <b-icon
              icon="document-text"
              :class="info.notes ? 'clickable-icon': 'gray-icon'"
              font-scale="1.5"
              @click="showNotes"
            />
          </span>
          <span class="icon-wrapper">
            <b-icon
              :class="info.config ? 'clickable-icon': 'gray-icon'"
              icon="gear-fill"
              font-scale="1.5"
              @click="showConfig"
            />
          </span>
          <span class="icon-wrapper">
            <template v-if="hasChildren">
              <b-icon
                v-if="showChildren"
                icon="triangle-fill"
                class="option-icon"
                @click="toggleShowChildren"
              />
              <b-icon
                v-else
                icon="triangle-fill"
                class="option-icon"
                flip-v
                @click="toggleShowChildren"
              />
            </template>
          </span>
        </div>
      </div>
    </div>
    <div v-if="hasChildren && showChildren">
      <workspace-folder
        v-for="folder in info.subFolders"
        :info="folder"
        :depth="depth + 1"
        :key="folder.path"
      />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'WorkspaceFolder',
    props: {
      info: {
        type: Object,
        default: () => ({})
      },
      depth: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        showChildren: false
      }
    },
    computed: {
      indent() {
        return {marginLeft: `${this.depth * 50}px`}
      },
      hasChildren() {
        return !!(this.info && this.info.subFolders && this.info.subFolders.length)
      },
      progress() {
        if (this.info.classified || this.info.unclassified) {
          return +(((this.info.classified / (this.info.classified + this.info.unclassified)) * 100)
            .toFixed(2))
        } else {
          return 100
        }
      },
      wsPath() {
        return this.$store.state.app.config.wsPath
      }
    },
    methods: {
      toggleShowChildren() {
        this.showChildren = !this.showChildren
      },
      showNotes() {
        this.$store.dispatch('notes/showFolder', this.info)
      },
      showConfig() {
        this.$store.dispatch('wsconfig/showFolder', this.info)
      },
      setWorkspace() {
        if (!this.depth) {
          this.$emit('select-workspace')
        }
      }
    }
  }
</script>
