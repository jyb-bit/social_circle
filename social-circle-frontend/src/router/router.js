import {createRouter, createWebHistory} from 'vue-router'
import index from "../views/index.vue";
import login from "../views/login.vue";
import register from "../views/register.vue"
import publish from "../views/publish.vue"
import shouye from "../views/shouye.vue";

const router=createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            component:login
        },
        {
            path:'/login',
            component:login
        },
        {
            path:'/register',
            component:register
        },
        {
            path:'/index',
            component:index,
            meta: { requiresAuth: true }
        },
        {
            path:'/publish',
            component:publish,
            meta: { requiresAuth: true }
        }
    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const loginInfo = localStorage.getItem('login_info');
    
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!loginInfo) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
