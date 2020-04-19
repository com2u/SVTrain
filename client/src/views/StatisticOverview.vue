<template>
  <div class="wrapper">
    <div
      v-bind:style="{ width: expandRightSide ? '500px' : '250px' }"
      class="right-side">
      Right
      <button v-on:click="toggleExpand()">toggle expand</button>
    </div>
    <div
      v-bind:style="{ width: `calc(100% - ${expandRightSide ? '510' : '260' }px)` }"
      class="main-content">
      Left
      {{ dir }}
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'dir',
  ],
  data() {
    return {
      expandRightSide: false,
    };
  },
  methods: {
    toggleExpand() {
      this.expandRightSide = !this.expandRightSide;
    },
  },
};
</script>

<style lang="scss" scoped>
.right-side {
  position: fixed;
  top: 0px;
  right: 0px;
}
</style>
