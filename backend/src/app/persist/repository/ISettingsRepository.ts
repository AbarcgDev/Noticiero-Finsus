import IAConfiguration, { IAConfigurationFields } from "../../models/IAConfiguration";

export interface ISettingsRepository {
    findConfiguration(): Promise<IAConfiguration | null>;
    updateConfiguration(configuration: Partial<IAConfigurationFields>): Promise<void>;
}
