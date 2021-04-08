import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'lib-flexible'
Vue.config.productionTip = false
Vue.config.ignoredElements = ['wx-open-launch-weapp']

// import Vconsole from 'vconsole'
// let vConsole = new Vconsole()
// export default vConsole
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
