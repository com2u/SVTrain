import store from './store'
import router from './router'
import api from './utils/api'
import EventBus from './utils/eventbus'

function getConfig() {
  return store.state.app.config
}

router.beforeEach(async (to, from, next) => {
  let config = getConfig()
  if (!config.user) {
    config = await api.getConfig()
    await store.dispatch('app/setConfig', config)
    await store.dispatch('app/setUser', config.user)
    EventBus.$emit('loaded-config')
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
})
