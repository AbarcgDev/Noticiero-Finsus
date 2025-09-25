import { ConfigurationService } from "../services/configurationService";
import { Request, Response } from "express";
import HttpStatus from "http-status-codes";

export class SettingsController {
    private settingsService: ConfigurationService;
    constructor() {
        this.settingsService = new ConfigurationService();
    }
    async getChannelName(req: Request, res: Response): Promise<void> {
        const channelName = await this.settingsService.getChannelName();
        if (!channelName) {
            res.status(HttpStatus.NOT_FOUND).json({
                message: 'Channel name not found'
            });
            return;
        }
        res.status(HttpStatus.OK).json({
            channelName
        });
    }
    async getMalePresenter(req: Request, res: Response): Promise<void> {
        const malePresenter = await this.settingsService.getMalePresenter();
        if (!malePresenter) {
            res.status(HttpStatus.NOT_FOUND).json({
                message: "Male presenter not found"
            })
        }
        res.status(HttpStatus.OK).json({
            malePresenter
        })
    }
    async getFemalePresenter(req: Request, res: Response): Promise<void> {
        const femalePresenter = await this.settingsService.getFemalePresenter();
        if (!femalePresenter) {
            res.status(HttpStatus.NOT_FOUND).json({
                message: "Female presenter not found"
            })
        }
        res.status(HttpStatus.OK).json({
            femalePresenter
        })
    }
    async getCensoredWords(req: Request, res: Response): Promise<void> {
        const censoredWords = await this.settingsService.getCensoredWords();
        if (!censoredWords) {
            res.status(HttpStatus.NOT_FOUND).json({
                message: "Censored words not found"
            })
        }
        res.status(HttpStatus.OK).json({
            censoredWords
        })
    }
    async updateChannelName(req: Request, res: Response): Promise<void> {
        const { channelName } = req.body;
        if (!channelName) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Channel name is required'
            });
            return;
        }
        try {
            await this.settingsService.updateChannelName(channelName);
            res.status(HttpStatus.OK).json({
                channelName
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error updating channel name'
            });
        }
    }
    async updateMalePresenter(req: Request, res: Response): Promise<void> {
        const { malePresenter } = req.body;
        if (!malePresenter) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Male presenter is required'
            });
            return;
        }
        try {
            await this.settingsService.updateMalePresenter(malePresenter);
            res.status(HttpStatus.OK).json({
                malePresenter
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error updating male presenter'
            });
        }
    }
    async updateFemalePresenter(req: Request, res: Response): Promise<void> {
        const { femalePresenter } = req.body;
        if (!femalePresenter) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Female presenter is required'
            });
            return;
        }
        try {
            await this.settingsService.updateFemalePresenter(femalePresenter);
            res.status(HttpStatus.OK).json({
                femalePresenter
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error updating female presenter'
            });
        }
    }
    async updateCensoredWords(req: Request, res: Response): Promise<void> {
        const { censoredWords } = req.body;
        if (!censoredWords) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: 'Censored words is required'
            });
            return;
        }
        try {
            await this.settingsService.updateCensoredWords(censoredWords);
            res.status(HttpStatus.OK).json({
                censoredWords
            })
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error updating censored words'
            });
        }
    }
}
