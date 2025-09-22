import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import FuentesView from '../views/admin/FuentesView.vue'
import NoticierosView from '../views/admin/NoticierosView.vue'

export const adminRoutes: RouteRecordRaw[] = [
    {
        path: 'noticieros',
        name: 'noticieros',
        component: NoticierosView,
        meta: { 
            title: 'Noticieros', 
            icon: 'mdi-newspaper-variant-multiple',
            showInMenu: true
        }
    },
    {
        path: 'fuentes',
        name: 'fuentes',
        component: FuentesView,
        meta: { 
            title: 'Fuentes', 
            icon: 'mdi-rss',
            showInMenu: true 
        }
    },
    // Aquí puedes agregar más rutas de administración en el futuro
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/admin',
            component: AdminLayout,
            children: [
                ...adminRoutes,
                {
                    path: '',
                    redirect: { name: 'noticieros' }
                }
            ]
        },
        {
            path: '/',
            redirect: '/admin'
        }
    ]
})

export default router