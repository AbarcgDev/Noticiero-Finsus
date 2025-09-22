<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Noticiero Finsus</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/admin/fuentes" color="white" variant="text">Fuentes</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// No se necesita lógica adicional aquí
</script>