import App from './App'
import store from 'store/index.js'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'

try {
  function isPromise(obj) {
    return (
      !!obj &&
      (typeof obj === "object" || typeof obj === "function") &&
      typeof obj.then === "function"
    );
  }

  // 统一 vue2 API Promise 化返回格式与 vue3 保持一致
  uni.addInterceptor({
    returnValue(res) {
      if (!isPromise(res)) {
        return res;
      }
      return new Promise((resolve, reject) => {
        res.then((res) => {
          if (res[0]) {
            reject(res[0]);
          } else {
            resolve(res[1]);
          }
        });
      });
    },
  });
} catch (error) { }

Vue.filter('formatCount', function(val) {
	if(val >= 10000 && val <= 100000000){
		val /= 1000;
		return val.toFixed(1) + '万'
	} else if(val > 100000000){
		val /= 100000000;
		return val.toFixed(1) + '亿'
	} else {
		return val
	}
})

Vue.filter('formatTime', function(val) {
	let date = new Date(val)
	return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日'
})

const app = new Vue({
  ...App,
  store
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif