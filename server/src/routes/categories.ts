import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

const CategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = CategorySchema.parse(req.body);
    const created = await prisma.category.create({ data });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = CategorySchema.partial().parse(req.body);
    const updated = await prisma.category.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
