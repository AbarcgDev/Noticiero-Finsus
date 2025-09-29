import Usuario, { UsuarioFields } from "../models/Usuario.js";
import { IUsuarioRepository } from "./repository/IUsuarioRepository.js";

export class UsuariosMySqlRepository implements IUsuarioRepository {
    async findAll(): Promise<Usuario[]> {
        return Usuario.findAll({ order: [['username', 'ASC']] });
    }

    async findByName(id: string): Promise<Usuario | null> {
        return Usuario.findByPk(id);
    }

    async create(usuarioData: UsuarioFields): Promise<Usuario> {
        try {
            const usuario = await Usuario.create(usuarioData);
            return usuario;
        } catch (error) {
            console.error("Error creating usuario:", error);
            throw error;
        }
    }

    async update(id: string, usuarioData: Partial<UsuarioFields>): Promise<Usuario | null> {
        try {
            const usuario = await Usuario.update(usuarioData, { where: { username: id } });
            return Usuario.findByPk(id);
        } catch (error) {
            console.error("Error updating usuario:", error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedRowsCount = await Usuario.destroy({ where: { username: id } });
            return deletedRowsCount > 0;
        } catch (error) {
            console.error("Error deleting usuario:", error);
            throw error;
        }
    }

    async count(): Promise<number> {
        try {
            return await Usuario.count();
        } catch (error) {
            console.error("Error counting usuarios:", error);
            throw error;
        }
    }
}