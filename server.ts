import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rssChannelRoutes from './src/app/routes/rssChannelRoutes';
import noticierosRoutes from './src/app/routes/noticierosRoutes';
import { authenticateJWT, errorHandler } from './src/app/middlewares/authMiddleware';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['JWT_SECRET', 'GEMINI_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_REGION'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error(`Error: Faltan las siguientes variables de entorno requeridas: ${missingVars.join(', ')}`);
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Noticiero Finsus API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            rssChannels: '/api/rss-channels',
            noticieros: '/api/noticieros'
        }
    });
});


const authOn = process.env.JWT_AUTH_ON === "true" ? true : false

// Aplicar autenticación por JWT si está habilitada
if (authOn) {
    // Ejemplo protegiendo todas las rutas, se puede hacer a nivel de ruta y/o controlador
    app.use('/api/rss-channels', authenticateJWT, rssChannelRoutes);
    app.use('/api/noticieros', authenticateJWT, noticierosRoutes);
} else {
    // Si no está habilitada la autenticación por JWT, se deja sin protección
    app.use('/api/rss-channels', rssChannelRoutes);
    app.use('/api/noticieros', noticierosRoutes);
}

// Manejo de errores (debe ir después de las rutas)
app.use(errorHandler);

// Manejador para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Manejadores para cierre limpio del servidor
process.on('SIGTERM', () => {
    console.log('Recibida señal SIGTERM. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Cerrar el servidor y salir
    server.close(() => process.exit(1));
});