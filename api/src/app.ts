import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "node:path";
import { authRoutes } from "./modules/auth/auth.routes";
import { errorMiddleware } from "./modules/shared/error-middleware";
import { equipmentRoutes } from "./modules/equipments/equipment.routes";
import { userRoutes } from "./modules/users/user.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

const uploadsDir = process.env.UPLOADS_DIR || "uploads";
app.use("/uploads", express.static(path.resolve(uploadsDir)));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);

app.use(errorMiddleware);

app.use("/uploads", express.static(path.resolve(uploadsDir)));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/equipments", equipmentRoutes);
app.use("/users", userRoutes);

app.use(errorMiddleware);

export { app };
