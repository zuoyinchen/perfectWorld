<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <HelloWorld v-if="true" msg="Welcome to Your Vue.js App"/>
    <!-- <gold></gold> -->
    <!-- <calendar></calendar> -->
    <!-- <city></city> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
// import gold from './components/gold.vue'
// import calendar from './components/calendar.vue'
// import city from './components/city.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    // gold,
    // calendar,
    // city
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
