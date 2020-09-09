<template>
  <div class="hello">
    <h1>Hello</h1>
    <img src="../../assets/flags.png" alt="">
  </div>
</template>

<style lang="stylus" module>
.hello {
  color: red
}
</style>

<script lang="ts">
export default {
  mounted() {
    console.log(this)
  }
}
</script>