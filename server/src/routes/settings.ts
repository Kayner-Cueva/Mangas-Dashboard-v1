import { Router, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Zod schema para actualizar ajustes
const UpdateSettingsSchema = z.object({
    maintenanceMode: z.boolean().optional(),
    allowRegistration: z.boolean().optional(),
    announcement: z.string().nullable().optional(),
});

// Obtener configuración global
router.get('/', authenticate, authorize([Role.ADMIN, Role.EDITOR]), async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let settings = await prisma.globalSettings.findUnique({
            where: { id: 'system_config' }
        });

        if (!settings) {
            // Inicializar si no existe
            settings = await prisma.globalSettings.create({
                data: { id: 'system_config' }
            });
        }

        res.json(settings);
    } catch (err) { next(err); }
});

// Actualizar configuración global
router.patch('/', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const data = UpdateSettingsSchema.parse(req.body);

        const settings = await prisma.globalSettings.upsert({
            where: { id: 'system_config' },
            update: data,
            create: {
                id: 'system_config',
                ...data
            }
        });

        res.json(settings);
    } catch (err) { next(err); }
});

export default router;
