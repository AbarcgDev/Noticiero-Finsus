import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController.js';

const router = Router();
const settingsController = new SettingsController();

router.get('/channel-name', (req, res) => settingsController.getChannelName(req, res));
router.get('/male-presenter', (req, res) => settingsController.getMalePresenter(req, res));
router.get('/female-presenter', (req, res) => settingsController.getFemalePresenter(req, res));
router.get('/censored-words', (req, res) => settingsController.getCensoredWords(req, res));
router.put('/channel-name', (req, res) => settingsController.updateChannelName(req, res));
router.put('/male-presenter', (req, res) => settingsController.updateMalePresenter(req, res));
router.put('/female-presenter', (req, res) => settingsController.updateFemalePresenter(req, res));
router.put('/censored-words', (req, res) => settingsController.updateCensoredWords(req, res));

export default router;
