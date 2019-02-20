import Main from './pages/Main.vue'
import Explorer from './pages/Explorer.vue'
import Statistic from './pages/Statistic.vue'

const routes = [
  {
    name: 'main',
    path: '/',
    component: Main
  },
  {
    name: 'explorer',
    path: '/explorer/',
    component: Explorer,
    props: route => ({ dir: route.query.dir })
  },
  {
    name: 'statistic',
    path: '/statistic/',
    component: Statistic
  }
]

export default routes