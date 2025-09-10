import { DataTypes, Model } from 'sequelize';
import sequelize from "../config/database.js";

export interface RSSChannelFields {
    id: string;
    name: string;
    url: string;
    isActive?: boolean;
}

class RssChannel extends Model<RSSChannelFields> implements RSSChannelFields {
    public id!: string;
    public name!: string;
    public url!: string;
    public isActive!: boolean;
}

RssChannel.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'rss-channel',
    timestamps: false,
});

export default RssChannel;