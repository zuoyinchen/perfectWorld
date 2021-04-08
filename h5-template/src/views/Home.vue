<template>
  <div class="home">
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'Home',
  data() {
    return {
    }
  },
  created() {
    let str = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6388717848944cd8&redirect_uri=${process.env.VUE_APP_WANMEI}?courseid=1&response_type=code&scope=snsapi_userinfo&state=$#wechat_redirect`
    this.$router.replace(str)
  },

}
</script>
<style>
.home {
  background: #000;
  height: 1200px;
}
</style>