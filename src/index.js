import Vue from 'vue';
import App from './App';
import router from './router';
import './common/stylus/index.styl'; // 引入全局样式
import 'babel-polyfill';
import fastclick from 'fastclick';
import VueLazyload from 'vue-lazyload';
import store from './store';

Vue.config.productionTip = false;
fastclick.attach(document.body);
// 图片懒加载
Vue.use(VueLazyload, {
  loading: require('./common/image/default.png'),
});

// let base = process.env.NODE_ENV === 'production' ?'http://ustbhuangyi.com':'http://localhost:8080';
// Vue.prototype.baseURL = base;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});
