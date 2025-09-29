import type Usuario from "../../models/Usuario.js";
import type { UsuarioFields } from "../../models/Usuario.js";

export interface IUsuarioRepository {
    findAll(): Promise<Usuario[]>;
    findByName(id: string): Promise<Usuario | null>;
    create(usuarioData: UsuarioFields): Promise<Usuario>;
    update(id: string, usuarioData: Partial<UsuarioFields>): Promise<Usuario | null>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
}