<template>
  <div>
    <div>
      <div>
        <p style="text-align: center">
          <img
            class="img-title"
            src="../assets/logo-ejectx_338x141.png"
            style="width: 338px; height: 141px"
          />
        </p>
        <h1 class="" style="text-align: center">Körber Pharma Inspection</h1>
        <h4 style="text-align: center">
          version <b>{{ version }}</b>
        </h4>
        <h2>OpenSource Licenses</h2>
        <ul>
          <li v-for="(license, moduleName) in licenses" v-bind:key="moduleName">
            <a :href="`#${moduleName}`">
              ({{ license.license }}) {{ moduleName }}
            </a>
          </li>
        </ul>
        <div v-for="(license, moduleName) in licenses" v-bind:key="moduleName">
          <h3 :id="moduleName">({{ license.license }}) {{ moduleName }}</h3>
          <p v-if="license.repository">
            Repository:
            <a :href="license.repository.replace('git+', '')">{{
              license.repository.replace('git+', '')
            }}</a>
          </p>
          <pre>{{ license.sourceText }}</pre>
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import licenses from '../../licenses.json'

export default {
  name: 'About',
  data() {
    return {
      version: process.env.VUE_APP_VERSION,
      licenses: licenses || {},
    }
  },
}
</script>

<style scoped>
body {
  font-family: Arial;
  font-size: 11pt;
}

/* Content */

img {
  border: 1px solid black;
  max-width: 100%;
}

.img-title {
  border: none;
  max-width: 100%;
}
</style>
