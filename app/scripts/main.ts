import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { Routes } from "routes";
import { App } from "./app";

async function main() {
  const app = createApp(App)
  const router = createRouter({
    routes: Routes,
    history: createWebHistory()
  })
  app.use(router)
  app.mount("#app")
}

window.addEventListener('DOMContentLoaded', main)