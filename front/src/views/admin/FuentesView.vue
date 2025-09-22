<template>
  <div>
    <v-row class="mb-4" justify="space-between" align="center">
      <v-col cols="12" sm="6" md="8">
        <h1 class="text-h4">Administrar Fuentes</h1>
      </v-col>
      <v-col cols="12" sm="6" md="4" class="text-right">
        <v-btn color="primary" @click="abrirDialogo()">
          <v-icon start>mdi-plus</v-icon>
          Agregar Fuente
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-text>
        <v-data-table
          :headers="columnas"
          :items="fuentes"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.url="{ item }">
            <a :href="item.url" target="_blank" class="text-decoration-none">
              {{ item.url }}
            </a>
          </template>

          <template v-slot:item.activa="{ item }">
            <v-chip :color="item.activa ? 'success' : 'error'" size="small">
              {{ item.activa ? 'Activa' : 'Inactiva' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              variant="text"
              color="primary"
              @click="abrirDialogo(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              color="error"
              @click="confirmarEliminar(item)"
              class="ml-2"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
    </v-card-text>
    </v-card>

    <!-- Diálogo para agregar/editar fuente -->
    <v-dialog v-model="dialogo" max-width="600px">
      <v-card>
        <v-card-title>
          {{ esEdicion ? 'Editar Fuente' : 'Nueva Fuente' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="guardarFuente">
            <v-text-field
              v-model="fuenteActual.nombre"
              label="Nombre de la fuente"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="fuenteActual.url"
              label="URL del feed RSS"
              type="url"
              required
              class="mb-4"
              placeholder="https://ejemplo.com/feed"
            ></v-text-field>

            <v-textarea
              v-model="fuenteActual.descripcion"
              label="Descripción (opcional)"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-checkbox
              v-model="fuenteActual.activa"
              label="Fuente activa"
            ></v-checkbox>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="grey darken-1"
                text
                @click="cerrarDialogo"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
              >
                {{ esEdicion ? 'Guardar cambios' : 'Agregar' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación -->
    <v-dialog v-model="dialogoConfirmacion" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar esta fuente?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogoConfirmacion = false">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="eliminarFuente">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Fuente {
    id?: number;
    nombre: string;
    url: string;
    descripcion?: string;
    activa: boolean;
}

const fuentes = ref<Fuente[]>([])
const dialogo = ref(false)
const dialogoConfirmacion = ref(false)
const fuenteActual = ref<Partial<Fuente>>({
    nombre: '',
    url: '',
    descripcion: '',
    activa: true
})
const fuenteAEliminar = ref<Fuente | null>(null)
const esEdicion = ref(false)

const columnas = [
    { title: 'Nombre', key: 'nombre' },
    { title: 'URL', key: 'url', sortable: false },
    { title: 'Descripción', key: 'descripcion', sortable: false },
    { title: 'Estado', key: 'activa', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false }
]

onMounted(() => {
    cargarFuentes()
})

function cargarFuentes() {
    // Datos de ejemplo
    fuentes.value = [
        {
            id: 1,
            nombre: 'Ejemplo RSS',
            url: 'https://ejemplo.com/feed',
            descripcion: 'Fuente de ejemplo',
            activa: true
        }
    ]
}

function abrirDialogo(fuente?: Fuente) {
    if (fuente) {
        fuenteActual.value = { ...fuente }
        esEdicion.value = true
    } else {
        fuenteActual.value = { nombre: '', url: '', descripcion: '', activa: true }
        esEdicion.value = false
    }
    dialogo.value = true
}

function cerrarDialogo() {
    dialogo.value = false
    fuenteActual.value = { nombre: '', url: '', descripcion: '', activa: true }
}

async function guardarFuente() {
    try {
        if (esEdicion.value) {
            const index = fuentes.value.findIndex(f => f.id === fuenteActual.value.id)
            if (index !== -1) {
                fuentes.value[index] = { ...fuenteActual.value } as Fuente
            }
        } else {
            const nuevaFuente = {
                ...fuenteActual.value,
                id: Math.floor(Math.random() * 1000)
            } as Fuente
            fuentes.value.push(nuevaFuente)
        }
        cerrarDialogo()
    } catch (error) {
        console.error('Error al guardar la fuente:', error)
    }
}

function confirmarEliminar(fuente: Fuente) {
    fuenteAEliminar.value = fuente
    dialogoConfirmacion.value = true
}

async function eliminarFuente() {
    if (!fuenteAEliminar.value) return

    try {
        fuentes.value = fuentes.value.filter(f => f.id !== fuenteAEliminar.value?.id)
    } catch (error) {
        console.error('Error al eliminar la fuente:', error)
    } finally {
        dialogoConfirmacion.value = false
        fuenteAEliminar.value = null
    }
}
</script>