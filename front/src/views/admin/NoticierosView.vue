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
          <span class="text-h5">{{ esEdicion ? 'Editar' : 'Nuevo' }} Noticiero</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="formularioValido" ref="formulario">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="noticieroActual.title"
                    label="Título"
                    :rules="[v => !!v || 'El título es requerido']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="noticieroActual.guion"
                    label="Guión"
                    :rules="[v => !!v || 'El guión es requerido']"
                    required
                    variant="outlined"
                    rows="10"
                    auto-grow
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="menuFecha"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="noticieroActual.publicationDate"
                        label="Fecha de publicación"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        v-bind="props"
                        variant="outlined"
                        :rules="[v => !!v || 'La fecha es requerida']"
                        required
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="noticieroActual.publicationDate"
                      @input="menuFecha = false"
                      locale="es"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="cerrarDialogo">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            :loading="guardando"
            @click="guardarNoticiero"
          >
            {{ esEdicion ? 'Actualizar' : 'Guardar' }}
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

// Base URL para API (usa '/api' por defecto si no hay env)
const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

// Tipos - Importado desde el controlador
const noticieros = ref<Noticiero[]>([])
const noticierosFiltrados = ref<Noticiero[]>([])
const noticieroActual = ref<Partial<Noticiero>>({
  title: '',
  guion: '',
  state: 'PENDING',
  publicationDate: new Date().toISOString().substr(0, 10)
})

// UI State
const cargando = ref(false)
const guardando = ref(false)
const eliminando = ref(false)
const publicandoId = ref<string | null>(null)
const eliminandoId = ref<string | null>(null)
const dialogoNoticiero = ref(false)
const dialogoConfirmacion = ref(false)
const dialogoDetalles = ref(false)
const esEdicion = ref(false)
const menuFecha = ref(false)
const formularioValido = ref(false)
const busqueda = ref('')
const filtroEstado = ref<string | null>(null)

// Constantes
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

// Métodos
const formatearFecha = (fecha?: string) => {
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
    case 'PUBLISHED':
      return 'success'
    case 'REJECTED':
      return 'error'
    default:
      return 'warning' // PENDING
  }
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
  try {
    cargando.value = true
    noticieros.value = await getNoticieros()
    noticierosFiltrados.value = [...noticieros.value]
  } catch (error) {
    console.error('Error al cargar noticieros:', error)
  } finally {
    cargando.value = false
  }
}

const abrirDialogoCrear = () => {
  esEdicion.value = false
  noticieroActual.value = {
    title: '',
    guion: '',
    state: 'PENDING',
    publicationDate: new Date().toISOString().substr(0, 10)
  }
  dialogoNoticiero.value = true
}

const editarNoticiero = (noticiero: Noticiero) => {
  esEdicion.value = true
  noticieroActual.value = { ...noticiero }
  dialogoNoticiero.value = true
}

const cerrarDialogo = () => {
  dialogoNoticiero.value = false
  setTimeout(() => {
    noticieroActual.value = {
      title: '',
      guion: '',
      state: 'PENDING',
      publicationDate: new Date().toISOString().substr(0, 10)
    }
  }, 300)
}

const guardarNoticiero = async () => {
  try {
    guardando.value = true
    
    if (esEdicion.value && noticieroActual.value.id) {
      await updateNoticiero(noticieroActual.value.id, noticieroActual.value)
    } else {
      await createNoticiero(noticieroActual.value as Omit<Noticiero, 'id'>)
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
