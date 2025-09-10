import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Custom error class for authentication errors
class AuthenticationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper para manejar errores de manera consistente
 */
const asyncHandler = (fn: RequestHandler): RequestHandler => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Middleware para verificar el token JWT
 */
export const authenticateJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No se proporcionó token o el formato es inválido');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new AuthenticationError('Token inválido o expirado', 403);
  }
  
  req.user = decoded;
  next();
});

/**
 * Middleware para verificar roles de usuario
 */
export const checkRoles = (roles: string[] = []) => 
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Se requiere autenticación');
    }

    if (roles.length > 0 && !roles.includes(req.user.role || '')) {
      throw new AuthenticationError('Permisos insuficientes', 403);
    }

    next();
  });

// Middlewares de conveniencia
export const isAuthenticated = [authenticateJWT];
export const isAdmin = [authenticateJWT, checkRoles(['admin'])];

/**
 * Manejador de errores para Express
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Error por defecto
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
