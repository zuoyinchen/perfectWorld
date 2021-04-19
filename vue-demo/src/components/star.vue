<template>
  <div class="hello" @mousedown="down" id="box" @mouseup="up">
    <div class="icon" v-for="(item, index) in list" :key="index" :style="{'left':item.left + 'px', 'top': item.top + 'px', background: item.color}">
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'star',
  data() {
    return {
      list: [{
        left: 50,
        top: 100,
        color: '#'+(Math.random()*0xffffff<<0).toString(16)
      },
      {
        left: 200,
        top: 0,
        color: '#'+(Math.random()*0xffffff<<0).toString(16)
      }]
    }
  },
  methods: {
    down(e) {
      this.creatDom(e, 0)
    },
    up() {
      this.list.forEach(item => {
        setInterval(()=>{
          item.top -= 10
          item.left -= 0
          this.list = this.list.filter(item => {
            return item.top > 0
          })
        }, 60)
      });
    },
    creatDom(e) {
      this.list.push({left: e.x - 25, top: e.y -25, color: '#'+(Math.random()*0xffffff<<0).toString(16)})
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
* {
  margin: 0;
  padding: 0;
}
.hello {
  width: 1000px;
  height: 800px;
  border: 1px solid #000;
  position: relative;
}
.icon {
  width: 50px;
  height: 50px;
  background: #000;
  position: absolute;
  border-radius: 50%;
}
</style>
