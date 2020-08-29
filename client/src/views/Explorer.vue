<template>
  <div>
    <file-explorer v-bind:dir="dir" :key="$route.fullPath"></file-explorer>
  </div>
</template>

<script>
import FileExplorer from '../components/FileExplorer.vue'
import EventBus from '../utils/eventbus'

export default {
  props: [
    'dir',
  ],
  components: {
    FileExplorer,
  },
  methods: {
    checkPermission() {
    },
  },
  mounted() {
    EventBus.$on('loaded-config', this.checkPermission)
  },
  destroyed() {
    EventBus.$off('loaded-config')
  },
}
</script>
