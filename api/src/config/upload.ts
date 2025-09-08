import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const UPLOADS_DIR = process.env.UPLOADS_DIR || "uploads";
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^\w.-]+/g, "_");
    cb(
      null,
      `${Date.now()}_${Math.random().toString(36).slice(2)}_${base}${ext}`
    );
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB, máx 5 fotos
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});
