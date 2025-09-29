import { ISettingsRepository } from "./repository/ISettingsRepository";
import IAConfiguration, { IAConfigurationFields } from "../models/IAConfiguration";

export class SettingsMySqlRepository implements ISettingsRepository {
    async findConfiguration(): Promise<IAConfiguration | null> {
        return await IAConfiguration.findOne({ where: { id: 1 } });
    }
    async updateConfiguration(configuration: Partial<IAConfigurationFields>): Promise<void> {
        const result = await IAConfiguration.update(configuration, { where: { id: 1 } });
        if (result[0] === 0) {
            throw new Error('No se encontro la configuracion');
        }
    }
}
