import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import FuentesView from '../views/admin/FuentesView.vue'
import NoticierosView from '../views/admin/NoticierosView.vue'
import LoginView from '../views/admin/LoginView.vue'

export const adminRoutes: RouteRecordRaw[] = [
    {
        path: 'noticieros',
        name: 'noticieros',
        component: NoticierosView,
        meta: {
            requiresAuth: true,
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
            requiresAuth: true,
            title: 'Fuentes',
            icon: 'mdi-rss',
            showInMenu: true
        }
    },
    // Aquí puedes agregar más rutas de administración en el futuro
]

export const loginRoutes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: {
            title: 'Iniciar Sesión',
            icon: 'mdi-login',
            showInMenu: false
        }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/admin',
            component: AdminLayout,
            meta: { requiresAuth: true },
            children: [
                ...adminRoutes,
                {
                    path: '',
                    redirect: { name: 'noticieros' }
                }
            ]
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: {
                title: 'Iniciar Sesión',
                icon: 'mdi-login',
                showInMenu: false
            }
        },
        {
            path: '/',
            redirect: { name: 'login' }
        }
    ]
})

// Maneja el redireccionamiento al login si el usuario no tiene credenciales.
router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const tokenRaw = localStorage.getItem('token')
    const hasToken = typeof tokenRaw === 'string' && tokenRaw.trim().length > 0

    // Si la ruta requiere autenticación y no hay token válido, redirige a login
    if (requiresAuth && !hasToken) {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
    }

    // Si intenta ir a login y ya está autenticado, redirige al panel
    if (to.name === 'login' && hasToken) {
        next({ path: '/admin' })
        return
    }

    next()
})

export default router