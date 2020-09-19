import { RouteRecordRaw } from "vue-router";
import { HelloComponent } from "./components/hello/hello";
import { HolaComponent } from "./components/hola/hola";

export const Routes: RouteRecordRaw[] = [
  {
    path: "/hello",
    component: HelloComponent
  },
  {
    path: "/hola",
    component: HolaComponent
  },
]