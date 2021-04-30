import store from './store'
import router from './router'
import { getToken } from './utils'
import api from './utils/api'
import EventBus from './utils/eventbus'

const whiteList = ['/login']

function getConfig() {
  return store.state.app.config
}

router.beforeEach(async (to, from, next) => {
  let config = getConfig()
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      await store.dispatch('app/logout')
      next()
    } else {
      if (!config.user) {
        try {
          api.setSessionToken(token)
          config = await api.getConfig()
          store.dispatch('app/setConfig', config)
          store.dispatch('app/setUser', config.user)
          EventBus.$emit('loaded-config')
        } catch (e) {
          next('/login')
          return
        }
      }
      const permission = to.meta && to.meta.permission
      if (!permission || config.user.permissions[permission]) {
        if (to.name === 'explorer') {
          const explorerConfig = await api.getExplorerConfig(to.query.dir, to.query.type)
          await store.dispatch('app/setExplorerConfig', explorerConfig)
        }
        next()
      } else {
        next({
          name: 'WorkSpacePage',
        })
        EventBus.$emit('notify-error', 'Permission denied!')
      }
    }
  } else if (whiteList.indexOf(to.path) !== -1) {
    next()
  } else {
    next('/login')
  }
})

router.afterEach(() => {
  // finish progress bar
})
