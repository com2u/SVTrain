<template>
  <div class="ws-container">
    <div class="folder-label" :style="indent" :class="wsPath == info.path ? 'selected': ''">
      <div :class="!depth? 'root-item': ''">
        <span class="icon-wrapper expand-icon">
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
        <span class="name" @click="setWorkspace">{{info.name}}</span>
      </div>
      <div class="options">
        <div class="option-progress"
             v-if="Number.isInteger(info.classified) && Number.isInteger(info.unclassified)">
          <span class="file-nums">{{info.unclassified + info.classified}} files</span>
          <span>{{progress}}%</span>
          <b-progress :max="100" class="ws-progress" variant="secondary">
            <b-progress-bar
              :value="progress">
            </b-progress-bar>
          </b-progress>

        </div>
        <div>
          <span class="icon-wrapper">
<!--            <b-icon-->
<!--              icon="bar-chart-fill"-->
<!--              :class="canViewStatistics ? 'clickable-icon': 'gray-icon'"-->
<!--              font-scale="1.5"-->
<!--              @click="showStatistic"-->
<!--            />-->

            <svg-icon icon-class="statistical" class="svg-icon"
              :class="canViewStatistics ? 'clickable-icon': 'gray-icon'"
              @click="showStatistic"
            />
          </span>
          <span class="icon-wrapper">
            <b-icon
              icon="file-text"
              class="clickable-icon"
              :class="info.highlight ? 'highlight': ''"
              font-scale="1.5"
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
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import EventBus from '../utils/eventbus';

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
    };
  },
  computed: {
    indent() {
      return { marginLeft: `${this.depth * 50}px` };
    },
    hasChildren() {
      // eslint-disable-next-line no-mixed-operators
      return !!(this.info && (Array.isArray(this.info.subFolders) && this.info.subFolders.length)
          // eslint-disable-next-line no-mixed-operators
          || !Array.isArray(this.info.subFolders));
    },
    progress() {
      if (this.info.classified || this.info.unclassified) {
        return +(((this.info.classified / (this.info.classified + this.info.unclassified)) * 100)
          .toFixed(2));
      }
      return 100;
    },
    wsPath() {
      return this.$store.state.app.config.wsPath;
    },
    ...mapGetters([
      'canEditNote',
      'canEditConfig',
      'canViewStatistics',
    ]),
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren;
      if (!this.info.subFolders) {
        EventBus.$emit('load-sub-folders', {
          info: this.info,
          keyPath: this.keyPath,
        });
      }
    },
    showNotes() {
      this.$store.dispatch('notes/showFolder', this.info);
    },
    showConfig() {
      this.$store.dispatch('wsconfig/showFolder', this.info);
    },
    setWorkspace() {
      if (!this.depth) {
        this.$emit('select-workspace');
      }
    },
    showStatistic() {
      EventBus.$emit('show-statistic', this.info.path);
    },
  },
};
</script>
