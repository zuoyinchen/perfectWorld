<template>
  <div class="hello">
    <draggable v-model="arr">
            <div v-for="element in arr" :key="element">
                {{element}}
            </div>
    </draggable>
    <div @click="save">
      save
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
// import dayjs from 'dayjs'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
      draggable,
  },
  data() {
    return {
      arr: [
        'ASDJKASJDLKJASDK;L',
        'DJASKHDLKHASDLKHASKLD',
        'AJDSLKJASLKJDL'
      ]
    }
  },
  created(){
    // console.log(dayjs().format('2021年1月25日'))
    let str = '2021年1月25日'
    console.log(str.replace(/年|月|日/g, '/').slice(0, str.length - 1))
    let params = JSON.stringify({
      abc: 111,
      arr: [1,2,3]
    })
    console.log({params})
  },
  methods:{ 
    save() {
      console.log(this.arr, 'SADJKL')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.box {
  width: 500px;
  height: 100px;
  border: 1px solid #ccc;
  text-align: center;
}
</style>
