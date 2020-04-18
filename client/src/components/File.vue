<template>
  <div
    class="file-explorer-item"
    :style="imageStyles"
    :id="file.path"
    :class="{ cursor: file.cursor, selected: file.selected }">
    <template v-if="file.deleted || file.changed">
      {{ file.deleted ? 'File deleted' : 'File changed' }}
    </template>
    <template v-else>
      <template v-if="file.type === 'file'">
        <template v-if="file.image">
          <img
            v-bind:src="file.serverPath"
            class="file-explorer-preview"
            v-bind:style="{width: size-15 + 'px', height: size-15 + 'px' }">
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
import { mapGetters } from 'vuex';

export default {
  props: {
    file: Object,
    size: [String, Number],
    showFileName: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['imageSpacing']),
    imageStyles() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        marginBottom: `${this.imageSpacing}px`,
        marginRight: `${this.imageSpacing}px`,
      };
    },
  },
};
</script>


<style lang="scss">
  .file-explorer-item {
    overflow: hidden;
    word-wrap: break-word;
    padding: 5px;
    position: relative;

    &.selected {
      background: var(--primary)
    }

    &.cursor {
      border: 3px solid gray;
    }

    .file-explorer-file-name {
      font-size: 12px;
      padding: 1px;

      &.matched {
        background: #a0fcac;
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
    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
</style>
