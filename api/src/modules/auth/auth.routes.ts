import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { registerSchema, loginSchema } from "./auth.schema";
import { isValidCPF, onlyDigits } from "../../shared/cpf";
import { UsersRepo } from "../users/user.repo";
import { AppError } from "../shared/errors";

export const authRoutes = Router();

authRoutes.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    if (!isValidCPF(body.cpf)) throw new AppError("CPF inválido", 400);

    const emailExists = await UsersRepo.findByEmail(body.email);
    if (emailExists) throw new AppError("E-mail já cadastrado", 409);

    const cpfExists = await UsersRepo.findByCPF(onlyDigits(body.cpf));
    if (cpfExists) throw new AppError("CPF já cadastrado", 409);

    const hash = await bcrypt.hash(body.password, 11);
    const user = await UsersRepo.create({
      full_name: body.fullName,
      email: body.email,
      cpf: onlyDigits(body.cpf),
      phone: body.phone ?? null,
      password_hash: hash,
    });

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET não configurado");
    if (!user) throw new Error("Erro ao criar usuário");
    const ttlMin = Number(process.env.TOKEN_TTL_MINUTES ?? 15);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: ttlMin * 60 } // segundos
    );

    return res.status(201).json({ accessToken: token });
  } catch (err) {
    next(err);
  }
});

authRoutes.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await UsersRepo.findByEmail(body.email);
    if (!user) throw new AppError("Credenciais inválidas", 401);

    const ok = await bcrypt.compare(body.password, user.password_hash);
    if (!ok) throw new AppError("Credenciais inválidas", 401);

    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET não configurado");
    const ttlMin = Number(process.env.TOKEN_TTL_MINUTES ?? 15);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: ttlMin * 60 }
    );

    return res.json({ accessToken: token });
  } catch (err) {
    next(err);
  }
});
