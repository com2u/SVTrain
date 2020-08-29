<template>
  <div class="image-viewing">
    <b-form-input type="range" v-model="imageWidth"/>
    <b-img v-bind:src="file.serverPath" v-bind:style="{ width: `${imageWidth}%` }" fluid class="image"/>
    <div>{{ file.path }}</div>
    <div>{{ file.name }}</div>
  </div>
</template>

<script>
export default {
  name: 'ShowImage',
  props: {
    file: { type: Object, required: true },
  },
  data() {
    return {
      imageWidth: 70,
    }
  },
}
</script>

<style lang="scss" scoped>
.image-viewing {
  text-align: center;
  image {
    object-fit: cover;
  }
}
</style>
