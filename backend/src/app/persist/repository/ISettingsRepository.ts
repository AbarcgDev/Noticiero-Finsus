import IAConfiguration, { IAConfigurationFields } from "../../models/IAConfiguration";

export interface ISettingsRepository {
    findConfiguration(): Promise<IAConfiguration | null>;
    updateConfiguration(configuration: Omit<IAConfiguration, 'id'>): Promise<void>;
}
