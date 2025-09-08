import { Router } from "express";
import { z } from "zod";
import { UsersRepo, type UserRow } from "./user.repo";
import { ensureAuth } from "../auth/ensure-auth";
import { AppError } from "../shared/errors";

export const userRoutes = Router();

userRoutes.get("/me", ensureAuth, async (req, res, next) => {
  try {
    const u = await UsersRepo.findById(req.user!.sub);
    if (!u) throw new AppError("Usuário não encontrado", 404);
    return res.json({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      cpf: u.cpf,
      phone: u.phone,
      created_at: u.created_at,
    });
  } catch (err) {
    next(err);
  }
});

const updateMeSchema = z.object({
  full_name: z.string().trim().min(3, "Mínimo 3 caracteres").optional(),
  phone: z.string().trim().min(8, "Telefone inválido").optional().nullable(),
});

userRoutes.patch("/me", ensureAuth, async (req, res, next) => {
  try {
    const body = updateMeSchema.parse(req.body);

    const patch: Partial<Pick<UserRow, "full_name" | "phone">> = {};
    if (typeof body.full_name === "string") patch.full_name = body.full_name;
    if (body.phone !== undefined) patch.phone = body.phone ?? null;

    if (Object.keys(patch).length === 0) {
      const current = await UsersRepo.findById(req.user!.sub);
      if (!current) throw new AppError("Usuário não encontrado", 404);
      return res.json({
        id: current.id,
        full_name: current.full_name,
        email: current.email,
        cpf: current.cpf,
        phone: current.phone,
        created_at: current.created_at,
      });
    }

    const updated = await UsersRepo.update(req.user!.sub, patch);
    if (!updated) throw new AppError("Usuário não encontrado", 404);

    return res.json({
      id: updated.id,
      full_name: updated.full_name,
      email: updated.email,
      cpf: updated.cpf,
      phone: updated.phone,
      created_at: updated.created_at,
    });
  } catch (err) {
    next(err);
  }
});
