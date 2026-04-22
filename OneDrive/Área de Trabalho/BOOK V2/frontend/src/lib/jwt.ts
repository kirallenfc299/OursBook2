import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'oursbook-jwt-secret-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  is_admin: boolean;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload;
}
