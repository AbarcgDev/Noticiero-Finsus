import { ISettingsRepository } from "../persist/repository/ISettingsRepository";
import { SettingsMySqlRepository } from "../persist/settingsMySqlRepository";

export class ConfigurationService {
    private settingsRepository: ISettingsRepository;
    constructor() {
        this.settingsRepository = new SettingsMySqlRepository();
    }
    async getChannelName(): Promise<string | null> {
        const settings = await this.settingsRepository.findConfiguration();
        if (!settings) return null;
        return settings.channelName;
    }
    async getMalePresenter(): Promise<string | null> {
        const settings = await this.settingsRepository.findConfiguration();
        if (!settings) return null;
        return settings.malePresenter;
    }
    async getFemalePresenter(): Promise<string | null> {
        const settings = await this.settingsRepository.findConfiguration();
        if (!settings) return null;
        return settings.femalePresenter;
    }
    async getCensoredWords(): Promise<string[] | null> {
        const settings = await this.settingsRepository.findConfiguration();
        if (!settings) return null;
        return settings.censoredWords;
    }
    async updateChannelName(channelName: string): Promise<void> {
        const current = await this.settingsRepository.findConfiguration();
        if (!current) throw new Error('No se encontro la configuracion');
        await this.settingsRepository.updateConfiguration({ channelName });
    }
    async updateMalePresenter(malePresenter: string): Promise<void> {
        const current = await this.settingsRepository.findConfiguration();
        if (!current) throw new Error('No se encontro la configuracion');
        await this.settingsRepository.updateConfiguration({ malePresenter });
    }
    async updateFemalePresenter(femalePresenter: string): Promise<void> {
        const current = await this.settingsRepository.findConfiguration();
        if (!current) throw new Error('No se encontro la configuracion');
        await this.settingsRepository.updateConfiguration({ femalePresenter });
    }
    async updateCensoredWords(censoredWords: string[]): Promise<void> {
        const current = await this.settingsRepository.findConfiguration();
        if (!current) throw new Error('No se encontro la configuracion');
        await this.settingsRepository.updateConfiguration({ censoredWords });
    }
}