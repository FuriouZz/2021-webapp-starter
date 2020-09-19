import { defineComponent, computed } from "vue";
import $style from "./hello.styl";
import template from "./hello.html.ejs";

export const HelloComponent = defineComponent({
  template,
  setup() {
    return {
      $style: computed($style)
    }
  },
})