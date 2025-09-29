import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface IAConfigurationFields {
    id: number;
    channelName: string;
    malePresenter: string;
    femalePresenter: string;
    censoredWords: string[];
}

export class IAConfiguration extends Model<IAConfigurationFields> {
    public id!: number;
    public channelName!: string;
    public malePresenter!: string;
    public femalePresenter!: string;
    public censoredWords!: string[];
}

IAConfiguration.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    channelName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'channel_name',
    },
    malePresenter: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'male_presenter',
    },
    femalePresenter: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'female_presenter',
    },
    censoredWords: {
        type: DataTypes.JSON,
        allowNull: false,
        field: 'censored_words',
    },
}, {
    sequelize,
    modelName: 'IAConfiguration',
    tableName: 'ia_settings',
    timestamps: false
});

export default IAConfiguration;