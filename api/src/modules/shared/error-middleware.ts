import { Request, Response, NextFunction } from "express";
import { AppError } from "./errors";
import { ZodError } from "zod";

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erros de domínio
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Erros de validação (Zod)
  if (err instanceof ZodError) {
    const msg =
      err.issues?.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") ||
      "Dados inválidos";
    return res.status(400).json({ error: msg });
  }

  // Erros do Postgres (duplicidade)
  if (err?.code === "23505") {
    // tenta adivinhar qual campo
    const detail = String(err.detail || "").toLowerCase();
    if (detail.includes("email"))
      return res.status(409).json({ error: "E-mail já cadastrado" });
    if (detail.includes("cpf"))
      return res.status(409).json({ error: "CPF já cadastrado" });
    return res.status(409).json({ error: "Registro duplicado" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
