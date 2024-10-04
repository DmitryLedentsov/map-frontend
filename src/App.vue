<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
<!--      <v-app-bar-title>{{ title }}</v-app-bar-title>-->
      <v-spacer></v-spacer>
      <v-btn v-if="$route.path === '/admin-map'" icon @click="logout">
        <v-icon>mdi-account-arrow-right</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fill-height>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    // title: process.env.VUE_APP_TITLE,
  }),
  methods: {
    logout() {
      this.$http.get('logout').then(() => {
        this.$router.push('/login')
      })
    }
  }
};
</script>
