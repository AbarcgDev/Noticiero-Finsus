<template>
    <v-main class="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div class="w-full max-w-md">
        <transition name="fade" mode="out-in">
          <!-- Formulario de Login -->
          <div v-if="isLoginView" key="login">
            <v-card class="p-4 rounded-2xl shadow-lg">
              <v-card-title class="text-center text-h5 font-bold text-gray-800 dark:text-white">
                Iniciar Sesión
              </v-card-title>
              <v-card-text>
                <form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="username"
                    label="Username"
                    type="text"
                    variant="outlined"
                    class="m.b-3"
                    required
                    hide-details="auto"
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="Contraseña"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    required
                    hide-details="auto"
                  ></v-text-field>
                  <v-btn type="submit" color="indigo-darken-1" block size="large">
                    Entrar
                  </v-btn>
                </form>
              </v-card-text>
              <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 px-4 pb-4">
                ¿No tienes cuenta?
                <a href="#" @click.prevent="toggleView" class="font-medium text-indigo-600 hover:text-indigo-500">
                  Regístrate
                </a>.
              </p>
            </v-card>
          </div>
  
          <!-- Formulario de Registro -->
          <div v-else key="register">
            <v-card class="p-4 rounded-2xl shadow-lg">
              <v-card-title class="text-center text-h5 font-bold text-gray-800 dark:text-white">
                Crear Cuenta
              </v-card-title>
              <v-card-text>
                <form @submit.prevent="handleRegister">
                  <v-text-field
                    label="Username"
                    type="text"
                    variant="outlined"
                    class="mb-3"
                    required
                    hide-details="auto"
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="Contraseña (mín. 6 caracteres)"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    required
                    hide-details="auto"
                  ></v-text-field>
                  <v-btn type="submit" color="indigo-darken-1" block size="large">
                    Registrarse
                  </v-btn>
                </form>
              </v-card-text>
              <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 px-4 pb-4">
                ¿Ya tienes cuenta?
                <a href="#" @click.prevent="toggleView" class="font-medium text-indigo-600 hover:text-indigo-500">
                  Inicia sesión
                </a>.
              </p>
            </v-card>
          </div>
        </transition>
  
        <!-- Contenedor para mensajes de error -->
        <transition name="fade">
          <div v-if="errorMessage" class="mt-4 text-center">
               <v-alert type="error" variant="tonal" density="compact">
                  {{ errorMessage }}
               </v-alert>
          </div>
        </transition>
      </div>
    </v-main>
  </template>
  
  <script setup lang="ts">
  import router from '../../router';
import { ref, watch } from 'vue';
  
  // --- Props y Emits ---
  // El componente acepta un error desde el padre (ej. error de API)
  const props = defineProps({
    apiError: {
      type: String,
      default: '',
    },
  });
  
  // El componente emite eventos cuando los formularios son enviados
  const emit = defineEmits(['login-submitted', 'register-submitted']);
  
  
  // --- Estado Reactivo Interno ---
  const isLoginView = ref(true);
  const username = ref('');
  const password = ref('');
  const errorMessage = ref(''); // Muestra errores de validación local o de la API
  
  // --- Observador para el error de la API ---
  // Si la prop apiError cambia, actualizamos el mensaje de error local
  watch(() => props.apiError, (newValue) => {
    if (newValue) {
      errorMessage.value = newValue;
    }
  });
  
  // --- Métodos ---
  const handleLogin = async () => {
    // Validación básica antes de emitir
    if (!username.value || !password.value) {
      errorMessage.value = 'Por favor, completa todos los campos.';
      return;
    }
    errorMessage.value = ''; // Limpia el error antes de emitir
    // Emite los datos al componente padre para que maneje la lógica de login
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });
    if (response.ok) {
      const payload = await response.json();
      localStorage.setItem('username', payload.data.username);
      localStorage.setItem('token', payload.data.jwt);
      emit('login-submitted');
      router.push('/admin');
    } else {
      errorMessage.value = 'Error al iniciar sesión.';
    }
  };
  
  const handleRegister = () => {
    // Validación básica antes de emitir
    if (!username.value || !password.value) {
      errorMessage.value = 'Por favor, completa todos los campos.';
      return;
    }
    if (password.value.length < 6) {
      errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    errorMessage.value = ''; // Limpia el error antes de emitir
    // Emite los datos al componente padre para que maneje la lógica de registro
    emit('register-submitted', { username: username.value, password: password.value });
  };
  
  // Cambia entre la vista de login y registro
  const toggleView = () => {
    isLoginView.value = !isLoginView.value;
    // Limpia los campos y errores al cambiar de vista
    errorMessage.value = '';
    username.value = '';
    password.value = '';
  };
  </script>
  
  <style scoped>
  /* Estilos para las transiciones de Vue */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }
  </style>
  
  