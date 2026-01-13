import { Router } from 'express';
import { PrismaClient, RequestStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

const DeletionRequestSchema = z.object({
    reason: z.string().optional(),
});

// Endpoint público (o autenticado por el usuario) para solicitar eliminación
router.post('/me/delete-request', authenticate, async (req: any, res, next) => {
    try {
        const { reason } = DeletionRequestSchema.parse(req.body);
        const request = await prisma.userDeletionRequest.create({
            data: {
                userId: req.user.id,
                reason,
            }
        });
        res.status(201).json(request);
    } catch (err) { next(err); }
});

// Endpoint administrativo para ver solicitudes
router.get('/deletion-requests', authenticate, authorize([Role.ADMIN]), async (_req, res, next) => {
    try {
        const requests = await prisma.userDeletionRequest.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (err) { next(err); }
});

// --- NUEVAS RUTAS ADMINISTRATIVAS ---

// Listar todos los usuarios
router.get('/', authenticate, authorize([Role.ADMIN]), async (_req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) { next(err); }
});

// Cambiar rol de usuario
router.patch('/:id/role', authenticate, authorize([Role.ADMIN]), async (req, res, next) => {
    try {
        const { role } = z.object({ role: z.nativeEnum(Role) }).parse(req.body);
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: { id: true, email: true, role: true }
        });
        res.json(user);
    } catch (err) { next(err); }
});

// Cambiar estado de usuario (activar/desactivar)
router.patch('/:id/status', authenticate, authorize([Role.ADMIN]), async (req, res, next) => {
    try {
        const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: { isActive },
            select: { id: true, email: true, isActive: true }
        });
        res.json(user);
    } catch (err) { next(err); }
});

export default router;
