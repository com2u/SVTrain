<template>
  <div>
    <file-explorer v-bind:dir="dir" v-bind:type="type" :key="$route.fullPath"></file-explorer>
  </div>
</template>

<script>
import FileExplorer from '../components/FileExplorer.vue'
import EventBus from '../utils/eventbus'

export default {
  props: [
    'dir',
    'type',
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
