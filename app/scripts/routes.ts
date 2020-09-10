import { RouteConfig } from "vue-router";
import HelloComponent from "./components/hello/hello";
import HolaComponent from "./components/hola.vue";

export const Routes: RouteConfig[] = [
  {
    path: "/hello",
    component: HelloComponent
  },
  {
    path: "/hola",
    component: HolaComponent
  },
]