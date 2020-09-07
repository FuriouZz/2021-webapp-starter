import Vue from "vue";
import VueRouter from "vue-router";
import { Routes } from "routes";
import App from "./app.vue";

async function main() {
  Vue.use(VueRouter)

  new Vue({
    router: new VueRouter({
      routes: Routes,
      mode: "history"
    }),
    render: (h: any) => h(App)
  }).$mount("#app")
}

window.addEventListener('DOMContentLoaded', main)