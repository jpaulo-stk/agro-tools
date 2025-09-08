import { knex } from "../../db/knex";

export type User = {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  phone?: string | null;
  password_hash: string;
  created_at: string;
};

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  phone: string | null;
  password_hash: string;
  created_at: string;
};

export const UsersRepo = {
  findByEmail(email: string) {
    return knex<User>("users").whereRaw("email = ?", [email]).first();
  },
  findByCPF(cpf: string) {
    return knex<User>("users").where({ cpf }).first();
  },
  create(data: Omit<User, "id" | "created_at">) {
    return knex<User>("users")
      .insert(data)
      .returning("*")
      .then((r) => r[0]);
  },
  findById(id: string) {
    return knex<UserRow>("users").where({ id }).first();
  },
  update(id: string, patch: Partial<Pick<UserRow, "full_name" | "phone">>) {
    return knex<UserRow>("users")
      .where({ id })
      .update(patch)
      .returning("*")
      .then((r) => r[0]);
  },
};
