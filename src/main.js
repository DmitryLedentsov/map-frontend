import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import vuetify from './plugins/vuetify'
import Axios from 'axios'
import {LMap, LTileLayer, LMarker, LPopup, LTooltip, LControl} from "vue2-leaflet";
import 'leaflet/dist/leaflet.css';
import VueCookies from 'vue-cookies'
import LGeosearch from "vue2-leaflet-geosearch";
import Vue2LeafletLocatecontrol from 'vue2-leaflet-locatecontrol'

Vue.prototype.$http = Axios.create({
    baseURL: 'api/',
    withCredentials: true
});

Vue.use(VueCookies)

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-poopup', LPopup)
Vue.component('l-tooltip', LTooltip)
Vue.component('l-control', LControl)
Vue.component('l-geosearch', LGeosearch)
Vue.component('l-locatecontrol', Vue2LeafletLocatecontrol)

Vue.config.productionTip = false

new Vue({
    vuetify,
    router,
    render: h => h(App)
}).$mount('#app')
