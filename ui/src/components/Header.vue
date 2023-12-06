<template>
  <div>
    <notifications group="header-notifications" position="top center" />
    <div class="header" :class="{ 'nav-hidden': !showHeader }">
      <div class="notch" @click="toggleHeader()">
        <v-icon :name="showHeader ? 'chevron-up' : 'chevron-down'"></v-icon>
      </div>
      <div class="nav-container">
        <b-navbar toggleable="lg" type="light" variant="faded">
          <b-navbar-nav :to="{ name: 'WorkSpacePage' }">
            <b-nav-item data-e2e-testid="ejectx-logo" class="logo" :to="{ name: 'WorkSpacePage' }">
              <img src="../assets/logo.png" />
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="step-nav-item">
            <div class="step-container">
              <ul class="step-progress">
                <li data-step="Manage">
                  <v-icon
                    name="bars"
                    class="step-icon"
                    style="vertical-align: -0.15em"
                    :class="{
                      'is-active': $route.name === 'manager',
                      clickable: canManage,
                      'is-disabled': !canManage,
                    }"
                    @click="gotoPage('manager')"
                  />
                </li>
                <li data-step="Label">
                  <svg-icon
                    icon-class="microscope"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name === 'WorkSpacePage',
                      clickable: true,
                    }"
                    @click="$router.push({ name: 'WorkSpacePage' })"
                  />
                </li>
                <li data-step="Train">
                  <svg-icon
                    icon-class="xtrain"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name === 'Train',
                      clickable: canTrain,
                      'is-disabled': !canTrain,
                    }"
                    @click="gotoPage('Train')"
                  />
                </li>
                <li data-step="Test">
                  <svg-icon
                    icon-class="search"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name === 'Test',
                      clickable: canTrain,
                      'is-disabled': !canTrain,
                    }"
                    @click="gotoPage('Test')"
                  />
                </li>
                <li data-step="Validate">
                  <svg-icon
                    icon-class="certificate"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name === 'Validate',
                      clickable: canTrain,
                      'is-disabled': !canTrain,
                    }"
                    @click="gotoPage('Validate')"
                  />
                </li>
              </ul>
            </div>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <span style="margin: auto 1rem" class="font-weight-bold">{{
              user
            }}</span>
            <v-icon
              v-b-toggle.drawer-menu
              name="bars"
              class="burger-menu"
              data-e2e-testid="burger-menu"
            ></v-icon>
          </b-navbar-nav>
        </b-navbar>
      </div>
    </div>
    <b-sidebar id="drawer-menu" title="" right shadow backdrop>
      <template #title><img class="logo" src="../assets/logo.png" /></template>
      <template #default="{ hide }">
        <div class="p-3">
          <h4 id="sidebar-no-header-title">
            <span class="font-weight-bold">{{ user }}</span>
          </h4>
          <hr />
          <nav class="mb-3">
            <b-nav vertical>
              <b-nav-item
                class="nav-item-link"
                v-if="adminPage"
                data-e2e-testid="admin-page"
                :to="{ name: 'AdminPage' }"
                @click="hide"
              >
                <v-icon name="cog"></v-icon>
                <span>Admin page</span>
              </b-nav-item>
              <b-nav-item
                class="nav-item-link"
                v-if="adminPage"
                target="_blank"
                :href="KCManagementUri"
                @click="hide"
              >
                <v-icon name="users"></v-icon>
                <span>User management</span>
              </b-nav-item>
              <b-nav-item
                class="nav-item-link"
                @click="
                  changePWD()
                  hide()
                "
              >
                <v-icon name="key"></v-icon>
                <span>Change password</span>
              </b-nav-item>
              <b-nav-item
                class="nav-item-link"
                @click="
                  clearCache()
                  hide()
                "
              >
                <v-icon name="sync"></v-icon>
                <span>REFRESH WORKSPACE</span>
              </b-nav-item>
              <b-nav-item
                class="nav-item-link"
                :to="{ name: 'AboutPage' }"
                data-e2e-testid="about-license"
                @click="hide"
              >
                <v-icon name="info-circle"></v-icon>
                <span>About / License</span>
              </b-nav-item>
              <b-nav-item
                class="nav-item-link"
                :to="{ name: 'HelpPage' }"
                @click="hide"
              >
                <v-icon name="question-circle"></v-icon>
                <span>Help</span>
              </b-nav-item>
            </b-nav>
          </nav>
        </div>
      </template>
      <template #footer="{}">
        <b-nav>
          <b-nav-item
            class="nav-item-link mt-auto"
            style="width: 100%; margin-inline: 1rem"
            @click="logout"
          >
            <v-icon name="sign-out-alt"></v-icon>
            <span>Logout</span>
          </b-nav-item>
        </b-nav>
      </template>
    </b-sidebar>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '../utils/api'
import EventBus from '../utils/eventbus'

export default {
  data() {
    return {}
  },
  computed: {
    user() {
      return this.$store.state.app.user.username
    },

    ...mapGetters([
      'canClassify',
      'canTrain',
      'canTest',
      'canValidate',
      'canManage',
      'showHeader',
      'changePWDUri',
      'adminPage',
      'KCManagementUri',
    ]),
  },
  methods: {
    toggleHeader() {
      this.$store.dispatch('app/toggleHeader')
    },
    logout() {
      this.$store.dispatch('app/logout')
      this.$router.push({ name: 'LoginPage' })
    },
    async clearCache() {
      this.$notify({
        group: 'header-notifications',
        type: 'info',
        duration: -1,
        text: 'Refreshing workspaces...',
      })
      try {
        await api.calculateStatistic(null, false)
        await api.getFoldersByPath(null, null, null, false)
      } finally {
        this.$notify({
          group: 'header-notifications',
          clean: true,
        })
      }
      this.$notify({
        group: 'header-notifications',
        type: 'success',
        duration: 2000,
        text: 'Workspaces refreshed.',
      })
      EventBus.$emit('refreshWorkspaces')
    },
    gotoPage(page) {
      const permissionMap = {
        manager: 'canManage',
        explorer: 'canClassify',
        Train: 'canTrain',
        Test: 'canTest',
        Validate: 'canValidate',
      }
      if (this[permissionMap[page]]) {
        this.$router.push({
          name: page,
        })
      }
    },
    changePWD() {
      window.open(this.changePWDUri)
    },
  },
  mounted() {},
}
</script>
<style lang="scss" scoped>
.header {
  background: #fff;
  z-index: 999;
  /*
    border-bottom: 1px solid #fafafa;
    -webkit-box-shadow: 0px 2px 6px -7px #222222;
    -moz-box-shadow: 0px 2px 6px -7px #222222;
    box-shadow: 0px 2px 6px -7px #222222;
    */
  width: 100%;
  margin-bottom: 1rem;
  position: relative;

  .nav-container {
    transition: max-height 0.3s ease-in-out;
    max-height: 10rem;
    overflow: hidden;
  }
  &.nav-hidden {
    border-bottom: 2px solid #808080bd;
    .nav-container {
      max-height: 0;
    }
  }
  .logo {
    height: 80px;

    img {
      height: 50px;
    }
  }

  .user-info {
    padding-left: 60px;
    padding-right: 40px;
  }

  .help-icon {
    height: 30px;
    width: 30px;
  }

  .navbar {
    padding: 0 1rem;
    background: white;
    z-index: 10;
    border-bottom: 2px solid #808080bd;
  }
}

.notch {
  position: absolute;
  bottom: -1.2rem;
  left: 50%;
  background: #808080bd;
  border-radius: 50%;
  transform: translate(-50%, 0%);
  padding: 0.2rem 0.5rem;
  svg {
    width: 1rem;
    height: 1rem;
    margin-top: 1rem;
    fill: white;
  }

  &:hover {
    cursor: pointer;
  }
}

.step-nav-item {
  width: 100%;
}

.step-container {
  width: 600px;
  margin: 0 auto;

  .step-progress {
    li {
      list-style-type: none;
      width: 20%;
      float: left;
      position: relative;
      text-align: center;
      margin-top: -10px;
      z-index: 1;

      .step-icon {
        border: 1px solid #333;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        padding: 5px;
        background: #fafafa;
        margin-top: -5px;
        z-index: 2;

        &.is-active {
          background: var(--primary);
          /*border-color: var(--primary);*/
          color: #fff;
        }

        &.is-disabled {
          background: #d1d1d1;
          cursor: not-allowed;
          border: 1px solid #a1a1a1;
        }

        &.icon-sm {
          padding: 10px;
        }
      }

      &:after {
        width: calc(100% - 45px);
        height: 5px;
        content: '';
        position: absolute;
        background-color: #000000;
        top: 15px;
        left: calc(-50% + 23px);
      }

      &:first-child:after {
        content: none;
      }

      &:before {
        content: attr(data-step);
        position: absolute;
        bottom: -17px;
        left: 50%;
        transform: translateX(-50%);
        font-weight: 600;
      }
    }
  }
}
.burger-menu {
  height: 100%;
  width: 1.8rem;
  margin-inline: 1rem;
  cursor: pointer;
}
#drawer-menu {
  .logo {
    height: 50px;
  }
  .nav-item-link {
    margin-bottom: 0.4rem;
    .nav-link {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 15px;
      border-radius: 0.5rem;
      transition: all 0.1s ease-in-out;
      svg {
        width: calc(1rem + 22px);
        height: 22px;
        padding-right: 1rem;
        border-right: 1px solid #80808042;
        fill: #5b5b5bb2;
      }
      span {
        color: #333;
        margin-left: 20px;
        text-transform: uppercase;
        font-weight: 500;
      }
      &:hover {
        background: #5b5b5bb2;
        span {
          color: #fff;
        }
        svg {
          fill: #fff;
        }
      }
    }
  }
}
</style>
