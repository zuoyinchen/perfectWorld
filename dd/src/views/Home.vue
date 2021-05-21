// eslint-disable-next-line
/* eslint-disable */
<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <canvas id="canvas">

    </canvas> -->
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
// import Canvas from '../../../my-project/src/pages/API/canvas/canvas.vue'
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {

    // Canvas    // HelloWorld
  },
  beforeCreate() {
    console.log('beforeCreate', 1)
  },
  created() {
    console.log('created', 1)


  },
  beforeMount() {
    console.log('beforeMount', 1)
  },
  mounted() {
  

  },
}
</script>
