<template>
  <div>
    <div class="head">
        <div class="box" @click="enter">
          <div class="cell"></div>
          <div class="line" :style="{ height: h +'px'}"></div>
        </div>
        <div class="ball">

        </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      h: 200
    }
  },
  methods: {
    enter() {
      let timer = setInterval(() => {
        this.h += 20
        if (this.h >= 800) {
          clearInterval(timer)
        }
      }, 100)
    },
    fn(item) {
      let len = item.indexOf(id)
      if (len < 0) {
        this[item].push(id)
      } else {
        return false
      }

      if (type === 'click') {
        fn('isListClick')
      } else {
        fn('idList')
      }
    }
  },
}
</script>
<style scoped>
* {
  margin: 0;
}
.head {
  width: 1000px;
  height: 100vh;
  border: 1px solid orange;
  margin: 20px;
}
.box {
  position: absolute;
  left: 500px;
}
.cell {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000;
}
.line {
  width: 20px;
  height: 100px;
  background: #000;
}
.ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: green;
  position: absolute;
  left: 500px;
  top: 400px;
}
</style>