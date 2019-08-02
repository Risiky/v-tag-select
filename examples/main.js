import Vue from 'vue'
import App from './App.vue'
import VTagSelect from '../packages/index'
Vue.use(VTagSelect)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
