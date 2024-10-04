<template>
  <v-container>
    <v-row>
      <v-col offset="0" cols="12" offset-sm="3" sm="6">
        <validation-observer ref="observer" v-slot="{ invalid }">
          <validation-provider vid="username" name="Логин" rules="required|min:6" v-slot="{ errors }">
            <v-text-field label="Логин" v-model="username" :error-messages="errors" required/>
          </validation-provider>
          <validation-provider vid="password" name="Пароль" rules="required|min:6" v-slot="{ errors }">
            <v-text-field label="Пароль" v-model="password" required type="password" :error-messages="errors"/>
          </validation-provider>
          <div class="d-flex flex-wrap mt-2">
            <v-btn color="primary" @click="login" :disabled="invalid">Войти</v-btn>
            <v-spacer></v-spacer>
          </div>
        </validation-observer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {ValidationObserver, ValidationProvider, extend} from 'vee-validate';
import {required, min} from 'vee-validate/dist/rules';

extend('required', {
  ...required,
  message: 'Поле "{_field_}" обязательно'
});

extend('min', {
  ...min,
  message: 'Минимум {length} символов'
});

export default {
  name: 'Login',
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data: () => ({
    username: '',
    password: '',
  }),
  methods: {
    login() {
      const data = new FormData()
      data.append("username", this.username)
      data.append("password", this.password)
      this.$http.post(`login`, data).then(response => {
        if (response.status === 200) {
          this.$router.push('/admin-map')
        }
      }).catch(error => {
        if (error.response.status === 401) {
          this.$refs.observer.setErrors({
            // username: ['Неверный логин и/или пароль'],
            password: ['Неверный логин и/или пароль']
          });
        }
      })
    }
  }
}
</script>
