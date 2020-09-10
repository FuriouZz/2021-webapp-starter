import Vue from "vue";
import $style from "./hello.styl";
import template from "./hello.html.ejs";

export default Vue.extend({

  template,

  computed: {
    $style: () => $style,
  }

})