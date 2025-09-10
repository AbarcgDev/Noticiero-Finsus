import { NoticieroController } from "../controllers/NoticieroController";
import { Router } from "express";

const router = Router();
const noticieroController = new NoticieroController();

router.post("/", (req, res) => noticieroController.createNoticieroDraft(req, res));

router.get("/", (req, res) => noticieroController.getAllNoticieros(req, res));

router.get("/:id", (req, res) => noticieroController.getNoticieroById(req, res));

router.put("/:id", (req, res) => noticieroController.updateNoticiero(req, res));

router.delete("/:id", (req, res) => noticieroController.deleteNoticiero(req, res));

router.patch("/:id/publish", (req, res) => noticieroController.publishNoticiero(req, res));

router.patch("/:id/reject", (req, res) => noticieroController.rejectNoticiero(req, res));

// Audio endpoints
router.get("/latest/audio", (req, res) => noticieroController.getLatestNoticieroAudio(req, res));
router.get("/:id/audio", (req, res) => noticieroController.getNoticieroAudioById(req, res));

export default router;