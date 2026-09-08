import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const measurement_types = mysqlTable("measurement_types", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  unit: varchar({ length: 255 }).notNull(),
});
