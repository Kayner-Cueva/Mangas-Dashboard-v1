import { Router } from 'express';
import { PrismaClient, MangaStatus, Role, AgeRating } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
// Las rutas GET podrían ser públicas en el futuro, pero por ahora mantenemos protección
// Para POST, PUT, DELETE permitimos ADMIN y EDITOR
router.use(authorize([Role.ADMIN, Role.EDITOR]));

const MangaSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  author: z.string().optional(),
  status: z.nativeEnum(MangaStatus).optional(),
  ageRating: z.nativeEnum(AgeRating).optional(),
  isModerated: z.boolean().optional(),
  isAdult: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  sourceId: z.string().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const { search, status, category, source, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page || '1'));
    const take = Math.min(100, Math.max(1, parseInt(limit || '20')));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (category) {
      where.categories = { some: { categoryId: category } };
    }
    if (source) {
      where.sourceId = source;
    }

    const [items, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        include: { categories: { include: { category: true } }, stats: true, source: true },
        orderBy: { updatedAt: 'desc' },
        skip, take,
      }),
      prisma.manga.count({ where }),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const manga = await prisma.manga.findUnique({
      where: { id },
      include: { categories: { include: { category: true } }, stats: true },
    });
    if (!manga) return res.status(404).json({ error: 'Not found' });
    res.json(manga);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = MangaSchema.parse(req.body) as any;
    const { categoryIds = [], ...mangaData } = data;

    const created = await prisma.manga.create({
      data: {
        title: mangaData.title,
        slug: mangaData.slug,
        description: mangaData.description,
        coverUrl: mangaData.coverUrl,
        author: mangaData.author,
        status: mangaData.status,
        ageRating: mangaData.ageRating,
        isModerated: mangaData.isModerated,
        isAdult: mangaData.isAdult,
        sourceId: mangaData.sourceId,
        categories: { create: categoryIds.map((categoryId: string) => ({ categoryId })) },
        stats: { create: {} },
      },
      include: { categories: { include: { category: true } }, stats: true },
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = MangaSchema.partial().parse(req.body) as any;
    const { categoryIds, ...mangaData } = data;

    const updated = await prisma.manga.update({
      where: { id },
      data: {
        title: mangaData.title,
        slug: mangaData.slug,
        description: mangaData.description,
        coverUrl: mangaData.coverUrl,
        author: mangaData.author,
        status: mangaData.status,
        ageRating: mangaData.ageRating,
        isModerated: mangaData.isModerated,
        isAdult: mangaData.isAdult,
        sourceId: mangaData.sourceId,
        ...(categoryIds ? {
          categories: {
            deleteMany: {},
            create: categoryIds.map((categoryId: string) => ({ categoryId })),
          },
        } : {}),
      },
      include: { categories: { include: { category: true } }, stats: true },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.manga.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
