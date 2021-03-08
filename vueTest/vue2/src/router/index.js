import Vue from 'vue'
import VueRouter from 'vue-router'
import A from '../views/A.vue'
import B from '../views/B.vue'
import C from '../views/C.vue'
import layout from '../layout/index'
Vue.use(VueRouter)


const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/a',
      component: layout,
      children: [
        {
          path: '/a',
          component: A,
          name: 'a'
        }
      ]
    },
    {
      path: '/b',
      component: layout,
      children: [
        {
          path: '/b',
          component: B,
          name: 'b'
        }
      ]
    },
    {
      path: '/c',
      component: layout,
      children: [
        {
          path: '/c',
          component: C,
          name: 'c'
        }
      ]
    }
  ]
})

export default router