import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../shared/errors";

export type AuthUser = { sub: string; email: string };
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function ensureAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");
  if (!token) throw new AppError("Unauthorized", 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    req.user = { sub: payload.sub, email: (payload as any).email };
    return next();
  } catch {
    throw new AppError("Unauthorized", 401);
  }
}
