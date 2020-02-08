<template>
  <div
    class="file-explorer-item"
    v-bind:style="{ width: size + 'px' }"
    v-bind:id="file.path"
    v-bind:class="{ cursor: file.cursor, selected: file.selected }">
    <template v-if="file.deleted || file.changed">
      {{ file.deleted ? "File deleted" : "File changed" }}
    </template>
    <template v-else>
      <template v-if="file.type === 'file'">
        <template v-if="file.image">
          <img
            v-bind:src="file.serverPath"
            class="file-explorer-preview" v-bind:style="{width: size-15 + 'px', height: size-15 + 'px' }">
        </template>
        <template v-else-if="file.name.toLowerCase() === 'tfsettings.json'">
          <v-icon name="cogs" class="text-primary" scale="2"/>
        </template>
        <template v-else>
          <v-icon name="file" scale=2></v-icon>
        </template>
      </template>
      <template v-else>
        <v-icon name="folder" scale=2></v-icon>
      </template>
    </template>
    <span
      v-if="showFileName"
      v-bind:class="{
        missmatched: !file.match && file.image,
        matched: file.match && file.image,
        other: !file.image
      }"
      class="file-explorer-file-name">
      {{ file.name }}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    file: Object,
    size: [String, Number],
    showFileName: {
      type: Boolean,
      default: true
    }
  },
  computed: {

  }
}
</script>


<style lang="scss">
.file-explorer-item {
  overflow: hidden;
  height: auto;
  word-wrap:break-word;
  padding: 5px;
  &.selected {
    background: rgb(180, 191, 255)
  }
  &.cursor {
    border: 3px solid gray;
  }
  .file-explorer-file-name {
    font-size: 12px;
    padding: 1px;
    &.matched {
      background:#a0fcac;
      color: black;
    }
    &.missmatched {
      background: rgb(255, 183, 183);
      color: black;
    }
  }
}
.file-explorer-preview {
  object-fit: cover;
}
</style>
