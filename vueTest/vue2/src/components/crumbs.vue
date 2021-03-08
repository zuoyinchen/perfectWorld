<template>
    <div class="crumbs">
      <div class="i" v-for="item in crumbs" :key="item">
        <router-link to="/b">{{ item }}</router-link>
        
      </div>
    </div>
</template>
<script>
export default {
  data() {
    return {
      crumbs: [1, 2, 3]
    }
  },
  watch: {
    $route(route) {
      console.log(route, '123123')
    }
  },
  created() {
    console.log(this.$route)
  }
}
</script>
<style scoped>
.crumbs {
  position: fixed;
  left: 200px;
  top: 10px;
  display: flex;
  text-align: center;
  margin: 10px;
  cursor: pointer;
}
.i {
  width: 50px;
  border: 1px solid red;
  margin: 10px;
}
</style>