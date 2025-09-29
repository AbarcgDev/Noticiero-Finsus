import { NoticieroController } from "../controllers/NoticieroController";
import { Router } from "express";
const router = Router();

const noticieroController = new NoticieroController();

router.get("/noticieros/latest", (req, res) => noticieroController.getLatestNoticiero(req, res));
router.get("/noticieros/:id", (req, res) => noticieroController.getNoticieroById(req, res));
router.get("/noticieros/latest/audio", (req, res) => noticieroController.getLatestNoticieroAudio(req, res));
router.get("/noticieros/:id/audio", (req, res) => noticieroController.getNoticieroAudioById(req, res));


export default router;