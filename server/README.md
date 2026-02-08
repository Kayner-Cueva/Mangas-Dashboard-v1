# Manga Dashboard Server

> [!IMPORTANT]
> **Prisma Usage & Versioning**
> 
> This project uses **Prisma v5**. If you run `npx prisma` from the project root, it may default to Prisma v7, causing validation errors (like P1012).
> 
> **Always run Prisma commands from the `server` directory:**
> ```bash
> cd server
> npm run prisma:migrate  # To apply migrations
> npm run prisma:generate # To update the client
> ```

Backend (server) for mangas-dashboard

Prerequisites
- Node.js >= 18
- PostgreSQL running locally (you can manage with PgAdmin 4)

Setup
1) cd server
2) Copy .env.example to .env and set DATABASE_URL and JWT_SECRET
3) Install deps: npm install
4) Initialize Prisma client and DB:
   - npx prisma generate
   - npx prisma migrate dev --name init
5) Run dev server:
   - npm run dev
   API at http://localhost:4000

Database schema
- Users, Categories, Mangas, Chapters, ChapterPages, Stats, UserMangaInteraction.
- See prisma/schema.prisma

Migrations
- Dev: npm run prisma:migrate (prompts for name; or add --name <name>)
- Prod: npm run prisma:deploy

Routes
- GET /health
- /api/auth: POST /login, POST /register
- /api/categories: GET, POST, PUT/:id, DELETE/:id
- /api/mangas: GET, GET/:id, POST, PUT/:id, DELETE/:id
- /api/chapters: GET/manga/:mangaId, GET/:id, POST/manga/:mangaId, PUT/:id, DELETE/:id
- /api/stats: GET /summary, POST /manga/:mangaId/views|likes|favorites

Link frontend
- En tu frontend, cambia src/services/* para llamar al backend en http://localhost:4000
- Puedes crear una variable de entorno VITE_API_URL y usarla en los services.
