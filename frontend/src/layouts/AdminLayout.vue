<template>
    <v-layout>
      <!-- Menú lateral -->
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
        color="primary"
        theme="dark"
      >
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
          title="Administrador"
          nav
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>
  
        <v-divider></v-divider>
  
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in menuItems"
            :key="item.name"
            :to="{ name: item.name }"
            :prepend-icon="item.meta.icon"
            :title="item.meta.title"
            active-color="primary"
            class="mb-1"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
  
      <!-- Contenido principal -->
      <v-main style="min-height: 100vh">
        <v-app-bar color="primary" dark>
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
          <v-toolbar-title>Noticiero Admin</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon
              >
                <v-icon>mdi-account</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="cerrarSesion">
                <v-list-item-title>Cerrar sesión</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-app-bar>
  
        <!-- Contenido de la vista actual -->
        <v-container fluid class="pa-6">
          <router-view></router-view>
        </v-container>
      </v-main>
    </v-layout>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { adminRoutes } from '../router'
  type IconValue = string | string[]
  
  // Interfaces
  interface RouteMeta {
    icon?: IconValue
    title?: string
    showInMenu?: boolean
  }
  
  interface AdminRoute {
    name?: string | symbol
    meta?: RouteMeta
  }
  
  interface MenuItem {
    name: string | symbol
    meta: {
      icon: IconValue
      title: string
    }
  }
  
  // Estado
  const drawer = ref(true)
  const rail = ref(true)
  const router = useRouter()
  
  // Filtrar solo las rutas que deben mostrarse en el menú
  const menuItems = computed((): MenuItem[] => {
    return adminRoutes
      .filter((route: AdminRoute) => {
        return route.meta && 
               route.meta.showInMenu !== false && 
               route.meta.icon && 
               route.meta.title &&
               route.name
      })
      .map((route: AdminRoute): MenuItem => ({
        name: route.name!,
        meta: {
          icon: route.meta!.icon!,
          title: route.meta!.title!
        }
      }))
  })
  
  // Cerrar sesión
  const cerrarSesion = () => {
    // Lógica para cerrar sesión
    router.push('/login')
  }
  </script>
  
  <style scoped>
  /* Estilos específicos del layout */
  :deep(.v-data-table-header) {
    background-color: #f5f5f5;
  }
  
  :deep(.v-data-table-header th) {
    font-weight: 600;
    color: rgba(0, 0, 0, 0.87);
  }
  
  /* Estilos para los diálogos */
  :deep(.v-dialog .v-card) {
    border-radius: 8px;
  }
  
  :deep(.v-dialog .v-card-title) {
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 500;
  }
  
  /* Estilos para los botones de acción */
  .action-btn {
    min-width: 36px;
    margin: 0 2px;
  }
  
  /* Estilos para los estados */
  .estado-borrador {
    background-color: #e0e0e0;
    color: #424242;
  }
  
  .estado-publicado {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  .estado-eliminado {
    background-color: #ffebee;
    color: #c62828;
  }
  </style>