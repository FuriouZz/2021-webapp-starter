import { defineComponent } from "vue";

export const App = defineComponent({
  template: `<div id="app">
    <router-link to="/hola">Hola</router-link>
    <router-link to="/hello">Hello</router-link>
    <router-view></router-view>
  </div>`,

  setup() {},
})