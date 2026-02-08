import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.EDITOR]));

const ChapterSchema = z.object({
  number: z.coerce.number(),
  title: z.string().optional(),
  sipnosis: z.string().optional(),
  url_capitulo: z.string().url().optional(),
  releaseDate: z.string().datetime().optional(),
  pages: z.array(z.object({ pageNumber: z.number().int().positive(), imageUrl: z.string().url() })).optional(),
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '25' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const take = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * take;

    const [items, total] = await Promise.all([
      prisma.chapter.findMany({
        include: { manga: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take,
      }),
      prisma.chapter.count(),
    ]);

    res.json({ items, total, page: pageNum, pages: Math.ceil(total / take) });
  } catch (err) { next(err); }
});

router.get('/manga/:mangaId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mangaId } = req.params;
    const chapters = await prisma.chapter.findMany({
      where: { mangaId },
      orderBy: { number: 'asc' },
    });
    res.json(chapters);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { pages: { orderBy: { pageNumber: 'asc' } } },
    });
    if (!chapter) return res.status(404).json({ error: 'Not found' });
    res.json(chapter);
  } catch (err) { next(err); }
});

router.post('/manga/:mangaId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mangaId } = req.params;
    const data = ChapterSchema.parse(req.body);
    const created = await prisma.chapter.create({
      data: {
        mangaId,
        number: data.number,
        title: data.title,
        sipnosis: data.sipnosis,
        url_capitulo: data.url_capitulo,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        creatorId: req.user?.id,
        pages: { create: data.pages?.map(p => ({ pageNumber: p.pageNumber, imageUrl: p.imageUrl })) || [] },
      },
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = ChapterSchema.partial().parse(req.body);
    const updated = await prisma.chapter.update({
      where: { id },
      data: {
        number: data.number,
        title: data.title,
        sipnosis: data.sipnosis,
        url_capitulo: data.url_capitulo,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        ...(data.pages ? {
          pages: {
            deleteMany: {},
            create: data.pages.map(p => ({ pageNumber: p.pageNumber, imageUrl: p.imageUrl })),
          },
        } : {}),
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!chapter) return res.status(404).json({ error: 'Not found' });

    // Si es EDITOR, solo puede borrar si es el creador
    if (user?.role === Role.EDITOR && chapter.creatorId !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este capítulo' });
    }

    await prisma.chapter.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
