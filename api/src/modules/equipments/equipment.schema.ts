import { z } from "zod";

export const equipmentTypeEnum = z.enum([
  "colheitadeira",
  "trator",
  "pulverizador",
  "plantadeira",
]);

export const createEquipmentSchema = z.object({
  type: equipmentTypeEnum,
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  condition: z.string().min(1),
  price: z.coerce.number().positive(),
  city: z.string().min(1),
  state: z.string().length(2).optional(),
  description: z.string().optional(),
});

export const updateEquipmentSchema = createEquipmentSchema.partial();
