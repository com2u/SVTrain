<template>
  <div class="new-folder-button text-primary">
    <v-icon name="folder-plus" scale=2 />
    <span class="text">New Folder</span>
  </div>
</template>

<style lang="scss" scoped>
.new-folder-button {
  overflow: hidden;
  height: auto;
  word-wrap:break-word;
  padding: 5px;
  cursor: pointer;
  float: left;
  svg {
    fill: rgb(0, 96, 255)
  }
  .text {
    font-size: 12px;
    padding: 1px;
    margin-left: .25rem;
    color:  rgb(0, 96, 255);
  }
}
</style>
