import { Sequelize } from 'sequelize';

// Opciones de conexión
const db = new Sequelize(
    process.env.DB_NAME || 'testingDB',
    process.env.DB_USER || 'abargdev',
    process.env.DB_PASSWORD || 'abargdev',
    {
        host: process.env.DB_HOST || 'mysql',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: console.log,
    }
);

export default db;