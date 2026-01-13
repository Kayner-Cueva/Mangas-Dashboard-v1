import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

const SourceSchema = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const sources = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(sources);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = SourceSchema.parse(req.body);
    const created = await prisma.source.create({ data });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = SourceSchema.partial().parse(req.body);
    const updated = await prisma.source.update({ where: { id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.source.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
