import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.EDITOR]));

const CategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

// EXPORT: Obtener todas las categorías
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="categorias_backup.json"');
    res.send(JSON.stringify(categories, null, 2));
  } catch (err) { next(err); }
});

// IMPORT: Recibir JSON array y hacer upsert
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categoriesData = req.body;

    if (!Array.isArray(categoriesData)) {
      return res.status(400).json({ error: 'El formato debe ser un array JSON' });
    }

    const results = {
      total: categoriesData.length,
      created: 0,
      updated: 0,
      errors: 0
    };

    for (const category of categoriesData) {
      if (!category.name || !category.slug) {
        results.errors++;
        continue;
      }

      try {
        // Buscamos por slug (que es unique)
        const existing = await prisma.category.findUnique({
          where: { slug: category.slug }
        });

        if (existing) {
          // Actualizar (en este caso solo nombre si fuera necesario, pero el slug es lo que manda)
          await prisma.category.update({
            where: { id: existing.id },
            data: {
              name: category.name
            }
          });
          results.updated++;
        } else {
          // Crear
          await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              creatorId: req.user?.id
            }
          });
          results.created++;
        }
      } catch (err) {
        console.error(`Error importing category ${category.slug}:`, err);
        results.errors++;
      }
    }

    res.json({ message: 'Importación completada', ...results });
  } catch (err) { next(err); }
});

router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = CategorySchema.parse(req.body);
    const created = await prisma.category.create({
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
    const data = CategorySchema.partial().parse(req.body);
    const updated = await prisma.category.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const category = await prisma.category.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!category) return res.status(404).json({ error: 'Not found' });

    // Si es EDITOR, solo puede borrar si es el creador
    if (user?.role === Role.EDITOR && category.creatorId !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta categoría' });
    }

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
