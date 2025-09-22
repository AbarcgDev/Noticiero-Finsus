import { createRouter, createWebHistory } from 'vue-router'
import FuentesView from '../views/admin/FuentesView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/admin/fuentes',
            name: 'fuentes',
            component: FuentesView
        },
        {
            path: '/',
            redirect: '/admin/fuentes'
        }
    ]
})

export default router