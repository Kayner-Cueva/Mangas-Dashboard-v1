import { Router, Response, NextFunction } from 'express';
import { PrismaClient, MangaStatus, Role, AgeRating } from '@prisma/client';
import { z } from 'zod';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

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
  author: z.string().optional().nullable(),
  status: z.nativeEnum(MangaStatus).optional(),
  ageRating: z.nativeEnum(AgeRating).optional(),
  isModerated: z.boolean().optional(),
  isAdult: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  sourceId: z.string().optional(),
}).passthrough();

router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { format = 'json' } = req.query;

    const mangas = await prisma.manga.findMany({
      include: {
        source: true,
        categories: { include: { category: true } },
        stats: true,
        chapters: {
          include: { pages: true },
          orderBy: { number: 'asc' }
        },
        interactions: true,
        ratings: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="mangas_backup.json"');
      return res.send(JSON.stringify(mangas, null, 2));
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mangas_backup.csv"');

      const header = ['id', 'title', 'slug', 'author', 'status', 'ageRating', 'source', 'chapters_count'].join(',');
      const rows = mangas.map(m => [
        `"${m.id}"`,
        `"${m.title.replace(/"/g, '""')}"`,
        `"${m.slug}"`,
        `"${(m.author || '').replace(/"/g, '""')}"`,
        `"${m.status}"`,
        `"${m.ageRating}"`,
        `"${(m.source?.name || '').replace(/"/g, '""')}"`,
        m.chapters.length
      ].join(','));

      return res.send([header, ...rows].join('\n'));
    }

    // Fallback or future formats
    return res.status(400).json({ error: 'Format not supported yet' });
  } catch (err) {
    next(err);
  }
});

// IMPORT: Recibir JSON array y hacer upsert inteligente
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mangasData = req.body;

    if (!Array.isArray(mangasData)) {
      return res.status(400).json({ error: 'El formato debe ser un array JSON' });
    }

    const results = {
      total: mangasData.length,
      created: 0,
      updated: 0,
      errors: 0
    };

    // Procesamos secuencialmente
    for (const m of mangasData) {
      if (!m.slug || !m.title) {
        results.errors++;
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          // 1. Resolver Fuente (Source)
          let sourceConnect;
          if (m.source && m.source.name) {
            const src = await tx.source.findUnique({ where: { name: m.source.name } });
            if (src) {
              sourceConnect = { connect: { id: src.id } };
            } else {
              // Si no existe, la creamos para no perder el dato
              sourceConnect = {
                create: {
                  name: m.source.name,
                  baseUrl: m.source.baseUrl || 'https://unknown',
                  creatorId: req.user?.id
                }
              };
            }
          }

          // 2. Resolver Categorías
          // Limpiamos relaciones anteriores si es un update pesado o solo agregamos?
          // Para importación segura, usamos connectOrCreate una por una
          const categoryConnects: any[] = [];
          if (m.categories && Array.isArray(m.categories)) {
            for (const catWrapper of m.categories) {
              const cat = catWrapper.category || catWrapper; // Handle both structure types
              if (cat.slug) {
                categoryConnects.push({
                  where: { slug: cat.slug },
                  create: { name: cat.name || cat.slug, slug: cat.slug, creatorId: req.user?.id }
                });
              }
            }
          }

          // 3. Upsert Manga
          const mangaData = {
            title: m.title,
            description: m.description,
            coverUrl: m.coverUrl,
            author: m.author,
            status: m.status,
            ageRating: m.ageRating || 'EVERYONE',
            isModerated: m.isModerated,
            isAdult: m.isAdult,
            source: sourceConnect,
            creatorId: req.user?.id // Set creator to importer if new
          };

          // Separate data for update (exclude creatorId to preserve original owner if exists)
          const { creatorId, ...updateData } = mangaData;

          const upsertedManga = await tx.manga.upsert({
            where: { slug: m.slug },
            update: updateData,
            create: {
              title: m.title,
              slug: m.slug,
              description: m.description,
              coverUrl: m.coverUrl,
              author: m.author,
              status: m.status,
              ageRating: m.ageRating || 'EVERYONE',
              isModerated: m.isModerated,
              isAdult: m.isAdult,
              source: sourceConnect,
              creator: req.user?.id ? { connect: { id: req.user.id } } : undefined,
              stats: {
                create: {
                  viewsCount: m.stats?.viewsCount || 0,
                  likesCount: m.stats?.likesCount || 0,
                  favoritesCount: m.stats?.favoritesCount || 0
                }
              }
            }
          });

          // Fix Categories separately to be safe
          if (categoryConnects.length > 0) {
            // Ensure categories exist
            const catIds = [];
            for (const catConnect of categoryConnects) {
              const c = await tx.category.upsert(catConnect);
              catIds.push(c.id);
            }

            // Sync MangaCategory
            // First delete old ones? Or just ignore duplicates?
            // To match "Sync" behavior, we might want to wipe and set.
            await tx.mangaCategory.deleteMany({ where: { mangaId: upsertedManga.id } });
            await tx.mangaCategory.createMany({
              data: catIds.map(cid => ({ mangaId: upsertedManga.id, categoryId: cid })),
              skipDuplicates: true
            });
          }

          // 4. Upsert Chapters
          if (m.chapters && Array.isArray(m.chapters)) {
            for (const chap of m.chapters) {
              // Try to find chapter by number for this manga
              const existingChap = await tx.chapter.findFirst({
                where: { mangaId: upsertedManga.id, number: chap.number }
              });

              let upsertedChap;
              if (existingChap) {
                upsertedChap = await tx.chapter.update({
                  where: { id: existingChap.id },
                  data: {
                    title: chap.title,
                    sipnosis: chap.sipnosis,
                    url_capitulo: chap.url_capitulo,
                    releaseDate: chap.releaseDate ? new Date(chap.releaseDate) : undefined
                  }
                });
              } else {
                upsertedChap = await tx.chapter.create({
                  data: {
                    mangaId: upsertedManga.id,
                    number: chap.number,
                    title: chap.title,
                    sipnosis: chap.sipnosis,
                    url_capitulo: chap.url_capitulo,
                    releaseDate: chap.releaseDate ? new Date(chap.releaseDate) : undefined,
                    creatorId: req.user?.id
                  }
                });
              }

              // Handle Pages for this chapter
              if (chap.pages && Array.isArray(chap.pages)) {
                // To keep it simple and clean, we replace all pages
                await tx.chapterPage.deleteMany({ where: { chapterId: upsertedChap.id } });
                await tx.chapterPage.createMany({
                  data: chap.pages.map((p: any, idx: number) => ({
                    chapterId: upsertedChap.id,
                    pageNumber: p.pageNumber || (idx + 1),
                    imageUrl: p.imageUrl
                  }))
                });
              }
            }
          }

          // 5. Stats
          if (m.stats) {
            await tx.stat.upsert({
              where: { mangaId: upsertedManga.id },
              update: {
                viewsCount: m.stats.viewsCount,
                likesCount: m.stats.likesCount,
                favoritesCount: m.stats.favoritesCount
              },
              create: {
                mangaId: upsertedManga.id,
                viewsCount: m.stats.viewsCount || 0,
                likesCount: m.stats.likesCount || 0,
                favoritesCount: m.stats.favoritesCount || 0
              }
            });
          }

          return upsertedManga; // Return for count
        });

        // Determine if it was created or updated based on some flag? 
        // Simply incrementing 'updated/created' based on existence check before transaction might be easier but less atomic.
        // We'll just count as success.
        results.updated++;
      } catch (err) {
        console.error(`Error importing manga ${m.slug}:`, err);
        results.errors++;
      }
    }

    res.json({ message: 'Importación completada', ...results });
  } catch (err) { next(err); }
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
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
        creatorId: req.user?.id,
        categories: { create: categoryIds.map((categoryId: string) => ({ categoryId })) },
        stats: { create: {} },
      },
      include: { categories: { include: { category: true } }, stats: true },
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const manga = await prisma.manga.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!manga) return res.status(404).json({ error: 'Not found' });

    // Si es EDITOR, solo puede borrar si es el creador
    if (user?.role === Role.EDITOR && manga.creatorId !== user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este manga' });
    }

    await prisma.manga.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

// Cambiar visibilidad del manga
router.patch('/:id/visibility', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isHidden } = z.object({ isHidden: z.boolean() }).parse(req.body);
    const manga = await prisma.manga.update({
      where: { id: req.params.id },
      data: { isHidden },
      select: { id: true, title: true, isHidden: true }
    });
    res.json(manga);
  } catch (err) { next(err); }
});

export default router;
