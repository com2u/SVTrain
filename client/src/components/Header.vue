<template>
  <div>
    <div class="notch" @click="toggleHeader()"></div>
    <div class="header" v-show="showHeader">
      <div>
        <b-navbar toggleable="lg" type="light" variant="faded">
          <b-navbar-nav :to="{name: 'WorkSpacePage'}">
            <b-nav-item class="logo" :to="{name: 'WorkSpacePage'}">
              <img src="../images/EjectXLogo.png">
            </b-nav-item>
          </b-navbar-nav>
          <b-navbar-brand :to="{name: 'WorkSpacePage'}">SEIDENANDER</b-navbar-brand>

          <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

          <b-collapse id="nav-collapse" is-nav>
            <!--            <b-navbar-nav>-->
            <!--              <b-nav-item href="#">Link</b-nav-item>-->
            <!--              <b-nav-item href="#" disabled>Disabled</b-nav-item>-->
            <!--            </b-navbar-nav>-->


            <!-- Right aligned nav items -->

            <b-navbar-nav class="ml-auto">
              <!--              <b-nav-form>-->
              <!--                <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>-->
              <!--                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>-->
              <!--              </b-nav-form>-->
              <b-navbar-nav>
                <b-nav-item :to="{name: 'HelpPage'}">
                  <b-icon icon="question" class="help-icon"/>
                </b-nav-item>
              </b-navbar-nav>


<!--              <b-nav-item-dropdown right class="user-info">-->
<!--                &lt;!&ndash; Using 'button-content' slot &ndash;&gt;-->
<!--                <template v-slot:button-content>-->
<!--                  <em>{{user}}</em>-->
<!--                </template>-->
<!--                <b-dropdown-item @click="logOut">Sign Out</b-dropdown-item>-->
<!--              </b-nav-item-dropdown>-->

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
  const x = require('../images/EjectXLogo.png')
  export default {
    data() {
      return {
        showHeader: true,
        imgSrc: x
      }
    },
    computed: {
      user() {
        return this.$store.state.user
      }
    },
    methods: {
      toggleHeader() {
        this.showHeader = !this.showHeader
      },
      logout() {
        this.$store.dispatch('logout')
        this.$router.push({ name: 'LoginPage' })
      }
    }
  }
</script>
<style lang="scss" scoped>
  .header {
    background: #fff;

    .logo {
      img {
        height: 50px;
      }
    }

    .user-info {
      padding-left: 120px;
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
