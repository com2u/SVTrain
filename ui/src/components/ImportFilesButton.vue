<template>
  <div class="import-files-button text-primary">
    <v-icon name="file-upload" scale=2 />
    <span class="text">Import</span>
  </div>
</template>

<style lang="scss" scoped>
.import-files-button {
  overflow: hidden;
  height: auto;
  word-wrap:break-word;
  padding: 5px;
  cursor: pointer;
  float: left;
  .text {
    font-size: 12px;
    padding: 1px;
    margin-left: .25rem;
  }
}
</style>
