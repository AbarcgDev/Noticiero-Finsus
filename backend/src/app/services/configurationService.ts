import { ISettingsRepository } from "../persist/repository/ISettingsRepository";
import { SettingsMySqlRepository } from "../persist/settingsMySqlRepository";

export class ConfigurationService {
    private settingsRepository: ISettingsRepository;
    constructor() {
        this.settingsRepository = new SettingsMySqlRepository();
    }
    async getChannelName(): Promise<string> {
        const settings = await this.settingsRepository.findConfiguration();
        return settings.channelName;
    }
    async getMalePresenter(): Promise<string> {
        const settings = await this.settingsRepository.findConfiguration();
        return settings.malePresenter;
    }
    async getFemalePresenter(): Promise<string> {
        const settings = await this.settingsRepository.findConfiguration();
        return settings.femalePresenter;
    }
    async getCensoredWords(): Promise<string[]> {
        const settings = await this.settingsRepository.findConfiguration();
        return settings.censoredWords;
    }
    async updateChannelName(channelName: string): Promise<void> {
        const result = await this.settingsRepository.findConfiguration();
        result.channelName = channelName;
        await this.settingsRepository.updateConfiguration(result);
        if (result[0] === 0) {
            throw new Error('No se encontro la configuracion');
        }
    }
    async updateMalePresenter(malePresenter: string): Promise<void> {
        const result = await this.settingsRepository.findConfiguration();
        result.malePresenter = malePresenter;
        await this.settingsRepository.updateConfiguration(result);
        if (result[0] === 0) {
            throw new Error('No se encontro la configuracion');
        }
    }
    async updateFemalePresenter(femalePresenter: string): Promise<void> {
        const result = await this.settingsRepository.findConfiguration();
        result.femalePresenter = femalePresenter;
        await this.settingsRepository.updateConfiguration(result);
        if (result[0] === 0) {
            throw new Error('No se encontro la configuracion');
        }
    }
    async updateCensoredWords(censoredWords: string[]): Promise<void> {
        const result = await this.settingsRepository.findConfiguration();
        result.censoredWords = censoredWords;
        await this.settingsRepository.updateConfiguration(result);
        if (result[0] === 0) {
            throw new Error('No se encontro la configuracion');
        }
    }
}