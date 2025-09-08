import { knex } from "../../db/knex";

export type Equipment = {
  id: string;
  owner_id: string;
  type: "colheitadeira" | "trator" | "pulverizador" | "plantadeira";
  brand: string;
  model: string;
  year: number | null;
  condition: string;
  price: string;
  city: string;
  state: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type Photo = {
  id: string;
  equipment_id: string;
  url: string;
  created_at: string;
};

export const EquipmentRepo = {
  create(data: Omit<Equipment, "id" | "created_at" | "is_active">) {
    return knex<Equipment>("equipments")
      .insert(data)
      .returning("*")
      .then((r) => r[0]);
  },
  addPhotos(equipmentId: string, urls: string[]) {
    if (!urls.length) return Promise.resolve<Photo[]>([]);
    const rows = urls.map((url) => ({ equipment_id: equipmentId, url }));
    return knex<Photo>("equipment_photos").insert(rows).returning("*");
  },
  byId(id: string) {
    return knex<Equipment>("equipments").where({ id }).first();
  },
  photos(id: string) {
    return knex<Photo>("equipment_photos")
      .where({ equipment_id: id })
      .orderBy("created_at", "desc");
  },
  list(params: { mineOwnerId?: string | undefined }) {
    const q = knex<Equipment>("equipments")
      .where({ is_active: true })
      .orderBy("created_at", "desc");
    if (params.mineOwnerId) q.andWhere("owner_id", params.mineOwnerId);
    return q;
  },
  update(id: string, ownerId: string, patch: Partial<Equipment>) {
    return knex<Equipment>("equipments")
      .where({ id, owner_id: ownerId })
      .update(patch)
      .returning("*")
      .then((r) => r[0]);
  },
  delete(id: string, ownerId: string) {
    return knex<Equipment>("equipments").where({ id, owner_id: ownerId }).del();
  },
  deletePhoto(equipmentId: string, photoId: string) {
    return knex<Photo>("equipment_photos")
      .where({ id: photoId, equipment_id: equipmentId })
      .del();
  },
  async search(params: {
    city: string;
    type?:
      | "colheitadeira"
      | "trator"
      | "pulverizador"
      | "plantadeira"
      | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
  }): Promise<{
    data: (Equipment & { cover: string | null })[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));
    const off = (page - 1) * pageSize;

    const q = knex<Equipment>("equipments")
      .where({ is_active: true })
      .andWhereRaw("LOWER(city) = LOWER(?)", [params.city])
      .modify((b) => {
        if (params.type) b.andWhere("type", params.type);
        if (params.minPrice != null) b.andWhere("price", ">=", params.minPrice);
        if (params.maxPrice != null) b.andWhere("price", "<=", params.maxPrice);
      });

    const countRows = await q
      .clone()
      .count<{ count: string }[]>({ count: "*" });
    const total = Number(countRows[0]?.count ?? 0);

    const data: Equipment[] = await q
      .clone()
      .orderBy("created_at", "desc")
      .limit(pageSize)
      .offset(off);

    const ids: string[] = data.map((e: Equipment) => e.id);
    const photosPerItem: Photo[][] = ids.length
      ? await Promise.all(
          ids.map((id: string) =>
            knex<Photo>("equipment_photos")
              .where({ equipment_id: id })
              .orderBy("created_at", "desc")
              .limit(1)
          )
        )
      : [];

    const coverById = new Map<string, string | null>();
    data.forEach((e: Equipment, i: number) => {
      coverById.set(e.id, photosPerItem[i]?.[0]?.url ?? null);
    });

    return {
      data: data.map((e: Equipment) => ({
        ...e,
        cover: coverById.get(e.id) ?? null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  },
  async detailWithOwner(
    id: string
  ): Promise<
    (Equipment & { owner_phone: string | null; photos: Photo[] }) | null
  > {
    const row = (await knex("equipments as e")
      .leftJoin("users as u", "u.id", "e.owner_id")
      .select("e.*", knex.raw("u.phone as owner_phone"))
      .where("e.id", id)
      .first()) as (Equipment & { owner_phone: string | null }) | undefined;

    if (!row) return null;

    const photos: Photo[] = await knex<Photo>("equipment_photos")
      .where({ equipment_id: id })
      .orderBy("created_at", "desc");

    return { ...row, photos };
  },
  async listAll(limit = 100) {
    const rows: Equipment[] = await knex<Equipment>("equipments")
      .where({ is_active: true })
      .orderBy("created_at", "desc")
      .limit(limit);

    const ids = rows.map((r) => r.id);
    const covers = new Map<string, string | null>();
    if (ids.length) {
      const per = await Promise.all(
        ids.map((id) =>
          knex<Photo>("equipment_photos")
            .where({ equipment_id: id })
            .orderBy("created_at", "desc")
            .limit(1)
        )
      );
      rows.forEach((r, i) => covers.set(r.id, per[i]?.[0]?.url || null));
    }
    return rows.map((r) => ({ ...r, cover: covers.get(r.id) ?? null }));
  },
};
