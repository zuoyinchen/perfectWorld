<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <HelloWorld v-if="false" msg="Welcome to Your Vue.js App"/>
    <!-- <gold></gold> -->
    <calendar></calendar>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
// import gold from './components/gold.vue'
import calendar from './components/calendar.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    // gold,
    calendar
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
