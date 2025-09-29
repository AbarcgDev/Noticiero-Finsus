import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface NoticieroFields {
    id: string,
    title: string,
    guion: string,
    state: NoticieroState,
    publicationDate: Date,
}

export enum NoticieroState {
    PENDING = 'PENDING',
    PUBLISHED = 'PUBLISHED',
    REJECTED = 'REJECTED',
}

class Noticiero extends Model<NoticieroFields> implements NoticieroFields {
    public id!: string;
    public title!: string;
    public guion!: string;
    public state!: NoticieroState;
    public publicationDate!: Date;
}

Noticiero.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    state: {
        type: DataTypes.ENUM('PENDING', 'PUBLISHED', 'REJECTED'),
        allowNull: false,
    },
    publicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'noticiero',
    timestamps: false,
})

export default Noticiero;