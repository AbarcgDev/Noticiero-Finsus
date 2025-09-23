import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface UsuarioFields {
    username: string,
    password: string,
}

class Usuario extends Model<UsuarioFields> implements UsuarioFields {
    public id!: string;
    public username!: string;
    public password!: string;
}

Usuario.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {
    sequelize,
    modelName: 'usuario',
    timestamps: false,
})

export default Usuario;
