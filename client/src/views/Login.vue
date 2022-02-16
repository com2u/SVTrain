<template>
  <div class="container">
    <h2>Login to SVTrain 1.4.10</h2>
    <div class="login-form">
      <ul>
        <li>
          <input
            type="text"
            placeholder="Login"
            v-model="userLogin"
            @keydown.enter="login"
          />
        </li>
        <li>
          <input
            ref="password"
            type="password"
            placeholder="Type password..."
            v-model="userPassword"
            @keydown.enter="login"
          />
        </li>
        <li>
          <b-button
            :disabled="loading"
            @click="login"
            @keydown.enter="login"
          >
            Login
          </b-button>
        </li>
        <li v-show="errorMessage.length > 0" class="error-message">
          {{ errorMessage }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '../utils/api'

export default {
  name: 'LoginPage',
  data() {
    return {
      userLogin: 'admin',
      userPassword: '',
      errorMessage: '',
      loading: false,
    }
  },
  methods: {
    async login() {
      this.errorMessage = ''
      if (this.userLogin.length === 0) {
        this.errorMessage = 'Login can not be empty'
        this.userPassword = ''
        return
      }

      if (this.userPassword.length === 0) {
        this.errorMessage = 'Password can not be empty'
        this.userPassword = ''
        return
      }

      try {
        this.loading = true
        const data = await api.login(this.userLogin, this.userPassword)
        localStorage.setItem('sessionToken', data.sessionToken)
        localStorage.setItem('sessionUser', data.login)
        // this.$store.dispatch('app/setUser', data.login);
        await api.setSessionToken(data.sessionToken)
        await this.$router.push({ name: 'WorkSpacePage' })
        // window.location.reload()
        this.loading = false
      } catch (e) {
        this.loading = false
        this.errorMessage = e.toString()
        this.userPassword = ''
      }
    },
  },
  mounted() {
    this.$refs.password.focus()
    this.$bvToast.toast('Mounted', {
      title: 'Error',
      autoHideDelay: 5000,
      variant: 'danger',
      toaster: 'b-toaster-bottom-right',
      solid: true,
    })
  },
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.login-form {
  width: 400px;
  padding: 10px;
  border: 1px solid silver;
  border-radius: 4px;
  text-align: center;
  ul {
    list-style: none;
    margin: 0px;
    padding: 0px;
    li {
      padding: 5px 0px 5px;
    }
    li.error-message {
      background: #ED4337;
      width: 100%;
      color: white;
      padding: 3px;
      text-align: center;
    }
  }
}
</style>
