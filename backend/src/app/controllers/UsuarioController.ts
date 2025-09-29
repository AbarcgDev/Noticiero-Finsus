import { Request, Response } from "express";
import HttpStatus from "http-status-codes";
import { UsuarioService } from "../services/usuarioService.js";
import { UsuarioFields } from "../models/Usuario.js";

export class UsuarioController {
    private usuarioService: UsuarioService;
    constructor() {
        this.usuarioService = new UsuarioService();
    }

    async loginUsuario(req: Request, res: Response): Promise<void> {
        const reqBody: UsuarioFields = await req.body;
        if (!reqBody.username || !reqBody.password) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }
        const user = await this.usuarioService.loginUsuario(reqBody);
        res.status(HttpStatus.OK).json({
            success: true,
            data: user
        });
    }

    async registerUsuario(req: Request, res: Response): Promise<void> {
        const fields: UsuarioFields = req.body;
        if (!fields.username || !fields.password) {
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }
        await this.usuarioService.registerUsuario(fields);
        res.status(HttpStatus.OK).json({
            success: true,
        });
    }
}
