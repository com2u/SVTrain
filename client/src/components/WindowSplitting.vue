<template>
  <div class="main-wrapper" v-on:mousemove="onMouseMoveOnWrapper" v-on:mouseup="onMouseUpOnWrapper">
    <div class="main-side" :style="{paddingRight: `${displayedWidth - 20 + marginLeft}px`}">
      <slot name="main"/>
    </div>
    <div
      class="border"
      v-bind:style="{ right: `${displayedWidth - 20 + marginLeft}px` }"
      v-on:mousedown="onMouseDownOnBorder"
      v-on:mouseup.prevent="onMouseUpOnBorder"
    />
    <div ref="side" class="expand-side" v-bind:style="{ width: `${displayedWidth}px` }">
      <slot name="side"/>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      originalSideWidth: null,
      sideWidth: null,
      resizing: false,
      originalPageX: null,
    }
  },
  computed: {
    configSideWidth() {
      const { config } = this.$store.state.app
      if (config.rightMenu && config.rightMenu.width) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.sideWidth = config.rightMenu.width
        return config.rightMenu.width
      }
      return 250
    },
    displayedWidth() {
      return this.sideWidth || this.configSideWidth
    },
    marginLeft() {
      const { config } = this.$store.state.app
      if (config.rightMenu && config.rightMenu.marginLeft) {
        return config.rightMenu.marginLeft
      }
      return 0
    },
  },
  methods: {
    onMouseUpOnWrapper() {
      this.resizing = false
    },
    onMouseMoveOnWrapper(e) {
      if (!this.resizing) return
      const difference = this.originalPageX - e.pageX
      this.sideWidth = this.originalSideWidth + difference
      if (this.sideWidth < 250) this.sideWidth = 250
      if (this.sideWidth > 1000) this.sideWidth = 1000
      e.preventDefault()
    },
    onMouseDownOnBorder(e) {
      this.resizing = true
      this.originalPageX = e.pageX
      this.originalSideWidth = this.sideWidth
    },
    onMouseUpOnBorder() {
      this.resizing = false
    },
    expand() {
      this.sideWidth = 800
    },
    shrink() {
      this.sideWidth = 250
    },
  },
}
</script>


<style lang="scss" scoped>
.main-wrapper {
  position: relative;
  width: 100%;
  min-height: 100%;
  .main-side {
    min-height: 100%;
  }
  .expand-side {
    position: fixed;
    top: 80px;
    right: 0;
    background: #fff;
    bottom: 50px;
    overflow-y: scroll;
  }
  .border {
    height: 100%;
    position: absolute;
    width: 7px;
    background: #E8E8E8;
    top: 0;
    cursor: ew-resize;

    &:before {
      content: "";
      position: absolute;
      top: calc(50% - 35px);
      left: -5.5px;
      display: inline-block;
      width: 15px; height: 70px;
      background: #E8E8E8;
      border: 1px solid #dee2e6;
    }
  }
}
</style>
