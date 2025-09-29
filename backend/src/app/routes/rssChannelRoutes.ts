import { Router } from 'express';
import { RssChannelController } from '../controllers/RssChannelController.js';

const router = Router();
const rssChannelController = new RssChannelController();

// GET /api/rss-channels - Obtener todos los canales
router.get('/', (req, res) => rssChannelController.getAllChannels(req, res));

// GET /api/rss-channels/:id - Obtener canal por ID
router.get('/:id', (req, res) => rssChannelController.getChannelById(req, res));

// POST /api/rss-channels - Crear nuevo canal
router.post('/', (req, res) => rssChannelController.createChannel(req, res));

// PUT /api/rss-channels/:id - Actualizar canal
router.put('/:id', (req, res) => rssChannelController.updateChannel(req, res));

// DELETE /api/rss-channels/:id - Eliminar canal
router.delete('/:id', (req, res) => rssChannelController.deleteChannel(req, res));

// PATCH /api/rss-channels/:id/activate - Activar canal
router.patch('/:id/activate', (req, res) => rssChannelController.activateChannel(req, res));

// PATCH /api/rss-channels/:id/deactivate - Desactivar canal
router.patch('/:id/deactivate', (req, res) => rssChannelController.deactivateChannel(req, res));

export default router;
