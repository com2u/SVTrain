<template>
  <div>
    <div class="notch" @click="toggleHeader()"></div>
    <div class="header" v-show="showHeader">
      <div>
        <b-navbar toggleable="lg" type="light" variant="faded">
          <b-navbar-nav :to="{name: 'WorkSpacePage'}">
            <b-nav-item class="logo" :to="{name: 'WorkSpacePage'}">
              <img src="../assets/logo.png">
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-nav class="step-nav-item">
            <div class="step-container">
              <ul class="step-progress">
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
                  <b-icon icon="question" class="help-icon"/>
                </b-nav-item>
              </b-navbar-nav>

              <b-navbar-nav class="user-info">
                <b-nav-item @click="logout">
                  {{user}}
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
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      showHeader: true,
    };
  },
  computed: {
    user() {
      return this.$store.state.app.user.username;
    },

    ...mapGetters([
      'canClassify',
      'canTrain',
      'canTest',
      'canValidate',
    ]),
  },
  methods: {
    toggleHeader() {
      this.showHeader = !this.showHeader;
    },
    logout() {
      this.$store.dispatch('app/logout');
      this.$router.push({ name: 'LoginPage' });
    },
    gotoPage(page) {
      const permissionMap = {
        explorer: 'canClassify',
        Train: 'canTrain',
        Test: 'canTest',
        Validate: 'canValidate',
      };
      if (this[permissionMap[page]]) {
        this.$router.push({
          name: page,
        });
      }
    },
  },
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
  .header {
    background: #fafafa;

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
    }
  }

  .notch {
    position: absolute;
    top: 0;
    left: 50%;
    height: 20px;
    width: 20px;
    background: #808080;
    border-radius: 50%;
    transform: translate(-50%, -50%);

    &:hover {
      cursor: pointer;
    }

    z-index: 999;
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
        width: 25%;
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
            border-color: var(--primary);
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
