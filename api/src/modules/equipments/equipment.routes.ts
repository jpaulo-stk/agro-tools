import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import path from "node:path";
import { ensureAuth } from "../auth/ensure-auth";
import { upload } from "../../config/upload";
import { EquipmentRepo } from "./equipment.repo";
import {
  createEquipmentSchema,
  updateEquipmentSchema,
} from "./equipment.schema";
import { AppError } from "../shared/errors";

type IdParam = { id: string };
type IdPhotoParams = { id: string; photoId: string };

export const equipmentRoutes = Router();

function publicUrl(req: Request, filename: string) {
  const base =
    process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  const clean = filename.replace(/^\.?[/\\]+/, "");
  return `${base}/uploads/${path.basename(clean)}`;
}

const searchQuerySchema = z.object({
  city: z.string().min(1),
  type: z
    .enum(["colheitadeira", "trator", "pulverizador", "plantadeira"])
    .optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

equipmentRoutes.get("/search", async (req, res, next) => {
  try {
    const q = searchQuerySchema.parse(req.query);
    const result = await EquipmentRepo.search(q);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

equipmentRoutes.get("/", async (_req, res, next) => {
  try {
    const data = await EquipmentRepo.listAll(100);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

equipmentRoutes.get("/", async (req, res, next) => {
  try {
    const mine = req.query.mine === "1" || req.query.mine === "true";
    let ownerId: string | undefined;
    if (mine) {
      const auth = req.headers.authorization || "";
      if (!auth) throw new AppError("Unauthorized", 401);
    }
    if (mine && (req as any).user?.sub) ownerId = (req as any).user.sub;

    const list = await EquipmentRepo.list({ mineOwnerId: ownerId });
    // anexa fotos (1a foto como cover para a listagem)
    const ids = list.map((e) => e.id);
    const photos = ids.length
      ? await Promise.all(ids.map((id) => EquipmentRepo.photos(id)))
      : [];
    const firstById = new Map<string, string | null>();
    list.forEach((e, idx) => {
      const ph = photos[idx] || [];
      firstById.set(e.id, ph[0]?.url || null);
    });
    return res.json(list.map((e) => ({ ...e, cover: firstById.get(e.id) })));
  } catch (err) {
    next(err);
  }
});

equipmentRoutes.get("/:id", async (req: Request<IdParam>, res, next) => {
  try {
    const { id } = req.params;
    const detail = await EquipmentRepo.detailWithOwner(id);
    if (!detail) throw new AppError("Não encontrado", 404);
    return res.json(detail);
  } catch (err) {
    next(err);
  }
});

equipmentRoutes.post(
  "/",
  ensureAuth,
  upload.array("photos", 5),
  async (req, res, next) => {
    try {
      const body = createEquipmentSchema.parse(req.body);
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length)
        throw new AppError("Envie ao menos 1 foto (photos[])", 400);

      const equipment = await EquipmentRepo.create({
        owner_id: req.user!.sub,
        type: body.type,
        brand: body.brand,
        model: body.model,
        year: body.year ?? null,
        condition: body.condition,
        price: body.price.toFixed(2),
        city: body.city,
        state: body.state ?? null,
        description: body.description ?? null,
      });

      if (!equipment) throw new Error("Erro ao criar equipamento");

      const urls = files.map((f) => publicUrl(req, f.filename));
      const savedPhotos = await EquipmentRepo.addPhotos(equipment.id, urls);

      return res.status(201).json({ ...equipment, photos: savedPhotos });
    } catch (err) {
      next(err);
    }
  }
);

equipmentRoutes.patch(
  "/:id",
  ensureAuth,
  async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const patch = updateEquipmentSchema.parse(req.body);
      const updated = await EquipmentRepo.update(id, req.user!.sub, {
        ...patch,
        price:
          patch.price != null ? (patch.price.toFixed(2) as any) : undefined,
        year: patch.year ?? undefined,
      } as any);
      if (!updated) throw new AppError("Não encontrado / sem permissão", 404);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

equipmentRoutes.delete(
  "/:id",
  ensureAuth,
  async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ok = await EquipmentRepo.delete(id, req.user!.sub);
      if (!ok) throw new AppError("Não encontrado / sem permissão", 404);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

equipmentRoutes.post(
  "/:id/photos",
  ensureAuth,
  upload.array("photos", 5),
  async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) throw new AppError("Envie ao menos 1 foto", 400);

      const e = await EquipmentRepo.byId(id);
      if (!e || e.owner_id !== req.user!.sub)
        throw new AppError("Não encontrado / sem permissão", 404);

      const urls = files.map((f) => publicUrl(req, f.filename));
      const saved = await EquipmentRepo.addPhotos(id, urls);
      return res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }
);

equipmentRoutes.delete(
  "/:id/photos/:photoId",
  ensureAuth,
  async (req: Request<IdPhotoParams>, res: Response, next: NextFunction) => {
    try {
      const { id, photoId } = req.params;
      const e = await EquipmentRepo.byId(id);
      if (!e || e.owner_id !== req.user!.sub)
        throw new AppError("Não encontrado / sem permissão", 404);
      const ok = await EquipmentRepo.deletePhoto(id, photoId);
      if (!ok) throw new AppError("Foto não encontrada", 404);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
