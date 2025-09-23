import Usuario, { UsuarioFields } from "../models/Usuario.js";
import { IUsuarioRepository } from "../persist/repository/IUsuarioRepository.js";
import { UsuariosMySqlRepository } from "../persist/usuariosMySqlRepository.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export interface UsuarioLogin {
    username: string;
    jwt: string;
}

export class UsuarioService {
    private usuarioRepository: IUsuarioRepository;
    constructor() {
        this.usuarioRepository = new UsuariosMySqlRepository();
    }

    async getAllUsuarios(): Promise<Usuario[]> {
        return this.usuarioRepository.findAll();
    }

    async registerUsuario(usuarioData: Omit<UsuarioFields, "id">): Promise<Usuario> {
        try {
            const existingUser = await this.usuarioRepository.findByName(usuarioData.username);
            if (existingUser) {
                throw new Error("User already exists");
            }
            const hashedPass = await bcrypt.hash(usuarioData.password, SALT_ROUNDS);
            const fields = {
                username: usuarioData.username,
                password: hashedPass,
            }
            return this.usuarioRepository.create(fields);
        } catch (error) {
            console.error("Error creating usuario:", error);
            throw error;
        }
    }

    async loginUsuario(usuarioData: UsuarioFields): Promise<UsuarioLogin | null> {
        try {
            const usuario = await this.usuarioRepository.findByName(usuarioData.username);
            if (!usuario) {
                throw new Error("User not found");
            }
            const validPassword = await bcrypt.compare(usuarioData.password, usuario.password);
            if (!validPassword) {
                throw new Error("Invalid password");
            }
            const jwt = this.generateJWT(usuario);
            return { username: usuario.username, jwt };
        } catch (error) {
            console.error("Error logging in usuario:", error);
            throw error;
        }
    }

    private generateJWT(usuario: Usuario): string {
        const payload = {
            username: usuario.username,
            role: 'admin',
        };
        return generateToken(payload);
    }
}
