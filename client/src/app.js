import 'babel-polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import 'vue-awesome/icons'
import VModal from 'vue-js-modal'
import Icon from 'vue-awesome/components/Icon.vue'
import App from './App.vue'
import routes from './routes'
import socket from './socket'
import infiniteScroll from 'vue-infinite-scroll'
Vue.use(infiniteScroll)

const router = new VueRouter({routes})
Vue.use(VueRouter)
Vue.component('v-icon', Icon)
socket.init()

Vue.use(VModal)

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})