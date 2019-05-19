import 'babel-polyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueRouter from 'vue-router'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import App from './App.vue'
import routes from './routes'
import socket from './socket'
import infiniteScroll from 'vue-infinite-scroll'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue'
import VoerroTagsInput from '@voerro/vue-tagsinput';

Vue.use(infiniteScroll)
Vue.use(BootstrapVue)

const router = new VueRouter({routes})
Vue.use(VueRouter)
Vue.component('v-icon', Icon)
Vue.component('tags-input', VoerroTagsInput);
socket.init()

// window.addEventListener("keydown", function(e) {
//   // space and arrow keys
//   if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
//       e.preventDefault();
//   }
// }, false);

new Vue({
  router,
  el: '#app',
  render: h => h(App)
})