import 'babel-polyfill'
import Vue from 'vue'
import {BootstrapVueIcons, BootstrapVue} from 'bootstrap-vue'
import VueRouter from 'vue-router'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import App from './App.vue'
import routes from './routes'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue'
import 'jsoneditor/dist/jsoneditor.css'
import VoerroTagsInput from '@voerro/vue-tagsinput';
import store from './store'
import Notifications from 'vue-notification'

Vue.use(Notifications)
Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)

const router = new VueRouter({
  mode: 'history',
  routes
})
Vue.use(VueRouter)
Vue.component('v-icon', Icon)
Vue.component('tags-input', VoerroTagsInput);

// window.addEventListener("keydown", function(e) {
//   // space and arrow keys
//   if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
//       e.preventDefault();
//   }
// }, false);


export default new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App)
})
