import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController.js";

const router = Router();
const usuarioController = new UsuarioController();

router.post("/", (req, res) => usuarioController.loginUsuario(req, res));

router.post("/register", (req, res) => usuarioController.registerUsuario(req, res));

export default router;