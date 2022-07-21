<template>
  <div class="box">
    <div v-for="(item, index) in item" :key="index" :class="['item', index==0? 'a': '', index==2? 'b': '']" draggable="true">
      {{ item }}
    </div>
  </div>
</template>
<script>
import area from '../util/area.js'
export default {
  data() {
    return {
      area,
      item: [1,2,3,4,5,6,7]
    }
  },
}
</script>
<style scoped>
.box {
  border: 1px solid red;
  width: 86%;
  height: 500px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
}
.item {
  width: 50px;
  /* height: 100px; */
  background: #000;
  border: 1px solid #fff;
  justify-content: center;
  align-items: center;
  margin: 12px;
}
.a {
  margin-left: 40px;
}
.b {
  margin-right: 40px;
}
</style>