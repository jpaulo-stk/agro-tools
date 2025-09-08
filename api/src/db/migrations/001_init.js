/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // Extensões (idempotente; se já existem, ok)
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS citext;`);
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Enum do tipo de equipamento
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
        CREATE TYPE equipment_type AS ENUM ('colheitadeira','trator','pulverizador','plantadeira');
      END IF;
    END$$;
  `);

  // Tabela de usuários
  await knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("full_name").notNullable();
    t.specificType("email", "citext").notNullable().unique();
    t.string("cpf", 11).notNullable().unique();
    t.string("phone", 20);
    t.text("password_hash").notNullable();
    t.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  // Tabela de equipamentos
  await knex.schema.createTable("equipments", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("owner_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    t.enu("type", ["colheitadeira", "trator", "pulverizador", "plantadeira"], {
      useNative: true,
      enumName: "equipment_type",
      existingType: true,
    }).notNullable();
    t.text("brand").notNullable();
    t.text("model").notNullable();
    t.integer("year");
    t.text("condition").notNullable();
    t.decimal("price", 10, 2).notNullable();
    t.text("city").notNullable();
    t.string("state", 2);
    t.text("description");
    t.boolean("is_active").defaultTo(true);
    t.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("equipment_photos", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("equipment_id")
      .notNullable()
      .references("id")
      .inTable("equipments")
      .onDelete("CASCADE");
    t.text("url").notNullable();
    t.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_equipments_city ON equipments(LOWER(city));`
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_equipments_type ON equipments(type);`
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_equipments_price ON equipments(price);`
  );
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("equipment_photos");
  await knex.schema.dropTableIfExists("equipments");
  await knex.schema.dropTableIfExists("users");
  await knex.raw(`DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_type') THEN
        DROP TYPE equipment_type;
      END IF;
    END$$;`);
};
