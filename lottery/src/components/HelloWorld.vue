<template>
  <div class="hello">
    <div class="cell" :class="index == nowCell ? 'c' : ''" v-for="(item, index) in nums" :key="index" @click="go(index)">
      {{item}}
    </div>
    <div>
      最终解释权归左胤辰所有
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      nums: ['包包', '口红', '牛奶一包', '香水', '点击抽奖', '现金200元', 'ipad', 'iphone13', '手表'],
      tar: [0, 1, 2, 5, 8, 7, 6, 3],
      nowCell: 0,
      rate: 100
    }
  },
  methods: {
    go(e) {
      if (e == 4) {
          console.log('点击')
          let i = 0
          let timer = setInterval(() => {
            i++
            if (i > 7) {
              i = 0
              this.nowCell = 0
            } else {
              this.nowCell = this.tar[i]
            }
          }, this.rate);
          let stopTime = Math.random() * 1000
          setTimeout(() => {
            clearInterval(timer)
          }, stopTime + 3000)
      }
    }
  },
}
</script>

<style scoped>
.hello {
  width: 600px;
  height: 600px;
  border: 1px solid #000;
  display: flex;
  flex-wrap: wrap;
}
.cell {
  width: 200px;
  height: 200px;
  background: yellowgreen;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
.c {
  background: #ccc;
}
</style>
