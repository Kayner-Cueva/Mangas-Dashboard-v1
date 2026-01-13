import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'EDITOR', 'USER']).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const generateTokens = async (userId: string, role: Role) => {
  const accessToken = jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET || 'dev_access',
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.REFRESH_TOKEN_SECRET || 'dev_refresh',
    { expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d` }
  );

  // Store refresh token in DB
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = RegisterSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || Role.EDITOR // Default to EDITOR if not specified
      }
    });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'dev_refresh') as any;
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    if (!dbToken.user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Generate ONLY a new access token (Stable Refresh Token approach)
    const accessToken = jwt.sign(
      { sub: dbToken.user.id, role: dbToken.user.role },
      process.env.JWT_SECRET || 'dev_access',
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    res.json({
      accessToken,
      user: { id: dbToken.user.id, email: dbToken.user.email, role: dbToken.user.role }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() }
    });
  }
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});

export default router;
