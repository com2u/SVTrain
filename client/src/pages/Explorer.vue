<template>
  <div>
    <file-explorer v-bind:dir="dir" :key="$route.fullPath"></file-explorer>
  </div>
</template>

<script>
import FileExplorer from './../components/FileExplorer.vue'

export default {
  props: [
    'dir'
  ],
  components: {
    FileExplorer
  }
}
</script>

