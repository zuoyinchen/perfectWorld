<template>
  <div class="box">
    <div class="outer">
        <router-link class="l" to="/a">AAAA</router-link>

        <router-link class="l" to="/b">BBBB</router-link>

        <router-link class="l" to="/c">CCCC</router-link>
    </div>
    <crumbs> </crumbs>
    <div class="app-main">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
import crumbs from '../components/crumbs'
export default {
  data() {
    return {
      
    }
  },
  components: {
    crumbs
  }
}
</script>
<style scoped>

.box {
  width: 200px;
  position: fixed;
  background: rebeccapurple;
  height: 100%;
}
.outer {
  display: flex;
  flex-wrap: wrap;
}
.l{
  width: 200px;
  margin-top: 20px;
  color: #fff;
  text-align: center;
  height: 40px;
  line-height: 40px;
  border: 1px solid red;
}
.l:hover{
  background: #ccc;
  cursor: pointer;
}
.app-main {
  width: calc(100% - 208px);
  height: 500px;
  position: fixed;
  right: 0;
  top: 50px;
  /* position: relative; */
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>