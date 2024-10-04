import Vue from 'vue'
import Router from 'vue-router'
//import store from './store.js'
import Login from './components/Login'
import MapComponent from './components/MapComponent'
import AdminMap from "./components/AdminMap.vue";

Vue.use(Router)

let router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/admin-map',
            component: AdminMap
        },
        {
            path: '/',
            component: MapComponent
        },
        {
            path: '/login',
            component: Login,
        }
    ]
})

/*router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/login') 
  } else {
    next() 
  }
})*/


export default router