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
  },
  methods: {
    toggleHeader() {
      this.showHeader = !this.showHeader;
    },
    logout() {
      this.$store.dispatch('app/logout');
      this.$router.push({ name: 'LoginPage' });
    },
  },
};
</script>
<style lang="scss" scoped>
  .header {
    background: #fafafa;

    .logo {
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
</style>
