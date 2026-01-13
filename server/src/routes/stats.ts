import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/summary', async (_req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [mangas, chapters, categories, users, recentMangas, recentChapters, views] = await Promise.all([
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.manga.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.chapter.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.stat.aggregate({ _sum: { viewsCount: true } }),
    ]);

    res.json({
      mangas,
      chapters,
      categories,
      users,
      recentMangas,
      recentChapters,
      totalViews: views._sum.viewsCount || 0
    });
  } catch (err) { next(err); }
});

router.post('/manga/:mangaId/views', async (req, res, next) => {
  try {
    const { mangaId } = req.params;
    const updated = await prisma.stat.upsert({
      where: { mangaId },
      update: { viewsCount: { increment: 1 } },
      create: { mangaId, viewsCount: 1 },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post('/manga/:mangaId/likes', async (req, res, next) => {
  try {
    const { mangaId } = req.params;
    const updated = await prisma.stat.upsert({
      where: { mangaId },
      update: { likesCount: { increment: 1 } },
      create: { mangaId, likesCount: 1 },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post('/manga/:mangaId/favorites', async (req, res, next) => {
  try {
    const { mangaId } = req.params;
    const updated = await prisma.stat.upsert({
      where: { mangaId },
      update: { favoritesCount: { increment: 1 } },
      create: { mangaId, favoritesCount: 1 },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
