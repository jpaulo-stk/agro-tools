import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11).max(14), // aceita com máscara; validação forte no backend
  phone: z.string().optional(),
  password: z.string().min(6),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDTO = z.infer<typeof loginSchema>;
