<template>
  <div>
    <!-- Título y botón de nuevo -->
    <v-row class="mb-4" justify="space-between" align="center">
      <v-col cols="12" sm="6" md="8">
        <h1 class="text-h4">Administrar Noticieros</h1>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-right">
        <v-btn color="primary" @click="abrirDialogoCrear">
          <v-icon start>mdi-plus</v-icon>
          Nuevo Noticiero
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtros y búsqueda -->
    <v-card class="mb-6" elevation="2">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="busqueda"
              label="Buscar noticieros..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              @update:model-value="filtrarNoticieros"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="filtroEstado"
              :items="estados"
              label="Filtrar por estado"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="filtrarNoticieros"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla de noticieros -->
    <v-card>
      <v-card-text>
        <v-data-table
          :headers="columnas"
          :items="noticierosFiltrados"
          :loading="cargando"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.state="{ item }">
            <v-chip :color="obtenerColorEstado(item.state)" size="small">
              {{ formatearEstado(item.state) }}
            </v-chip>
          </template>

          <template v-slot:item.fechaCreacion="{ item }">
            {{ formatearFecha(item.fechaCreacion) }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip text="Ver detalles" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="info"
                  size="small"
                  @click="verDetalles(item)"
                  class="mr-1"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Editar" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editarNoticiero(item)"
                  class="mr-1"
                  :disabled="item.state === 'PUBLISHED'"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip 
              :text="item.state === 'PUBLISHED' ? 'Ya publicado' : 'Publicar'" 
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="success"
                  size="small"
                  @click="publicarNoticieroClick(item.id)"
                  class="mr-1"
                  :loading="publicandoId === item.id"
                  :disabled="item.state === 'PUBLISHED'"
                >
                  <v-icon>mdi-send-check</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip 
              :text="item.state === 'PUBLISHED' ? 'Eliminar' : 'Eliminar borrador'" 
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon
                  variant="text"
                  color="error"
                  size="small"
                  @click="confirmarEliminar(item)"
                  :loading="eliminandoId === item.id"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Diálogo para crear/editar noticiero -->
    <v-dialog v-model="dialogoNoticiero" max-width="800px" persistent>
  <v-card>
    <v-card-title>
      <span class="text-h5">{{ esEdicion ? 'Editar' : 'Generar Nuevo' }} Noticiero</span>
    </v-card-title>

    <v-card-text>
      <v-form v-if="esEdicion" v-model="formularioValido">
        </v-form>

      <v-form v-else v-model="formularioValido">
        <v-container>
          <v-row>
            <v-col cols="12">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Parámetros</h3>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="parametrosIA.channelName"
                label="Nombre del canal"
                variant="outlined"
                :rules="[v => !!v || 'El nombre del canal es requerido']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <h4 class="text-subtitle-2 mb-1">Nombres de presentadores</h4>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="parametrosIA.malePresenter"
                label="Masculino"
                variant="outlined"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="parametrosIA.femalePresenter"
                label="Femenino"
                variant="outlined"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    Censura ({{ censoredWords.length }} palabras)
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" sm="8">
                        <v-text-field
                          v-model="newCensoredWord"
                          label="Añadir palabra o frase a censurar"
                          variant="outlined"
                          density="compact"
                          hide-details
                          @keydown.enter.prevent="addCensoredWord"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-btn
                          color="primary"
                          @click="addCensoredWord"
                          block
                          :disabled="!newCensoredWord"
                        >Añadir</v-btn>
                      </v-col>
                    </v-row>
                    <v-list class="mt-4" v-if="censoredWords.length > 0">
                      <v-list-item
                        v-for="word in censoredWords"
                        :key="word.id"
                        :title="word.text"
                      >
                        <template v-slot:append>
                          <v-btn
                            icon
                            variant="text"
                            color="error"
                            size="small"
                            @click="deleteCensoredWord(word.id)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                    <p v-else class="text-center text-grey mt-4">No hay palabras censuradas.</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

          </v-row>
        </v-container>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" text @click="cerrarDialogo">Cancelar</v-btn>
      <v-btn
        color="primary"
        :loading="guardando"
        @click="guardarNoticiero"
        :disabled="!formularioValido"
      >
        {{ esEdicion ? 'Actualizar' : 'Generar con IA' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="dialogoConfirmacion" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          ¿Estás seguro de eliminar este noticiero?
        </v-card-title>
        <v-card-text>
          Esta acción no se puede deshacer. El noticiero será eliminado permanentemente.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoConfirmacion = false">Cancelar</v-btn>
          <v-btn 
            color="error" 
            text 
            @click="eliminarNoticiero"
            :loading="eliminando"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de detalles -->
    <v-dialog v-model="dialogoDetalles" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalles del Noticiero</span>
          <v-btn 
            v-if="noticieroActual.state === 'PUBLISHED'"
            color="primary"
            @click="reproducirAudio(noticieroActual.id)"
            class="ml-2"
          >
            <v-icon start>mdi-play</v-icon>
            Reproducir Audio
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <h2 class="text-h5 mb-4">{{ noticieroActual.title }}</h2>
                <v-chip 
                  :color="obtenerColorEstado(noticieroActual.state)" 
                  class="mb-4"
                >
                  {{ formatearEstado(noticieroActual.state) }}
                </v-chip>
                <p class="text-subtitle-1 mb-2">
                  <v-icon small class="mr-1">mdi-calendar</v-icon>
                  Publicado el: {{ formatearFecha(noticieroActual.publicationDate) }}
                </p>
                <v-divider class="my-4"></v-divider>
                <div class="content-box">
                  {{ noticieroActual.guion }}
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogoDetalles = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getNoticieros,
  createNoticiero,
  updateNoticiero,
  deleteNoticiero,
  publicarNoticiero as publicarNoticieroAPI,
  type Noticiero
} from '../../controllers/noticierosController'

// Base URL para API
const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

// --- NUEVO ESTADO PARA PARÁMETROS DE IA ---
const parametrosIA = ref({
  channelName: '',
  malePresenter: '',
  femalePresenter: '',
})
const censoredWords = ref<{ id: number; text: string }[]>([])
const newCensoredWord = ref('')

// --- Estado existente ---
const noticieros = ref<Noticiero[]>([])
const noticierosFiltrados = ref<Noticiero[]>([])
const noticieroActual = ref<Partial<Noticiero>>({})
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const publicandoId = ref<string | null>(null)
const eliminandoId = ref<string | null>(null)
const dialogoNoticiero = ref(false)
const dialogoConfirmacion = ref(false)
const dialogoDetalles = ref(false)
const esEdicion = ref(false)
const formularioValido = ref(false)
const busqueda = ref('')
const filtroEstado = ref<string | null>(null)

// --- Constantes (sin cambios) ---
const columnas = [
  { title: 'Título', key: 'title' },
  { title: 'Estado', key: 'state' },
  { title: 'Fecha de Creación', key: 'fechaCreacion' },
  { title: 'Acciones', key: 'actions', sortable: false }
]
const estados = [
  { title: 'Pendiente', value: 'PENDING' },
  { title: 'Publicado', value: 'PUBLISHED' },
  { title: 'Rechazado', value: 'REJECTED' }
]

// --- Métodos de formato (sin cambios) ---
const formatearFecha = (fecha?: string | Date) => {
  if (!fecha) return ''
  return format(new Date(fecha), 'PPpp', { locale: es })
}
const formatearEstado = (estado?: string) => {
  if (!estado) return ''
  const estadoObj = estados.find(e => e.value === estado)
  return estadoObj ? estadoObj.title : estado
}
const obtenerColorEstado = (estado?: string) => {
  switch (estado) {
    case 'PUBLISHED': return 'success'
    case 'REJECTED': return 'error'
    default: return 'warning'
  }
}

// --- Métodos de la UI (con modificaciones) ---

// NUEVOS MÉTODOS PARA LA CENSURA
const addCensoredWord = () => {
  if (newCensoredWord.value.trim() === '') return
  censoredWords.value.push({
    id: Date.now(), // ID simple para el ejemplo
    text: newCensoredWord.value.trim()
  })
  newCensoredWord.value = '' // Limpiar el campo
}
const deleteCensoredWord = (id: number) => {
  censoredWords.value = censoredWords.value.filter(word => word.id !== id)
}

const filtrarNoticieros = () => {
  let filtrados = [...noticieros.value]
  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    filtrados = filtrados.filter(noticiero =>
      noticiero.title.toLowerCase().includes(busquedaLower) ||
      noticiero.guion.toLowerCase().includes(busquedaLower)
    )
  }
  if (filtroEstado.value) {
    filtrados = filtrados.filter(noticiero => noticiero.state === filtroEstado.value)
  }
  noticierosFiltrados.value = filtrados
}

const cargarNoticieros = async () => {
  cargando.value = true
  try {
    noticieros.value = await getNoticieros()
    filtrarNoticieros() // Usar la función de filtro para actualizar la tabla
  } catch (error) {
    console.error('Error al cargar noticieros:', error)
  } finally {
    cargando.value = false
  }
}

// MODIFICADO: Ahora resetea los parámetros de la IA
const abrirDialogoCrear = () => {
  esEdicion.value = false
  parametrosIA.value = {
    channelName: '',
    malePresenter: '',
    femalePresenter: '',
  }
  censoredWords.value = []
  noticieroActual.value = {}
  dialogoNoticiero.value = true
}

const editarNoticiero = (noticiero: Noticiero) => {
  esEdicion.value = true
  noticieroActual.value = { ...noticiero }
  dialogoNoticiero.value = true
}

const cerrarDialogo = () => {
  dialogoNoticiero.value = false
}

// MODIFICADO: Ahora maneja ambos casos (Crear con IA y Editar)
const guardarNoticiero = async () => {
  if (!formularioValido.value) return;

  guardando.value = true
  try {
    if (esEdicion.value && noticieroActual.value.id) {
      // Lógica de actualización (si la mantienes)
      await updateNoticiero(noticieroActual.value.id, noticieroActual.value)
    } else {
      // Nueva lógica para generar con IA
      console.log('Enviando para generar con IA:')
      // La función createNoticiero ahora recibirá estos parámetros
      await createNoticiero({
        title: noticieroActual.value.title ?? '',
        guion: noticieroActual.value.guion ?? '',
        state: noticieroActual.value.state ?? 'PENDING',
        publicationDate: noticieroActual.value.publicationDate ?? new Date().toISOString().substr(0, 10),
        })
    }
    await cargarNoticieros()
    cerrarDialogo()
  } catch (error) {
    console.error('Error al guardar el noticiero:', error)
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (noticiero: Noticiero) => {
  noticieroActual.value = { ...noticiero }
  dialogoConfirmacion.value = true
}

const eliminarNoticiero = async () => {
  if (!noticieroActual.value.id) return
  
  try {
    eliminando.value = true
    eliminandoId.value = noticieroActual.value.id
    
    await deleteNoticiero(noticieroActual.value.id)
    await cargarNoticieros()
    dialogoConfirmacion.value = false
  } catch (error) {
    console.error('Error al eliminar el noticiero:', error)
  } finally {
    eliminando.value = false
    eliminandoId.value = null
  }
}

const publicarNoticieroClick = async (id?: string) => {
  try {
    if (!id) return
    publicandoId.value = id
    await publicarNoticieroAPI(id)
    await cargarNoticieros()
  } catch (error) {
    console.error('Error al publicar el noticiero:', error)
  } finally {
    publicandoId.value = null
  }
}

const verDetalles = (noticiero: Noticiero) => {
  noticieroActual.value = { ...noticiero }
  dialogoDetalles.value = true
}

const reproducirAudio = async (id?: string) => {
  if (!id) return
  try {
    const url = `${API_URL}/noticieros/${id}/audio`
    const audio = new Audio(url)
    await audio.play()
  } catch (error) {
    console.error('Error reproduciendo audio del noticiero:', error)
  }
}

// Cargar datos iniciales
onMounted(() => {
  cargarNoticieros()
})
</script>

<style scoped>
.content-box {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
  white-space: pre-line;
  line-height: 1.6;
}

.estado-pendiente {
  background-color: #fff3e0;
  color: #e65100;
}

.estado-publicado {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.estado-rechazado {
  background-color: #ffebee;
  color: #c62828;
}
</style>
