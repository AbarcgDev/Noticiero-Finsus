import api from '../services/api';

export interface Noticiero {
  id?: string;
  title: string;
  guion: string;
  state: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  publicationDate: string;
  fechaCreacion?: string;
}

/**
 * Obtiene todos los noticieros
 * @returns Promise con el array de noticieros
 */
export const getNoticieros = async (): Promise<Noticiero[]> => {
  try {
    const response = await api.get(`/noticieros`);
    // Backend responde { success: boolean, data: Noticiero[] }
    return response.data?.data ?? [];
  } catch (error) {
    console.error('Error al obtener los noticieros:', error);
    throw error;
  }
};

/**
 * Obtiene un noticiero por su ID
 * @param id ID del noticiero
 * @returns Promise con el noticiero
 */
export const getNoticieroById = async (id: string): Promise<Noticiero> => {
  try {
    const response = await api.get(`/noticieros/${id}`);
    // Backend responde { success: boolean, data: Noticiero }
    return response.data?.data as Noticiero;
  } catch (error) {
    console.error(`Error al obtener el noticiero con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo noticiero
 * @param noticiero Datos del noticiero a crear
 * @returns Promise con el noticiero creado
 */
export const createNoticiero = async (noticiero: Omit<Noticiero, 'id'>): Promise<Noticiero> => {
  try {
    const response = await api.post(`/noticieros`, noticiero);
    // Backend responde { success: boolean, data: Noticiero }
    return response.data?.data as Noticiero;
  } catch (error) {
    console.error('Error al crear el noticiero:', error);
    throw error;
  }
};

/**
 * Actualiza un noticiero existente
 * @param id ID del noticiero a actualizar
 * @param noticiero Datos actualizados del noticiero
 * @returns Promise con el noticiero actualizado
 */
export const updateNoticiero = async (id: string, noticiero: Partial<Noticiero>): Promise<Noticiero> => {
  try {
    const response = await api.put(`/noticieros/${id}`, noticiero);
    // Backend responde { success: boolean, data: Noticiero }
    return response.data?.data as Noticiero;
  } catch (error) {
    console.error(`Error al actualizar el noticiero con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un noticiero
 * @param id ID del noticiero a eliminar
 * @returns Promise vacío
 */
export const deleteNoticiero = async (id: string): Promise<void> => {
  try {
    await api.delete(`/noticieros/${id}`);
  } catch (error) {
    console.error(`Error al eliminar el noticiero con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Publica un noticiero
 * @param id ID del noticiero a publicar
 * @returns Promise con el noticiero actualizado
 */
export const publicarNoticiero = async (id: string): Promise<Noticiero> => {
  try {
    const response = await api.patch(
      `/noticieros/${id}/publish`
    );
    // Backend responde { success: boolean, message: string } actualmente.
    // Para consistencia, volvemos a consultar el noticiero actualizado.
    try {
      const refreshed = await getNoticieroById(id);
      return refreshed;
    } catch {
      // Si falla el refetch, retornamos lo que haya en data.data si existiera, o un objeto mínimo
      return (response.data?.data as Noticiero) ?? ({ id, state: 'PUBLISHED' } as Noticiero);
    }
  } catch (error) {
    console.error(`Error al publicar el noticiero con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Rechaza un noticiero
 * @param id ID del noticiero a rechazar
 * @returns Promise con el noticiero actualizado
 */
export const rechazarNoticiero = async (id: string): Promise<Noticiero> => {
  try {
    const response = await api.patch(
      `/noticieros/${id}/reject`
    );
    // Backend responde { success: boolean, message: string } actualmente.
    // Para consistencia, volvemos a consultar el noticiero actualizado.
    try {
      const refreshed = await getNoticieroById(id);
      return refreshed;
    } catch {
      return (response.data?.data as Noticiero) ?? ({ id, state: 'REJECTED' } as Noticiero);
    }
  } catch (error) {
    console.error(`Error al rechazar el noticiero con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene los noticieros por estado
 * @param state Estado de los noticieros a obtener
 * @returns Promise con el array de noticieros filtrados por estado
 */
export const getNoticierosByState = async (state: Noticiero['state']): Promise<Noticiero[]> => {
  try {
    const response = await api.get(`/noticieros/estado/${state}`);
    // Backend responde { success: boolean, data: Noticiero[] }
    return response.data?.data ?? [];
  } catch (error) {
    console.error(`Error al obtener los noticieros con estado ${state}:`, error);
    throw error;
  }
};
