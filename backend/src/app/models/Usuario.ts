import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

export interface UsuarioFields {
    username: string,
    password: string,
    role?: 'admin' | 'user',
}

class Usuario extends Model<UsuarioFields> implements UsuarioFields {
    public id!: string;
    public username!: string;
    public password!: string;
    public role!: 'admin' | 'user';
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
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
    },
}, {
    sequelize,
    modelName: 'usuario',
    timestamps: false,
})

export default Usuario;
