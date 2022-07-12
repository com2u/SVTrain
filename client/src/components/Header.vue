<template>
  <div>
    <div class="header" :class="{'nav-hidden': !showHeader}">
      <div class="notch" @click="toggleHeader()">
        <v-icon :name="showHeader? 'chevron-up' : 'chevron-down'"></v-icon>
      </div>
      <div class="nav-container">
        <b-navbar toggleable="lg" type="light" variant="faded">
          <b-navbar-nav :to="{name: 'WorkSpacePage'}">
            <b-nav-item class="logo" :to="{name: 'WorkSpacePage'}">
              <img src="../assets/logo.png">
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
                      'is-active': $route.name==='manager',
                      'clickable': canManage,
                      'is-disabled': !canManage
                    }"
                    @click="gotoPage('manager')"
                  />
                </li>
                <li data-step="Classify">
                  <svg-icon
                    icon-class="microscope"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name==='explorer',
                      'clickable': canClassify,
                      'is-disabled': !canClassify
                    }"
                    @click="gotoPage('explorer')"
                  />
                </li>
                <li data-step="Train">
                  <svg-icon
                    icon-class="xtrain"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name==='Train',
                      'clickable': canTrain,
                      'is-disabled': !canTrain
                    }"
                    @click="gotoPage('Train')"
                  />
                </li>
                <li data-step="Test">
                  <svg-icon
                    icon-class="search"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name==='Test',
                      'clickable': canTrain,
                      'is-disabled': !canTrain
                    }"
                    @click="gotoPage('Test')"
                  />
                </li>
                <li data-step="Validate">
                  <svg-icon
                    icon-class="certificate"
                    class="step-icon"
                    :class="{
                      'is-active': $route.name==='Validate',
                      'clickable': canTrain,
                      'is-disabled': !canTrain
                    }"
                    @click="gotoPage('Validate')"
                  />
                </li>
              </ul>
            </div>
          </b-navbar-nav>
          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
          <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav class="ml-auto">
              <b-navbar-nav>
                <b-nav-item :to="{name: 'HelpPage'}">
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
                  </svg>
                </b-nav-item>
                <b-nav-item v-if="adminPage" :to="{name: 'AdminPage'}">
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z" />
                  </svg>
                </b-nav-item>
              </b-navbar-nav>
              <b-navbar-nav class="user-info">
                <b-nav-item @click="logout">
                  <span class="font-weight-bold">{{user}}</span>
                </b-nav-item>
                <b-nav-item @click="changePWD" style="min-width:145px;">
                  <small>Change password</small>
                </b-nav-item>
              </b-navbar-nav>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

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
  mounted() {
  },
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
    padding: .2rem .5rem;
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
</style>
