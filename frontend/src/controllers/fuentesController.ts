import axios from 'axios';

export interface Fuente {
  id?: string;
  nombre: string;
  url: string;
  descripcion: string;
  activa: boolean;
  ultimaActualizacion?: string;
}

// Usa '/api' por defecto si la variable de entorno no fue inyectada en build
const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

// Normaliza posibles respuestas del backend (array directo o envuelto en { data })
function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.data)) return data.data as T[];
  return [] as T[];
}

// Mapeo de backend -> frontend
function mapFromApi(api: any): Fuente {
  return {
    id: api.id,
    nombre: api.name ?? api.nombre ?? '',
    url: api.url ?? '',
    descripcion: api.description ?? api.descripcion ?? '',
    activa: api.isActive ?? api.activa ?? false,
    ultimaActualizacion: api.updatedAt ?? api.ultimaActualizacion,
  };
}

// Mapeo de frontend -> backend
function mapToApi(fuente: Partial<Fuente>): any {
  return {
    name: fuente.nombre,
    url: fuente.url,
    isActive: fuente.activa,
    description: fuente.descripcion,
  };
}

/**
 * Obtiene todas las fuentes
 * @returns Promise con el array de fuentes
 */
export const getFuentes = async (): Promise<Fuente[]> => {
  try {
    const response = await axios.get(`${API_URL}/rss-channels`);
    const arr = normalizeArray<any>(response.data);
    return arr.map(mapFromApi);
  } catch (error) {
    console.error('Error al obtener las fuentes:', error);
    throw error;
  }
};

/**
 * Crea una nueva fuente
 * @param fuente Datos de la fuente a crear
 * @returns Promise con la fuente creada
 */
export const createFuente = async (fuente: Omit<Fuente, 'id'>): Promise<Fuente> => {
  try {
    const payload = mapToApi(fuente);
    const response = await axios.post(`${API_URL}/rss-channels`, payload);
    return mapFromApi(response.data);
  } catch (error) {
    console.error('Error al crear la fuente:', error);
    throw error;
  }
};

/**
 * Actualiza una fuente existente
 * @param id ID de la fuente a actualizar
 * @param fuente Datos actualizados de la fuente
 * @returns Promise con la fuente actualizada
 */
export const updateFuente = async (id: string, fuente: Partial<Fuente>): Promise<Fuente> => {
  try {
    const payload = mapToApi(fuente);
    const response = await axios.put(`${API_URL}/rss-channels/${id}`, payload);
    return mapFromApi(response.data);
  } catch (error) {
    console.error(`Error al actualizar la fuente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una fuente
 * @param id ID de la fuente a eliminar
 * @returns Promise vacío
 */
export const deleteFuente = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/rss-channels/${id}`);
  } catch (error) {
    console.error(`Error al eliminar la fuente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Actualiza el estado de una fuente (activa/inactiva)
 * @param id ID de la fuente
 * @param activa Nuevo estado
 * @returns Promise con la fuente actualizada
 */
export const toggleFuenteEstado = async (id: string, activa: boolean): Promise<Fuente> => {
  try {
    const response = await axios.patch(`${API_URL}/rss-channels/${id}/estado`, { isActive: activa });
    return mapFromApi(response.data);
  } catch (error) {
    console.error(`Error al actualizar el estado de la fuente con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Sincroniza manualmente una fuente
 * @param id ID de la fuente a sincronizar
 * @returns Promise con el resultado de la sincronización
 */
export const sincronizarFuente = async (id: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/rss-channels/${id}/sincronizar`);
    return response.data;
  } catch (error) {
    console.error(`Error al sincronizar la fuente con ID ${id}:`, error);
    throw error;
  }
};
