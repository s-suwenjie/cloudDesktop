import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import websocket from 'vue-native-websocket';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


const electron = window.require("electron");
Vue.use(electron)
Vue.prototype.$electron = electron;
Vue.use(ElementUI);
Vue.use(websocket, '', {
  connectManually: true, // 手动连接
  format: 'json', // json格式
  reconnection: true, // 是否自动重连
  reconnectionAttempts: 5, // 自动重连次数
  reconnectionDelay: 2000, // 重连间隔时间
});

Vue.config.productionTip = false

new Vue({
  axios,
  router,
  ElementUI,
  store,
  render: h => h(App)
}).$mount('#app')
