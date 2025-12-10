import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import KioskBoard from '../views/KioskBoard.vue'
import MobileCheckIn from '../views/MobileCheckIn.vue'
import BindDevice from '../views/BindDevice.vue'

const router = createRouter({
    history: createWebHashHistory(), // Hash mode is better for GAS/Static hosting without rewrite support
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminDashboard,
            meta: { requiresAuth: true, role: 'admin' }
        },
        {
            path: '/kiosk',
            name: 'kiosk',
            component: KioskBoard
        },
        {
            path: '/checkin',
            name: 'checkin',
            component: MobileCheckIn
        },
        {
            path: '/bind',
            name: 'bind',
            component: BindDevice
        }
    ]
})

// Basic Guard
router.beforeEach((to, from, next) => {
    // Logic to check session or role (omitted for initial setup)
    next()
})

export default router
