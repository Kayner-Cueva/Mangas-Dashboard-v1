import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.EDITOR]));

const SourceSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// EXPORT: Obtener todas las fuentes en JSON
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Preparar JSON descargable
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="fuentes_backup.json"');
    res.send(JSON.stringify(sources, null, 2));
  } catch (err) { next(err); }
});

// IMPORT: Recibir JSON array y hacer upsert
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Esperamos un array de fuentes
    const sourcesData = req.body;

    if (!Array.isArray(sourcesData)) {
      return res.status(400).json({ error: 'El formato debe ser un array JSON' });
    }

    const results = {
      total: sourcesData.length,
      created: 0,
      updated: 0,
      errors: 0
    };

    // Procesamos secuencialmente para evitar locks (aunque en Sources no suele pasar)
    for (const source of sourcesData) {
      if (!source.name || !source.baseUrl) {
        results.errors++;
        continue;
      }

      try {
        // Buscamos por nombre (que es unique)
        const existing = await prisma.source.findUnique({
          where: { name: source.name }
        });

        if (existing) {
          // Actualizamos
          await prisma.source.update({
            where: { id: existing.id },
            data: {
              baseUrl: source.baseUrl,
              description: source.description,
              isActive: source.isActive !== undefined ? source.isActive : existing.isActive
            }
          });
          results.updated++;
        } else {
          // Creamos
          await prisma.source.create({
            data: {
              name: source.name,
              baseUrl: source.baseUrl,
              description: source.description,
              isActive: source.isActive !== undefined ? source.isActive : true,
              creatorId: req.user?.id
            }
          });
          results.created++;
        }
      } catch (err) {
        console.error(`Error importing source ${source.name}:`, err);
        results.errors++;
      }
    }

    res.json({ message: 'Importación completada', ...results });
  } catch (err) { next(err); }
});

router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sources = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(sources);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = SourceSchema.parse(req.body);
    const created = await prisma.source.create({
      data: {
        ...data,
        creatorId: req.user?.id
      }
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = SourceSchema.partial().parse(req.body);
    const updated = await prisma.source.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const source = await prisma.source.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!source) return res.status(404).json({ error: 'Not found' });

    // Si es EDITOR, solo puede borrar si es el creador
    if (user?.role === Role.EDITOR && source.creatorId !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta fuente' });
    }

    await prisma.source.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
