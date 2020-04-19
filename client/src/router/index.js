import Vue from 'vue';
import VueRouter from 'vue-router';
import LoggedInLayout from '../views/LoggedInLayout';

Vue.use(VueRouter);

const routes = [
  {
    name: 'loggedRoutes',
    path: '/',
    component: LoggedInLayout,
    children: [
      {
        name: 'main',
        path: '/ai',
        component: () => import('../views/Main'),
      },
      {
        name: 'explorer',
        path: '/explorer/',
        component: () => import('../views/Explorer'),
        props: (route) => ({ dir: route.query.dir }),
        meta: {
          permission: 'classify',
        },
      },
      {
        name: 'statistic',
        path: '/statistic/',
        component: () => import('../views/Statistic'),
      },
      {
        name: 'HelpPage',
        path: '/help',
        component: () => import('../views/Help'),
      },
      {
        name: 'WorkSpacePage',
        path: '/',
        component: () => import('../views/WorkSpace'),
      },
      {
        name: 'statistic-overview',
        path: '/statistic-overview',
        component: () => import('../views/StatisticOverview'),
        props: (route) => ({ dir: route.query.dir }),
      },
      {
        name: 'Train',
        path: '/train',
        component: () => import('../views/Train'),
        meta: {
          permission: 'train',
        },
      },
      {
        name: 'Test',
        path: '/test',
        component: () => import('../views/Test'),
        meta: {
          permission: 'test',
        },
      },
      {
        name: 'Validate',
        path: '/validate',
        component: () => import('../views/Validate'),
        meta: {
          permission: 'validate',
        },
      },
    ],
  },
  {
    name: 'LoginPage',
    path: '/login',
    component: () => import('../views/Login.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

export default router;
