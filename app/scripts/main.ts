import Vue from "vue";
import HelloComponent from "./components/hello.vue"
import HolaComponent from "./components/hola.vue"

async function main() {
  new Vue({
    el: "#app",
    render: h => {
      return h("div", {}, [
        h(HelloComponent),
        h(HolaComponent),
      ])
    }
  })
}

window.addEventListener('DOMContentLoaded', main)