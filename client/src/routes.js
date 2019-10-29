import Main from './pages/Main.vue'
import Explorer from './pages/Explorer.vue'
import Statistic from './pages/Statistic.vue'
import StatisticOverview from './pages/StatisticOverview.vue'
import LoggedInLayout from './pages/LoggedInLayout.vue'
import Login from './pages/Login.vue'

const routes = [
  {
    name: 'loggedRoutes',
    path: '/',
    component: LoggedInLayout,
    children: [
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
      },
      {
        name: 'statistic-overview',
        path: '/statistic-overview',
        component: StatisticOverview,
        props: route => ({ dir: route.query.dir })
      }
    ]
  },
  {
    name: 'LoginPage',
    component: Login,
    path: '/login'
  }
]

export default routes